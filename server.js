import express from 'express';
import cors from 'cors';
import data from "./data/sampleLyricResponse.json" with { type: 'json' };
import commonWordList from "./data/filterWordsList.json" with { type: 'json' };
import getArtistId from "./services/getArtistId.js";
import getAlbumsByArtist from "./services/getAlbumsByArtist.js";
import getSongListByAlbum from "./services/getSongListByAlbum.js";
import getReleasesByReleaseGroup from "./services/getReleasesByReleaseGroup.js";

const app = express();
const PORT = process.env.PORT || 5000;
let env = "dev1";

app.use(cors());
app.use(express.json());

async function LyricAnalyzer(song, artist) {
    console.log("Looking up some lyrics...");

    let url = `https://api.lyrics.ovh/v1/${artist}/${song}`;
    let result = {};

    if (env === "dev") {
        console.log("Using dev environment, using mock data");
        result = data;
    } else {
        console.log("Calling API for: ", url);
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            result = await response.json();
        } catch (error) {
            console.error("Error fetching lyrics:", error);
            return {};
        }
    }

    let wordMap = {};

    if (result.lyrics === undefined) {
        console.log("No lyrics found for: ", song, " by ", artist);
        return wordMap;
    }
    let lyrics = result.lyrics.replace(/\n/g, ' ').replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, '').toLowerCase().split(' ');
    for (let word of lyrics) {
        if (word.trim() !== '') {
            if (wordMap[word]) {
                wordMap[word]++;
            } else {
                wordMap[word] = 1;
            }
        }
    }

    for (let commonWord of commonWordList) {
        delete wordMap[commonWord];
    }

    return wordMap;
}

async function createWordMapFromAllSongs(songList, artist) {
    let songWordMaps = {};
    for (let song of songList) {
        let title = song;
        try {
            let wordMap = await LyricAnalyzer(title, artist);
            songWordMaps[title] = wordMap;
        } catch (error) {
            console.error(`Error analyzing lyrics for ${title}:`, error);
        }
    }

    let combinedWordMap = {};
    for (let title in songWordMaps) {
        let wordMap = songWordMaps[title];
        for (let word in wordMap) {
            if (combinedWordMap[word]) {
                combinedWordMap[word] += wordMap[word];
            } else {
                combinedWordMap[word] = wordMap[word];
            }
        }
    }

    const sortedMap = new Map([...Object.entries(combinedWordMap)].sort((a, b) => b[1] - a[1]));
    return sortedMap;
}

async function getAlbumInfo(artist) {
    try {
        let artistId = await getArtistId(artist);
        console.log("artistId: ", artistId);

        if (!artistId) {
            throw new Error("Artist not found");
        }

        let albums = await getAlbumsByArtist(artistId);
        console.log("albums: ", albums);

        let releaseIds = [];
        for (let album of albums) {
            let releaseId = await getReleasesByReleaseGroup(album);
            if (releaseId !== null) {
                releaseIds.push(releaseId);
            }
        }
        console.log("releaseIds: ", releaseIds);

        let songList = [];
        for (let releaseId of releaseIds) {
            let songs = await getSongListByAlbum(releaseId);
            songList.push(...songs);
        }
        console.log("songs: ", songList);

        return songList;
    } catch (error) {
        console.error("Error getting album info:", error);
        throw error;
    }
}

// API endpoint for lyric analysis
app.post('/api/analyze', async (req, res) => {
    try {
        const { artist } = req.body;
        
        if (!artist) {
            return res.status(400).json({ error: 'Artist name is required' });
        }

        console.log(`Analyzing lyrics for artist: ${artist}`);
        
        // Get song list for the artist
        const trackList = await getAlbumInfo(artist);
        
        if (!trackList || trackList.length === 0) {
            return res.status(404).json({ error: 'No songs found for this artist' });
        }

        // Create word map from all songs
        const wordMap = await createWordMapFromAllSongs(trackList, artist);
        
        // Convert to array and get top 20
        const top20 = [...wordMap].slice(0, 20);
        
        res.json({
            artist,
            totalSongs: trackList.length,
            topWords: top20
        });
    } catch (error) {
        console.error('Analysis error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'Server is running' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
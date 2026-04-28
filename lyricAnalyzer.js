import data from "./sampleLyricResponse.json" with { type: 'json' };
import commonWordList from "./filterWordsList.json" with { type: 'json' };
// import songList from "./songList.json" with { type: 'json' };
import getArtistId from "./services/getArtistId.js";
import getAlbumsByArtist from "./services/getAlbumsByArtist.js";
import getSongListByAlbum from "./services/getSongListByAlbum.js";
import getReleasesByReleaseGroup from "./services/getReleasesByReleaseGroup.js";
let env = "dev1";

async function LyricAnalyzer(song, artist) {
    console.log("Looking up some lyrics...");

    // let artist = "Olivia Rodrigo";
    // let song = "Drop Dead";
    let url = `https://api.lyrics.ovh/v1/${artist}/${song}`;
    let result = {};

    if (env === "dev") {
        console.log("Using dev environment, using mock data");
        result = data;
    } else {
        console.log("Calling API for: ", url);
        const response = await fetch(url, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        result = await response.json();
    }

    // Use the result and make a word map of the lyrics
    let wordMap = {};

    // remove all \n and punctuation, then split by spaces
    if (result.lyrics === undefined) {
        console.log("No lyrics found for: ", song, " by ", artist);
        return wordMap;
    }
    let lyrics = result.lyrics.replace(/\n/g, ' ').replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, '').toLowerCase().split(' ');
    for (let word of lyrics) {
        if (wordMap[word]) {
            wordMap[word]++;
        } else {
            wordMap[word] = 1;
        }
    }

    // console.log(wordMap);

    // remove the common words from the word map using commonWordList
    for (let commonWord of commonWordList) {
        delete wordMap[commonWord];
    }

    // const sortedMap = new Map([...Object.entries(wordMap)].sort((a, b) => b[1] - a[1]));
    // console.log(sortedMap);
    return wordMap;
}

// await LyricAnalyzer();

// for every song in the song list make a call to LyricAnalyzer and store the result in a map.
async function createWordMapFromAllSongs(songList, artist) {
    let songWordMaps = {};
    for (let song of songList) {
        let title = song;
        await LyricAnalyzer(title, artist).then(wordMap => {
            songWordMaps[title] = wordMap;
        });
    }
    // console.log(songWordMaps);

    // combine all words in SongWordMaps into a single map with the total count of each word across all songs.
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
    // console.log(sortedMap);

    // console.log the top 20 words in the sorted map.
    console.log(new Map([...sortedMap].slice(0, 20)));

    // console.log everything with a count of 1
    console.log(new Map([...sortedMap].filter(([word, count]) => count === 2)));

    return sortedMap;
}

async function getAlbumInfo(artist) {

    let artistId = await getArtistId(artist);
    console.log("artistId: ", artistId);

    let albums = await getAlbumsByArtist(artistId);
    console.log("albums: ", albums);

    // for each album in albums get the release id using getReleasesByReleaseGroup and log it.
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
}

let artist = "Sombr";
let trackList = await getAlbumInfo(artist);
await createWordMapFromAllSongs(trackList, artist);
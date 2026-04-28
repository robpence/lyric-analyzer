async function getSongListByAlbum(albumId) {

    let url = `https://musicbrainz.org/ws/2/release/${albumId}?inc=recordings&fmt=json`;
    let result = {};

    console.log("Calling API for: ", url);
    const response = await fetch(url, {
        method: 'GET',
        headers: { 
            'Content-Type': 'application/json', 
            'User-Agent': 'LyricAnalyzer/1.0 (flirtatiousnudibranch@gmail.com)'
        }
    });
    result = await response.json();

    // extract the list of recordings (songs) from the result and return it.
    if (result.media && result.media.length > 0) {
        let recordings = [];
        for (let medium of result.media) {
            if (medium.tracks && medium.tracks.length > 0) {
                for (let track of medium.tracks) {
                    recordings.push(track.title);
                }
            }
        }
        console.log("Recordings for album: ", albumId, recordings);
        return recordings;
    } else {
        console.log("No recordings found for album: ", albumId);
        return [];
    }
}

export default getSongListByAlbum;
async function getArtistId(artistName) {

    let url = `https://musicbrainz.org/ws/2/artist/?query=artist:${encodeURIComponent(artistName)}&fmt=json`;
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

    // extract the id of the first artist in the result and return it.
    if (result.artists && result.artists.length > 0) {
        return result.artists[0].id;
    } else {
        console.log("No artist found for: ", artistName);
        return null;
    }
}

export default getArtistId;
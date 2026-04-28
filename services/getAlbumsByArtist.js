async function getAlbumsByArtist(artistId) {
    let url = `https://musicbrainz.org/ws/2/release-group?artist=${artistId}&type=album&fmt=json`;
    let albums = {};

    console.log("Calling API for: ", url);
    const response = await fetch(url, {
        method: 'GET',
        headers: { 
            'Content-Type': 'application/json', 
            'User-Agent': 'LyricAnalyzer/1.0 (flirtatiousnudibranch@gmail.com)'
        }
    });
    albums = await response.json();
    console.log(albums);

    // loop through albums and check if "secondary-types": [] is empty, if it is, then it's a main album and we can log the title and release date.
    // also make sure the album has been released by checking if the release date is in the past.
    let mainAlbumIds = [];
    for (let album of albums["release-groups"]) {
        if (album["secondary-types"].length === 0 && new Date(album["first-release-date"]) < new Date()) {
            console.log("Main album: ", album.title, " Release date: ", album["first-release-date"]);
            mainAlbumIds.push(album.id);
        }
    }
    return mainAlbumIds;
}

export default getAlbumsByArtist;
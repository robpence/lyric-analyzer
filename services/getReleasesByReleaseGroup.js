// https://musicbrainz.org/ws/2/release-group/2ae2e504-7116-4b4f-b632-9748bb18ccd2?inc=releases&type=album&status=official&country=US&fmt=json

async function getReleasesByReleaseGroup(id) {

    let url = `https://musicbrainz.org/ws/2/release-group/${id}?inc=releases&type=album&status=official&country=US&fmt=json`;
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

    // console.log(result);

    // return the US release
    if (result.releases && result.releases.length > 0) {
        for (let release of result.releases) {
            if (release.country === "US") {
                return release.id;
            }
        }
        // if no US release is found, return the first release
        if (result.releases.length > 0) {
            return result.releases[0].id;
        }
    } else {
        console.log("No releases found for: ", id);
        return null;
    }
}

export default getReleasesByReleaseGroup;
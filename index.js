import dotenv from "dotenv";

dotenv.config();

const LASTFM_API_KEY = process.env.LASTFM_API_KEY;
const LASTFM_RECENT_URL = `http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=vladsolomon&api_key=${LASTFM_API_KEY}&limit=1&page=1&format=json`;

async function getRecentTrack() {
    const response = await fetch(LASTFM_RECENT_URL);
    const data = await response.json();
    const recentTrack = data.recenttracks.track[0];
    return {
        title: recentTrack.name,
        artist: recentTrack.artist["#text"],
        url: recentTrack.url,
        live: recentTrack["@attr"]?.nowplaying === "true" ? true : false,
    };
}

const recentTrack = await getRecentTrack();
console.log(recentTrack);

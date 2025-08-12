import dotenv from "dotenv";
import { Octokit } from "@octokit/rest";

dotenv.config();

const LASTFM_API_KEY = process.env.LASTFM_API_KEY;
const LASTFM_RECENT_URL = `http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=vladsolomon&api_key=${LASTFM_API_KEY}&limit=1&page=1&format=json`;
const GITHUB_TOKEN = process.env.GH_TOKEN;
const GIST_ID = process.env.GIST_ID;

const octokit = new Octokit({
    auth: GITHUB_TOKEN,
});

async function getRecentTrack() {
    try {
        const response = await fetch(LASTFM_RECENT_URL);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (
            !data.recenttracks ||
            !data.recenttracks.track ||
            data.recenttracks.track.length === 0
        ) {
            throw new Error("No recent tracks found in API response");
        }

        const recentTrack = data.recenttracks.track[0];

        if (
            !recentTrack.name ||
            !recentTrack.artist ||
            !recentTrack.artist["#text"]
        ) {
            throw new Error("Invalid track data in API response");
        }

        return {
            title: recentTrack.name,
            artist: recentTrack.artist["#text"],
            url: recentTrack.url,
            live: recentTrack["@attr"]?.nowplaying === "true" ? true : false,
        };
    } catch (error) {
        console.error("Error fetching recent track:", error.message);
        return null;
    }
}

function centerText(text, maxWidth = 50) {
    const totalPadding = maxWidth - text.length;
    const rightPadding = Math.floor(totalPadding / 2);
    const leftPadding = totalPadding - rightPadding;
    const leftPad = " ".repeat(leftPadding);
    const rightPad = " ".repeat(rightPadding);
    return leftPad + text + rightPad;
}

function wrapTitle(title, maxWidth = 50) {
    if (title.length <= maxWidth) {
        return [centerText(title, maxWidth)];
    }

    const words = title.split(" ");
    const targetLength = Math.ceil(title.length / 2);

    let firstLine = "";
    let secondLine = "";

    for (let i = 0; i < words.length; i++) {
        const testFirstLine = (firstLine + " " + words[i]).trim();
        const remainingWords = words.slice(i + 1).join(" ");

        if (
            testFirstLine.length <= maxWidth &&
            remainingWords.length <= maxWidth
        ) {
            if (
                testFirstLine.length <= remainingWords.length ||
                testFirstLine.length <= targetLength
            ) {
                firstLine = testFirstLine;
                secondLine = remainingWords;
            } else {
                break;
            }
        } else if (testFirstLine.length <= maxWidth) {
            firstLine = testFirstLine;
        } else {
            break;
        }
    }

    if (!secondLine) {
        secondLine = words.slice(firstLine.split(" ").length).join(" ");
    }

    return [centerText(firstLine, maxWidth), centerText(secondLine, maxWidth)];
}

async function getCurrentGistContent() {
    try {
        const response = await octokit.rest.gists.get({
            gist_id: GIST_ID,
        });

        return response.data.files["listening.js"]?.content || "";
    } catch (error) {
        console.error("Error fetching current gist:", error.message);
        return null;
    }
}

function generateContent(trackData) {
    const status = trackData.live ? "listening to" : "last listened to";
    const artist = `by ${trackData.artist}`;

    const centeredStatus = centerText(status);
    const wrappedTitle = wrapTitle(trackData.title);
    const centeredArtist = centerText(artist);

    return `
${centeredStatus}
${wrappedTitle.join("\n")}
${centeredArtist}


`;
}

async function updateGist(trackData) {
    try {
        const currentContent = await getCurrentGistContent();

        if (currentContent === null) {
            console.log(
                "Failed to fetch current gist content, skipping update"
            );
            return null;
        }

        const newContent = generateContent(trackData);

        // Compare content - if they're the same, don't update
        if (currentContent === newContent) {
            console.log("Content unchanged, skipping gist update");
            return { unchanged: true };
        }

        const response = await octokit.rest.gists.update({
            gist_id: GIST_ID,
            files: {
                "listening.js": {
                    content: newContent,
                },
            },
        });

        console.log(`Gist updated successfully: ${response.data.html_url}`);
        return response.data;
    } catch (error) {
        console.error("Error updating gist:", error.message);
        return null;
    }
}

const recentTrack = await getRecentTrack();

if (recentTrack) {
    console.log(recentTrack);
    const gist = await updateGist(recentTrack);
    if (gist) {
        if (gist.unchanged) {
            console.log("No update needed - content is the same");
        } else {
            console.log("Successfully updated now playing status");
        }
    }
} else {
    console.log(
        "Failed to fetch recent track, skipping gist update to prevent overwriting"
    );
}

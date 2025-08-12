# Listening

Automatically updates a GitHub gist with current Last.fm listening status.

## How it works

Fetches the most recent track from Last.fm API and updates a public GitHub gist with the current listening status. The gist shows whether you're currently listening or last listened to a track, along with the song title and artist.

## Features

-   Runs on user-configurable cron schedule
-   Handles long song titles with smart text wrapping
-   Centers text within 50 character width
-   Shows live listening status vs last played

## Setup

1. Create a Last.fm API key
2. Create a GitHub personal access token with gist permissions
3. Create a public gist on GitHub
4. Set environment variables:
    - `LASTFM_API_KEY`
    - `GH_TOKEN`
    - `GIST_ID`
5. Deploy to a server and configure a cron job to run at your desired interval (e.g., `*/10 * * * * node index.js` for every 10 minutes)

## Local development

```bash
npm install
npm start
```

Requires `.env` file with the same environment variables as the repository secrets.

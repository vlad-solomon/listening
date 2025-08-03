# Listening

Automatically updates a GitHub gist with current Last.fm listening status.

## How it works

Fetches the most recent track from Last.fm API and updates a public GitHub gist with the current listening status. The gist shows whether you're currently listening or last listened to a track, along with the song title and artist.

## Features

-   Updates every 10 minutes via GitHub Actions
-   Handles long song titles with smart text wrapping
-   Centers text within 50 character width
-   Shows live listening status vs last played

## Setup

1. Create a Last.fm API key
2. Create a GitHub personal access token with gist permissions
3. Create a public gist on GitHub
4. Add repository secrets:
    - `LASTFM_API_KEY`
    - `GH_TOKEN`
    - `GIST_ID`
5. Push the workflow file to enable automatic updates

## Local development

```bash
npm install
npm start
```

Requires `.env` file with the same environment variables as the repository secrets.

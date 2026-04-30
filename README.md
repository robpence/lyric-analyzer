# Lyric Analyzer React App

A React frontend application for analyzing song lyrics by artist, showing the most common words used across all their songs.

## Features

- 🎵 Input field for artist name
- 📊 Analyzes all songs by the artist
- 🏆 Displays top 20 most common words
- 📱 Responsive design
- ⚡ Real-time results

## Setup & Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the application:**
   ```bash
   npm run dev
   ```
   This will start both the backend server (port 5000) and React frontend (port 3000).

   Or run them separately:
   ```bash
   # Terminal 1 - Backend server
   npm run server
   
   # Terminal 2 - React frontend
   npm start
   ```

3. **Open your browser:**
   Navigate to `http://localhost:3000`

## How to Use

1. Enter an artist name in the input field
2. Click "Analyze Lyrics" 
3. Wait for the analysis to complete (this may take a moment as it fetches song data and lyrics)
4. View the top 20 most common words with frequency counts

## Architecture

- **Frontend:** React application with modern UI
- **Backend:** Express.js server that handles lyric fetching and analysis
- **APIs Used:** 
  - MusicBrainz API for artist/album data
  - Lyrics.ovh API for song lyrics

## Files Structure

```
├── src/
│   ├── App.js          # Main React component
│   ├── App.css         # Styling
│   ├── index.js        # React entry point
│   └── index.css       # Global styles
├── public/
│   └── index.html      # HTML template
├── server.js           # Express backend server
├── package.json        # Dependencies and scripts
└── README.md          # This file
```

## Notes

- The application filters out common words (the, and, is, etc.) to show more meaningful results
- Analysis time depends on the number of songs by the artist
- Some artists may not be found if they're not in the MusicBrainz database
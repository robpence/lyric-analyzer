import React, { useState } from 'react';
import './App.css';

function App() {
  const [artist, setArtist] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!artist.trim()) {
      setError('Please enter an artist name');
      return;
    }

    setLoading(true);
    setError('');
    setResults(null);

    try {
      const response = await fetch('http://localhost:5000/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ artist: artist.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze lyrics');
      }

      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🎵 Lyric Analyzer</h1>
        <p>Discover the most common words in your favorite artist's lyrics</p>
      </header>
      
      <main className="App-main">
        <form onSubmit={handleSubmit} className="search-form">
          <div className="input-group">
            <input
              type="text"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              placeholder="Enter artist name (e.g., Taylor Swift, Ed Sheeran)"
              className="artist-input"
              disabled={loading}
            />
            <button 
              type="submit" 
              className="analyze-button"
              disabled={loading || !artist.trim()}
            >
              {loading ? 'Analyzing...' : 'Analyze Lyrics'}
            </button>
          </div>
        </form>

        {error && (
          <div className="error-message">
            <p>❌ {error}</p>
          </div>
        )}

        {loading && (
          <div className="loading">
            <div className="spinner"></div>
            <p>Fetching songs and analyzing lyrics...</p>
          </div>
        )}

        {results && (
          <div className="results">
            <div className="results-header">
              <h2>📊 Analysis Results for "{results.artist}"</h2>
              <p>Analyzed {results.totalSongs} songs</p>
            </div>
            
            <div className="top-words">
              <h3>🏆 Top 20 Most Common Words</h3>
              <div className="word-list">
                {results.topWords.map(([word, count], index) => (
                  <div key={word} className="word-item">
                    <span className="rank">#{index + 1}</span>
                    <span className="word">{word}</span>
                    <span className="count">{count} times</span>
                    <div 
                      className="frequency-bar" 
                      style={{
                        width: `${(count / results.topWords[0][1]) * 100}%`
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
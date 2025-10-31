import React from "react";
import "./FocusTimer.css";

const FocusTimer = ({
  ringStyle,
  timerMinutes,
  timerSeconds,
  isTimerRunning,
  startTimer,
  pauseTimer,
  resetTimer,
  musicPlaying,
  toggleMusic,
  musicVolume,
  setMusicVolume,
  musicTrack,
  audioRef,
}) => {
  return (
    <div className="center-timer">
      <h3 className="timer-title">Focus Timer</h3>
      <div className="timer-circle" style={ringStyle}>
        <div className="timer-inner-circle">
          <div className="timer-display">
            {String(timerMinutes).padStart(2, '0')}:{String(timerSeconds).padStart(2, '0')}
          </div>
          <div className="timer-status">
            {isTimerRunning ? 'Running' : 'Paused'}
          </div>
        </div>
      </div>
      <div className="timer-controls">
        <button 
          className="timer-btn start-btn" 
          onClick={startTimer}
          disabled={isTimerRunning}
          title="Start Timer"
        >
          ▶️
        </button>
        <button 
          className="timer-btn pause-btn" 
          onClick={pauseTimer}
          disabled={!isTimerRunning}
          title="Pause Timer"
        >
          ⏸️
        </button>
        <button 
          className="timer-btn reset-btn" 
          onClick={resetTimer}
          title="Reset Timer"
        >
          🔄
        </button>
      </div>
      <div className="music-section">
        <div className="music-controls">
          <button
            className={`music-btn ${musicPlaying ? 'playing' : ''}`}
            onClick={toggleMusic}
            title={musicPlaying ? 'Pause' : 'Play'}
          >
            {musicPlaying ? '⏸️' : '▶️'}
          </button>
          <div className="track-name">{musicTrack}</div>
          <input
            type="range"
            min="0"
            max="100"
            value={musicVolume}
            onChange={(e) => setMusicVolume(Number(e.target.value))}
            className="volume-slider"
            title={`Volume: ${musicVolume}%`}
          />
        </div>
        <audio ref={audioRef} src="/assets/audio/track.mp3" loop />
      </div>
    </div>
  );
};

export default FocusTimer;
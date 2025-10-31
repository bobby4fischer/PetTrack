import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from 'react-redux';
import "./Dashboard.css";
import Cat from "../pets/Cat";
import Settings from "./Settings";
import Store from "./Store";
import Manual from "./Manual";
import PetCare from "./PetCare";
import FocusTimer from "./FocusTimer";
import Tasks from "./Tasks";
import {
  openSettings, closeSettings, openStore, closeStore, openManual, closeManual, toggleTheme,
  decreaseLife, increaseLife, renew,
  addGems, setGems, addItem, consumeItem, setInventory,
  addTask as addTaskAction, deleteTask as deleteTaskAction, completeTask as completeTaskAction,
  setMinutes as setMinutesAction, setSeconds as setSecondsAction, setRunning as setRunningAction, setInitialSeconds as setInitialSecondsAction, reset as resetAction,
  togglePlaying as togglePlayingAction, setVolume as setVolumeAction,
} from '../../store/store.js';

const Dashboard = ({ onLogout }) => {
  const dispatch = useDispatch();
  const userEmail = useSelector((s) => s.user.email);
  const user = userEmail ? { email: userEmail } : null;
  const petData = useSelector((s) => s.pet);
  const tasks = useSelector((s) => s.tasks);
  const inventory = useSelector((s) => s.store.inventory);
  const gems = useSelector((s) => s.store.gems);
  const isStoreOpen = useSelector((s) => s.app.isStoreOpen);
  const isManualOpen = useSelector((s) => s.app.isManualOpen);
  const isSettingsOpen = useSelector((s) => s.app.isSettingsOpen);
  const theme = useSelector((s) => s.app.theme);
  const timerMinutes = useSelector((s) => s.timer.minutes);
  const timerSeconds = useSelector((s) => s.timer.seconds);
  const isTimerRunning = useSelector((s) => s.timer.isRunning);
  const initialTimerSeconds = useSelector((s) => s.timer.initialSeconds);
  const musicPlaying = useSelector((s) => s.audio.playing);
  const musicVolume = useSelector((s) => s.audio.volume);
  const musicTrack = useSelector((s) => s.audio.track);
  const audioRef = useRef(null);
  const [newTask, setNewTask] = useState("");

  const openSettingsHandler = () => dispatch(openSettings());
  const closeSettingsHandler = () => dispatch(closeSettings());
  const openStoreHandler = () => dispatch(openStore());
  const closeStoreHandler = () => dispatch(closeStore());
  const openManualHandler = () => dispatch(openManual());
  const closeManualHandler = () => dispatch(closeManual());
  const toggleThemeHandler = () => dispatch(toggleTheme());

  // Pet life system: hourly decrease by 15 with offline catch-up
  useEffect(() => {
    if (!userEmail) return;
    const now = Date.now();
    const last = petData.lastUpdated || now;
    const hours = Math.floor((now - last) / (60 * 60 * 1000));
    if (hours > 0) {
      dispatch(decreaseLife(hours * 15));
    }
    const interval = setInterval(() => {
      dispatch(decreaseLife(15));
    }, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [dispatch, userEmail]);

  // Apply theme class to root
  useEffect(() => {
    const root = document.querySelector('.dashboard-root');
    if (!root) return;
    root.classList.toggle('theme-dark', theme === 'dark');
  }, [theme]);

  // Persist per-user state
  // Persistence handled by Redux store subscription

  const feedPet = (type) => {
    if (inventory[type] > 0 && petData.life < 100) {
      dispatch(consumeItem(type));
      const amt = type === 'food' ? 20 : type === 'milk' ? 15 : 10;
      dispatch(increaseLife(amt));
    }
  };

  const addTask = () => {
    if (newTask.trim()) {
      dispatch(addTaskAction(newTask.trim()));
      setNewTask("");
    }
  };

  // Store actions: purchase using gems
  const ITEM_COSTS = { food: 3, milk: 2, toys: 4 };
  const buyItem = (type) => {
    const cost = ITEM_COSTS[type] ?? 1;
    if (gems < cost) {
      alert('Not enough gems');
      return;
    }
    dispatch(spendGems(cost));
    dispatch(addItem(type));
  };

  const completeTask = (id) => {
    const task = tasks.find((t) => t.id === id);
    dispatch(completeTaskAction(id));
    if (task && user?.email) {
      const key = `completedTasks:${user.email}`;
      let history = [];
      try {
        const existing = localStorage.getItem(key);
        history = existing ? JSON.parse(existing) : [];
      } catch {}
      history.push({ id: task.id, text: task.text, completedAt: new Date().toISOString() });
      localStorage.setItem(key, JSON.stringify(history));
      dispatch(addGems(3));
    }
  };

  const deleteTask = (id) => {
    dispatch(deleteTaskAction(id));
  };

  const getCurrentDate = () => {
    const now = new Date();
    const options = { weekday: "short", day: "numeric", month: "short" };
    return now.toLocaleDateString("en-US", options); // e.g. "Thu, 23 Oct"
  };

  // Timer functionality
  useEffect(() => {
    let interval = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        if (timerSeconds > 0) {
          dispatch(setSecondsAction(timerSeconds - 1));
        } else if (timerMinutes > 0) {
          dispatch(setMinutesAction(timerMinutes - 1));
          dispatch(setSecondsAction(59));
        } else {
          dispatch(setRunningAction(false));
          alert("Timer finished!");
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [dispatch, isTimerRunning, timerMinutes, timerSeconds]);

  const startTimer = () => {
    dispatch(setInitialSecondsAction(timerMinutes * 60 + timerSeconds));
    dispatch(setRunningAction(true));
  };

  const pauseTimer = () => {
    dispatch(setRunningAction(false));
  };

  const resetTimer = () => {
    dispatch(resetAction());
  };

  const toggleMusic = () => {
    dispatch(togglePlayingAction());
  };

  const setMusicVolumeHandler = (v) => {
    dispatch(setVolumeAction(v));
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = musicVolume / 100;
      if (musicPlaying) {
        audio.play().catch(() => {});
      } else {
        audio.pause();
      }
    }
  }, [musicVolume, musicPlaying]);

  // Progress for the circular ring (0..1)
  const totalRemaining = timerMinutes * 60 + timerSeconds;
  const progress = initialTimerSeconds > 0 ? Math.max(0, Math.min(1, totalRemaining / initialTimerSeconds)) : 0;
  const ringStyle = { ['--progress']: progress };

  return (
    <div className="dashboard-root">
      <nav className="top-nav">
        <div className="nav-left">
          <h1 className="app-title">🐾 PetTalk</h1>
        </div>

        <div className="nav-center">
          <button className="nav-button" onClick={openSettingsHandler}>⚙️ Settings</button>
          <button className="nav-button" onClick={openStoreHandler}>🏪 Store</button>
          <button className="nav-button" onClick={openManualHandler}>📖 Manual</button>
        </div>

        <div className="nav-right">
          <div className="gems-badge" title="Your Gems">💎 {gems}</div>
        </div>
      </nav>

      <main className="dashboard-content">
        {/* Left panel */}
        <aside className="left-panel">
          <PetCare inventory={inventory} petData={petData} feedPet={feedPet} />
        </aside>

        {/* Center panel */}
        <section className="center-panel">
          <div className="pet-display">
            {petData.life > 0 ? (
              <Cat 
                name={petData.name} 
                life={petData.life} 
                isAlive={petData.isAlive} 
              />
            ) : (
              <div className="pet-memorial">
                <img src="/assets/images/rip.png" alt="RIP" className="rip-image" />
                <p className="memorial-message">Your beloved pet has passed away.</p>
                <button
                  className="renew-button"
                  onClick={() => {
                    if (!user?.email) return;
                    dispatch(renew());
                    dispatch(setGems(0));
                    dispatch(setInventory({ food: 0, milk: 0, toys: 0 }));
                    dispatch(setTasks([]));
                  }}
                >Renew</button>
              </div>
            )}
            {petData.life > 0 && (
              <FocusTimer
                ringStyle={ringStyle}
                timerMinutes={timerMinutes}
                timerSeconds={timerSeconds}
                isTimerRunning={isTimerRunning}
                startTimer={startTimer}
                pauseTimer={pauseTimer}
                resetTimer={resetTimer}
                musicPlaying={musicPlaying}
                toggleMusic={toggleMusic}
                musicVolume={musicVolume}
                setMusicVolume={setMusicVolumeHandler}
                musicTrack={musicTrack}
                audioRef={audioRef}
              />
            )}
          </div>
        </section>

        {/* Right panel */}
        <aside className="right-panel">
          <Tasks
            tasks={tasks}
            newTask={newTask}
            setNewTask={setNewTask}
            addTask={addTask}
            completeTask={completeTask}
            deleteTask={deleteTask}
            getCurrentDate={getCurrentDate}
          />
        </aside>
      </main>

      <Settings
        isOpen={isSettingsOpen}
        onClose={closeSettingsHandler}
        theme={theme}
        toggleTheme={toggleThemeHandler}
        user={user}
        onLogout={onLogout}
      />

      <Store
        isOpen={isStoreOpen}
        onClose={closeStoreHandler}
        ITEM_COSTS={ITEM_COSTS}
        buyItem={buyItem}
        gems={gems}
      />

      <Manual isOpen={isManualOpen} onClose={closeManualHandler} />
    </div>
  );
};

export default Dashboard;

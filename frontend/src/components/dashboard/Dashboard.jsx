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
  addGems, setGems, addItem, consumeItem, setInventory, spendGems,
  addTask as addTaskAction, deleteTask as deleteTaskAction, completeTask as completeTaskAction, setTasks as setTasksAction,
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
  const [healthDialogOpen, setHealthDialogOpen] = useState(false);
  const [petReactKey, setPetReactKey] = useState(0);
  const [sessionId, setSessionId] = useState(null);
  const [activeTaskId, setActiveTaskId] = useState(null);
  const [timerMode, setTimerMode] = useState('focus');

  const openSettingsHandler = () => dispatch(openSettings());
  const closeSettingsHandler = () => dispatch(closeSettings());
  const openStoreHandler = () => dispatch(openStore());
  const closeStoreHandler = () => dispatch(closeStore());
  const openManualHandler = () => dispatch(openManual());
  const closeManualHandler = () => dispatch(closeManual());
  const toggleThemeHandler = () => dispatch(toggleTheme());

  // Pet life system: decrease by 1 per minute with offline catch-up
  useEffect(() => {
    if (!userEmail) return;
    const now = Date.now();
    const last = petData.lastUpdated || now;
    const minutes = Math.floor((now - last) / (60 * 1000));
    if (minutes > 0) {
      dispatch(decreaseLife(minutes));
    }
    const interval = setInterval(() => {
      dispatch(decreaseLife(1));
    }, 60 * 1000);
    return () => clearInterval(interval);
  }, [dispatch, userEmail]);

  useEffect(() => {
    const token = localStorage.getItem('authToken')
    if (!token) return
    let socket
    (async () => {
      const { createSocket } = await import('../../socket.js')
      socket = createSocket()
      socket.on('reward:update', (p) => {
        const d = Number(p?.gemsDelta || 0)
        if (d) dispatch(addGems(d))
      })
      socket.on('pet:react', () => {
        setPetReactKey((k) => k + 1)
      })
      socket.on('idle:alert', () => {
        setPetReactKey((k) => k + 1)
      })
    })()
    return () => { try { socket?.close() } catch {} }
  }, [dispatch])

  // Apply theme class to root
  useEffect(() => {
    const root = document.querySelector('.dashboard-root');
    if (!root) return;
    root.classList.toggle('theme-dark', theme === 'dark');
  }, [theme]);

  // Persist per-user state
  // Persistence handled by Redux store subscription

  const feedPet = (type) => {
    if (!petData.isAlive) return;
    if (inventory[type] > 0) {
      const amt = type === 'food' ? 10 : type === 'milk' ? 5 : 15;
      const current = petData.life || 0;
      // If applying the amount would exceed 100, do nothing
      if (current >= 100 || current + amt > 100) {
        setHealthDialogOpen(true);
        return;
      }
      dispatch(consumeItem(type));
      dispatch(increaseLife(amt));
    }
  };

  const addTask = async () => {
    if (timerMode === 'free') { return }
    const title = newTask.trim()
    if (!title) return
    try {
      const token = localStorage.getItem('authToken')
      if (token) {
        const { taskCreate } = await import('../../api/client.js')
        const r = await taskCreate(title)
        const created = r.data
        dispatch(addTaskAction(created.title))
      } else {
        dispatch(addTaskAction(title))
      }
      setNewTask("")
    } catch {
      dispatch(addTaskAction(title))
      setNewTask("")
    }
  };

  // Store actions: purchase using gems
  const ITEM_COSTS = { food: 9, milk: 8, toys: 10 };
  const buyItem = (type) => {
    const cost = ITEM_COSTS[type] ?? 1;
    if (gems < cost) {
      alert('Not enough gems');
      return;
    }
    dispatch(spendGems(cost));
    dispatch(addItem(type));
  };

  const completeTask = async (id) => {
    try {
      const { taskComplete } = await import('../../api/client.js')
      await taskComplete(id)
      dispatch(completeTaskAction(id))
    } catch (e) {
      alert('Complete a 25-minute Pomodoro linked to this task first')
    }
  };

  const deleteTask = (id) => {
    dispatch(deleteTaskAction(id));
    if (id === activeTaskId) {
      setActiveTaskId(null)
      dispatch(setRunningAction(false))
      dispatch(setMinutesAction(25))
      dispatch(setSecondsAction(0))
      dispatch(setInitialSecondsAction(25 * 60))
      setTimerMode('focus')
    }
  };

  const focusTaskSelect = (id) => {
    if (timerMode === 'focus' && isTimerRunning) return
    setActiveTaskId(id)
    if (timerMode === 'focus' && !isTimerRunning) {
      dispatch(setMinutesAction(25))
      dispatch(setSecondsAction(0))
      dispatch(setInitialSecondsAction(25 * 60))
    }
  }

  const getCurrentDate = () => {
    const now = new Date();
    const options = { weekday: "short", day: "numeric", month: "short" };
    return now.toLocaleDateString("en-US", options); // e.g. "Thu, 23 Oct"
  };

  // Email summary scheduler (local stub): every 100 minutes
  // Aggregates completed tasks since last summary and stores a draft in localStorage.
  useEffect(() => {
    if (!userEmail) return;
    const keyLast = `emailLast:${userEmail}`;
    const keyCompleted = `completedTasks:${userEmail}`;
    const keyDrafts = `emailDrafts:${userEmail}`;

    const sendSummary = () => {
      let history = [];
      try {
        const raw = localStorage.getItem(keyCompleted);
        history = raw ? JSON.parse(raw) : [];
      } catch {}

      const lastSent = Number(localStorage.getItem(keyLast) || 0);
      const since = lastSent || 0;
      const recent = history.filter((h) => {
        const t = new Date(h.completedAt).getTime();
        return !Number.isNaN(t) && t > since;
      });

      const summary = {
        at: new Date().toISOString(),
        count: recent.length,
        tasks: recent,
      };

      // Append to drafts list
      try {
        const prev = localStorage.getItem(keyDrafts);
        const drafts = prev ? JSON.parse(prev) : [];
        drafts.push(summary);
        localStorage.setItem(keyDrafts, JSON.stringify(drafts));
      } catch {}

      // Update last sent time
      localStorage.setItem(keyLast, String(Date.now()));
    };

    // On mount, perform catch-up summary once if overdue
    const lastSent = Number(localStorage.getItem(keyLast) || 0);
    const now = Date.now();
    const overdue = lastSent === 0 || (now - lastSent) >= (100 * 60 * 1000);
    if (overdue) {
      sendSummary();
    }

    const interval = setInterval(sendSummary, 100 * 60 * 1000);
    return () => clearInterval(interval);
  }, [userEmail]);

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
          if (sessionId) {
            (async () => {
              try {
                const { sessionStop } = await import('../../api/client.js')
                await sessionStop(sessionId)
                setSessionId(null)
              } catch {}
            })()
          }
          (async () => {
            if (timerMode === 'focus') {
              try {
                if (activeTaskId) {
                  const token = localStorage.getItem('authToken')
                  if (token) {
                    const { taskDelete } = await import('../../api/client.js')
                    await taskDelete(activeTaskId)
                  }
                  dispatch(deleteTaskAction(activeTaskId))
                  setActiveTaskId(null)
                }
              } catch {
                if (activeTaskId) {
                  dispatch(deleteTaskAction(activeTaskId))
                  setActiveTaskId(null)
                }
              }
              dispatch(setMinutesAction(0))
              dispatch(setSecondsAction(10))
              dispatch(setInitialSecondsAction(10))
              dispatch(setRunningAction(false))
              setTimerMode('free')
              const token = localStorage.getItem('authToken')
              if (!token) {
                dispatch(addGems(5))
              }
            } else {
              dispatch(setMinutesAction(0))
              dispatch(setSecondsAction(30))
              dispatch(setInitialSecondsAction(30))
              dispatch(setRunningAction(false))
              setTimerMode('focus')
            }
          })()
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [dispatch, isTimerRunning, timerMinutes, timerSeconds, sessionId, timerMode]);

  const startTimer = () => {
    if (timerMode === 'focus' && !activeTaskId) { alert('Select a task to focus on before starting the timer'); return; }
    const remaining = timerMinutes * 60 + timerSeconds;
    if (timerMode === 'free') {
      if (initialTimerSeconds !== 10) dispatch(setInitialSecondsAction(10));
    } else {
      if (initialTimerSeconds === remaining) dispatch(setInitialSecondsAction(remaining));
    }
    dispatch(setRunningAction(true));
    (async () => {
      try {
        const token = localStorage.getItem('authToken')
        if (token && timerMode === 'focus') {
          const { sessionStart } = await import('../../api/client.js')
          const r = await sessionStart(activeTaskId)
          setSessionId(r.data._id)
        }
      } catch {}
    })()
  };

  const pauseTimer = () => {
    dispatch(setRunningAction(false));
  };

  const resetTimer = () => {
    if (timerMode === 'free') {
      dispatch(setMinutesAction(0));
      dispatch(setSecondsAction(10));
      dispatch(setInitialSecondsAction(10));
      dispatch(setRunningAction(false));
    } else {
      dispatch(resetAction());
    }
    if (sessionId) {
      (async () => {
        try {
          const { sessionStop } = await import('../../api/client.js')
          await sessionStop(sessionId)
          setSessionId(null)
        } catch {}
      })()
    }
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
                  reactKey={petReactKey}
                  moodPercent={petData.life}
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
                    dispatch(setTasksAction([]));
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
                activeTaskTitle={(tasks.find((t) => t.id === activeTaskId)?.text) || ''}
                startDisabled={timerMode === 'focus' && !activeTaskId}
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
            activeTaskId={activeTaskId}
            setActiveTaskId={setActiveTaskId}
            isAddDisabled={timerMode === 'free'}
            disableInteractions={timerMode === 'free'}
            onFocusTask={focusTaskSelect}
            disableFocus={timerMode === 'focus' && isTimerRunning}
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
      {healthDialogOpen && (
        <div className="modal-overlay" onClick={() => setHealthDialogOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon">✨</div>
            <h3 className="modal-title">Sufficient health</h3>
            <p className="modal-body">Your pet is already healthy. Feeding is skipped to avoid exceeding 100.</p>
            <div className="modal-actions">
              <button className="modal-button" onClick={() => setHealthDialogOpen(false)}>OK</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

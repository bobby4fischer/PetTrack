import { configureStore, createSlice } from '@reduxjs/toolkit';

// Helpers
const getUserEmail = () => {
  try {
    const u = localStorage.getItem('user');
    const obj = u ? JSON.parse(u) : null;
    return obj?.email || null;
  } catch {
    return null;
  }
};

const email = getUserEmail();
const readJSON = (key, fallback) => {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
};

// Slices
const userSlice = createSlice({
  name: 'user',
  initialState: { email },
  reducers: {
    setUserEmail: (state, action) => { state.email = action.payload; },
    clearUser: (state) => { state.email = null; },
  }
});

const appSlice = createSlice({
  name: 'app',
  initialState: {
    isSettingsOpen: false,
    isStoreOpen: false,
    isManualOpen: false,
    theme: localStorage.getItem('theme') || 'light',
  },
  reducers: {
    openSettings: (s) => { s.isSettingsOpen = true; },
    closeSettings: (s) => { s.isSettingsOpen = false; },
    openStore: (s) => { s.isStoreOpen = true; },
    closeStore: (s) => { s.isStoreOpen = false; },
    openManual: (s) => { s.isManualOpen = true; },
    closeManual: (s) => { s.isManualOpen = false; },
    toggleTheme: (s) => { s.theme = s.theme === 'light' ? 'dark' : 'light'; },
    setTheme: (s, a) => { s.theme = a.payload; },
  }
});

const defaultPet = { id: 'cat', name: 'Whiskers', life: 100, isAlive: true, lastUpdated: Date.now() };
const petSlice = createSlice({
  name: 'pet',
  initialState: email ? readJSON(`pet:${email}`, defaultPet) : defaultPet,
  reducers: {
    setPet: (s, a) => ({ ...s, ...a.payload }),
    increaseLife: (s, a) => { const amt = a.payload || 0; const newLife = Math.min(100, (s.life || 0) + amt); s.life = newLife; s.isAlive = newLife > 0; s.lastUpdated = Date.now(); },
    decreaseLife: (s, a) => { const amt = a.payload || 0; const newLife = Math.max(0, (s.life || 0) - amt); s.life = newLife; s.isAlive = newLife > 0; s.lastUpdated = Date.now(); },
    renew: (s) => { s.life = 80; s.isAlive = true; s.lastUpdated = Date.now(); },
  }
});

const storeSlice = createSlice({
  name: 'store',
  initialState: {
    gems: email ? readJSON(`gems:${email}`, 0) : 0,
    inventory: email ? readJSON(`inventory:${email}`, { food: 0, milk: 0, toys: 0 }) : { food: 0, milk: 0, toys: 0 },
  },
  reducers: {
    setGems: (s, a) => { s.gems = a.payload; },
    addGems: (s, a) => { s.gems = (s.gems || 0) + (a.payload || 0); },
    spendGems: (s, a) => { s.gems = Math.max(0, (s.gems || 0) - (a.payload || 0)); },
    addItem: (s, a) => { const t = a.payload; s.inventory[t] = Math.min(99, (s.inventory[t] || 0) + 1); },
    consumeItem: (s, a) => { const t = a.payload; s.inventory[t] = Math.max(0, (s.inventory[t] || 0) - 1); },
    setInventory: (s, a) => { s.inventory = { ...s.inventory, ...a.payload }; },
  }
});

const tasksSlice = createSlice({
  name: 'tasks',
  initialState: email ? readJSON(`tasks:${email}`, []) : [],
  reducers: {
    addTask: (s, a) => { const text = String(a.payload || '').trim(); if (!text) return; s.push({ id: Date.now(), text, completed: false, createdAt: new Date().toISOString() }); },
    deleteTask: (s, a) => s.filter((t) => t.id !== a.payload),
    completeTask: (s, a) => s.filter((t) => t.id !== a.payload),
    setTasks: (s, a) => a.payload,
  }
});

const timerSlice = createSlice({
  name: 'timer',
  initialState: { minutes: 25, seconds: 0, isRunning: false, initialSeconds: 25 * 60 },
  reducers: {
    setMinutes: (s, a) => { s.minutes = a.payload; },
    setSeconds: (s, a) => { s.seconds = a.payload; },
    setRunning: (s, a) => { s.isRunning = a.payload; },
    setInitialSeconds: (s, a) => { s.initialSeconds = a.payload; },
    reset: (s) => { s.minutes = 25; s.seconds = 0; s.isRunning = false; s.initialSeconds = 25 * 60; },
  }
});

const audioSlice = createSlice({
  name: 'audio',
  initialState: { playing: false, volume: 70, track: 'Focus Lo-Fi' },
  reducers: {
    togglePlaying: (s) => { s.playing = !s.playing; },
    setVolume: (s, a) => { s.volume = a.payload; },
    setTrack: (s, a) => { s.track = a.payload; },
  }
});

export const {
  setUserEmail, clearUser,
} = userSlice.actions;

export const {
  openSettings, closeSettings, openStore, closeStore, openManual, closeManual, toggleTheme, setTheme,
} = appSlice.actions;

export const {
  setPet, increaseLife, decreaseLife, renew,
} = petSlice.actions;

export const {
  setGems, addGems, spendGems, addItem, consumeItem, setInventory,
} = storeSlice.actions;

export const {
  addTask, deleteTask, completeTask, setTasks,
} = tasksSlice.actions;

export const {
  setMinutes, setSeconds, setRunning, setInitialSeconds, reset,
} = timerSlice.actions;

export const {
  togglePlaying, setVolume, setTrack,
} = audioSlice.actions;

export const store = configureStore({
  reducer: {
    user: userSlice.reducer,
    app: appSlice.reducer,
    pet: petSlice.reducer,
    store: storeSlice.reducer,
    tasks: tasksSlice.reducer,
    timer: timerSlice.reducer,
    audio: audioSlice.reducer,
  }
});

// Persist to localStorage whenever relevant state changes
store.subscribe(() => {
  const state = store.getState();
  const email = state.user.email;
  try {
    // Persist theme
    localStorage.setItem('theme', state.app.theme);
    if (email) {
      localStorage.setItem(`pet:${email}`, JSON.stringify(state.pet));
      localStorage.setItem(`tasks:${email}`, JSON.stringify(state.tasks));
      localStorage.setItem(`inventory:${email}`, JSON.stringify(state.store.inventory));
      localStorage.setItem(`gems:${email}`, JSON.stringify(state.store.gems));
    }
  } catch {}
});
chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create('petCheck', { periodInMinutes: 5 })
})
chrome.idle.onStateChanged.addListener((state) => {
  if (state === 'idle' || state === 'locked') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      for (const t of tabs) {
        chrome.tabs.sendMessage(t.id, { type: 'idle-alert' })
      }
    })
  }
})
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'petCheck') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      for (const t of tabs) {
        chrome.tabs.sendMessage(t.id, { type: 'nudge' })
      }
    })
  }
})
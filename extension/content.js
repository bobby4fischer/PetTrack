const overlayId = 'pettalk-overlay'
const showOverlay = (message) => {
  let el = document.getElementById(overlayId)
  if (!el) {
    el = document.createElement('div')
    el.id = overlayId
    el.className = 'pettalk-overlay'
    el.innerHTML = `<div class="card"><div class="pet">🐱</div><div class="text">${message}</div><button class="btn" id="dismiss">Got it</button></div>`
    document.body.appendChild(el)
    document.getElementById('dismiss').onclick = () => el.remove()
  }
}
const postEvent = (type) => {
  try {
    chrome.storage.sync.get(['pettalkToken'], (r) => {
      const token = r?.pettalkToken
      if (!token) return
      fetch('http://localhost:4000/api/activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ type, url: location.href })
      }).catch(() => {})
    })
  } catch {}
}
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'idle-alert') { showOverlay('Time to refocus. Your pet misses you!'); postEvent('idle') }
  if (msg.type === 'nudge') { showOverlay('Stay on task. Earn gems by completing one now!'); postEvent('deviation') }
})
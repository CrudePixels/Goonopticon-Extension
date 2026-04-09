import * as browser from 'webextension-polyfill';

const DEFAULT_BRIDGE_PORT = 9245;
const STORAGE_PORT_PRIMARY = 'goonopticonBridgePort';

let statusTimer = null;

async function loadPort() {
    const data = await browser.storage.local.get({
        [STORAGE_PORT_PRIMARY]: DEFAULT_BRIDGE_PORT,
        port: DEFAULT_BRIDGE_PORT,
    });
    const el = document.getElementById('port');
    if (!el) return;
    const p = data[STORAGE_PORT_PRIMARY];
    if (typeof p === 'number') {
        el.value = String(p);
    } else if (typeof data.port === 'number') {
        el.value = String(data.port);
    } else {
        el.value = String(DEFAULT_BRIDGE_PORT);
    }
}

function setStatus(text, type = '') {
    const el = document.getElementById('status');
    if (!el) return;
    el.textContent = text;
    el.className = type || '';
}

async function updateConnectionStatus() {
    const badge = document.getElementById('connection-badge');
    try {
        const res = await browser.runtime.sendMessage({ action: 'goonopticonBridgeGetStatus' });
        if (badge) {
            badge.textContent = res.connected ? '[ LINK ]' : '[ OFFLINE ]';
            badge.className = `status-badge ${res.connected ? 'connected' : 'disconnected'}`;
        }
        if (res.lastError && !res.connected) {
            setStatus(res.lastError, 'error');
        } else {
            setStatus(
                res.connected
                    ? 'Connected to desktop. Jump seeks the active tab.'
                    : 'Not connected. Start Goonopticon Desktop and match the port.',
                res.connected ? 'connected' : '',
            );
        }
    } catch {
        if (badge) {
            badge.textContent = '[ OFFLINE ]';
            badge.className = 'status-badge disconnected';
        }
        setStatus('Could not get status.');
    }
}

function startStatusPolling() {
    if (statusTimer) clearInterval(statusTimer);
    updateConnectionStatus();
    statusTimer = setInterval(updateConnectionStatus, 3000);
}

function stopStatusPolling() {
    if (statusTimer) {
        clearInterval(statusTimer);
        statusTimer = null;
    }
}

document.getElementById('save')?.addEventListener('click', async () => {
    const portEl = document.getElementById('port');
    const port = parseInt(portEl?.value, 10);
    if (port < 1024 || port > 65535) {
        setStatus('Invalid port (1024–65535)', 'error');
        return;
    }
    await browser.storage.local.set({ [STORAGE_PORT_PRIMARY]: port });
    setStatus('Saved. Reconnecting…');
    await browser.runtime.sendMessage({ action: 'goonopticonBridgeReconnect' });
    setTimeout(updateConnectionStatus, 1500);
});

document.getElementById('reconnect')?.addEventListener('click', async () => {
    setStatus('Reconnecting…');
    await browser.runtime.sendMessage({ action: 'goonopticonBridgeReconnect' });
    setTimeout(updateConnectionStatus, 1500);
});

(async () => {
    await loadPort();
    updateConnectionStatus();
    startStatusPolling();
})();

window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        updateConnectionStatus();
        startStatusPolling();
    } else {
        stopStatusPolling();
    }
});

/**
 * Goonopticon desktop bridge — WebSocket to localhost (same protocol as CrudePixels/GE).
 */
import * as browser from 'webextension-polyfill';

const DEFAULT_BRIDGE_PORT = 9245;
const STORAGE_PORT_PRIMARY = 'goonopticonBridgePort';
const STORAGE_PORT_LEGACY = 'port';
const STORAGE_CONNECTED = 'goonopticonBridgeConnected';

const MAX_RECONNECT_DELAY = 10000;
const TIME_UPDATE_MS = 1000;

let ws = null;
let reconnectTimer = null;
let timeUpdateInterval = null;
let reconnectAttempts = 0;
const connectionState = { connected: false, lastError: null };

function setConnected(connected, error = null) {
    connectionState.connected = !!connected;
    connectionState.lastError = error || null;
    browser.storage.local.set({ [STORAGE_CONNECTED]: connectionState.connected }).catch(() => {});
}

async function getPort() {
    const data = await browser.storage.local.get({
        [STORAGE_PORT_PRIMARY]: DEFAULT_BRIDGE_PORT,
        [STORAGE_PORT_LEGACY]: DEFAULT_BRIDGE_PORT,
    });
    const p = data[STORAGE_PORT_PRIMARY];
    if (typeof p === 'number' && p >= 1024 && p <= 65535) return p;
    const legacy = data[STORAGE_PORT_LEGACY];
    if (typeof legacy === 'number' && legacy >= 1024 && legacy <= 65535) return legacy;
    return DEFAULT_BRIDGE_PORT;
}

function getWsUrl(port) {
    return `ws://127.0.0.1:${port}`;
}

export async function connectBridge() {
    if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) return;

    const port = await getPort();

    try {
        ws = new WebSocket(getWsUrl(port));
    } catch {
        scheduleReconnect();
        return;
    }

    ws.onopen = () => {
        reconnectAttempts = 0;
        setConnected(true);
        ws.send(JSON.stringify({ event: 'connected', source: 'extension' }));
        startTimeUpdateLoop();
    };

    ws.onmessage = async (evt) => {
        try {
            const msg = JSON.parse(evt.data);
            if (msg.action === 'seek' && typeof msg.time === 'number') {
                await handleSeek(msg.time);
            }
        } catch {
            // ignore malformed messages
        }
    };

    ws.onclose = () => {
        stopTimeUpdateLoop();
        ws = null;
        setConnected(false);
        scheduleReconnect();
    };

    ws.onerror = () => {
        setConnected(false, 'WebSocket error');
        ws?.close();
    };
}

function scheduleReconnect() {
    if (reconnectTimer) return;
    const delay = Math.min(2000 * 2 ** reconnectAttempts, MAX_RECONNECT_DELAY);
    reconnectAttempts += 1;
    reconnectTimer = setTimeout(() => {
        reconnectTimer = null;
        connectBridge();
    }, delay);
}

async function handleSeek(time) {
    try {
        const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
        if (!tab?.id) return;

        await browser.scripting.executeScript({
            target: { tabId: tab.id, allFrames: true },
            func: (seconds) => {
                const video = document.querySelector('video');
                if (video) {
                    video.currentTime = seconds;
                    return true;
                }
                return false;
            },
            args: [time],
        });

        ws?.send(JSON.stringify({ event: 'seeked', time }));
    } catch (err) {
        ws?.send(
            JSON.stringify({
                event: 'error',
                message: err?.message || 'Seek failed',
            }),
        );
    }
}

function stopTimeUpdateLoop() {
    if (timeUpdateInterval) {
        clearInterval(timeUpdateInterval);
        timeUpdateInterval = null;
    }
}

function startTimeUpdateLoop() {
    stopTimeUpdateLoop();
    timeUpdateInterval = setInterval(async () => {
        if (!ws || ws.readyState !== WebSocket.OPEN) return;
        try {
            const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
            if (!tab?.id) return;
            const results = await browser.scripting.executeScript({
                target: { tabId: tab.id, allFrames: true },
                func: () => {
                    const v = document.querySelector('video');
                    return v && Number.isFinite(v.currentTime) ? v.currentTime : null;
                },
            });
            const time = results?.find((r) => typeof r?.result === 'number' && r.result >= 0)?.result;
            if (typeof time === 'number') {
                ws.send(JSON.stringify({ event: 'timeUpdate', time }));
            }
        } catch {
            // tab may be restricted
        }
    }, TIME_UPDATE_MS);
}

export function disconnectBridge() {
    stopTimeUpdateLoop();
    if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
    }
    if (ws) {
        ws.close();
        ws = null;
    }
    setConnected(false);
}

export function initGoonopticonBridge() {
    browser.runtime.onStartup.addListener(() => {
        connectBridge();
    });
    connectBridge();
}

/** @returns {boolean} true if this message was handled */
export function handleBridgeMessage(msg, sendResponse) {
    if (!msg || typeof msg !== 'object') return false;

    if (msg.action === 'goonopticonBridgeReconnect') {
        disconnectBridge();
        connectBridge();
        sendResponse?.({ ok: true });
        return true;
    }

    if (msg.action === 'goonopticonBridgeGetStatus') {
        sendResponse?.({
            connected: connectionState.connected,
            lastError: connectionState.lastError,
        });
        return true;
    }

    return false;
}

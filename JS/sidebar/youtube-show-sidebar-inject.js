/**
 * Injects a Goonopticon "show sidebar" control into YouTube's main player chrome only.
 * Avoids document-wide .ytp-right-controls (miniplayer, previews) that sit "on top" of the page.
 */
import * as browser from 'webextension-polyfill';

const BTN_ID = 'goonopticon-ytp-show-sidebar';

export function isYouTubeWatchLike() {
    const p = location.pathname;
    return p === '/watch' || p.startsWith('/watch/') || p.startsWith('/live/') || p.startsWith('/shorts/');
}

/** Main watch player root — never use bare .html5-video-player (can be wrong layer). */
function findMainPlayerRoot() {
    const candidates = [
        document.querySelector('ytd-watch-flexy #movie_player'),
        document.querySelector('#movie_player'),
        document.querySelector('#shorts-player'),
        document.querySelector('ytd-shorts #movie_player'),
    ];
    for (const el of candidates) {
        if (el && el.querySelector('.ytp-right-controls')) return el;
    }
    return null;
}

function findRightControls() {
    const root = findMainPlayerRoot();
    return root?.querySelector('.ytp-right-controls') ?? null;
}

function isInjectedButtonInMainChrome(btn) {
    const right = findRightControls();
    return !!(right && btn && right.contains(btn));
}

export function removeYouTubeShowSidebarControl() {
    document.getElementById(BTN_ID)?.remove();
}

let mo = null;
let debounceTimer = null;

function tryInject(onShow) {
    if (!isYouTubeWatchLike()) {
        removeYouTubeShowSidebarControl();
        return;
    }

    const existing = document.getElementById(BTN_ID);
    if (existing && isInjectedButtonInMainChrome(existing)) {
        return;
    }
    if (existing) {
        existing.remove();
    }

    const right = findRightControls();
    if (!right) return;

    const btn = document.createElement('button');
    btn.id = BTN_ID;
    btn.type = 'button';
    btn.className = 'ytp-button goonopticon-ytp-show-sidebar';
    btn.setAttribute('aria-label', 'Show Goonopticon sidebar');
    btn.title = 'Goonopticon';

    const img = document.createElement('img');
    img.className = 'goonopticon-ytp-show-sidebar-img';
    img.src = browser.runtime.getURL('Resources/icon-48.png');
    img.alt = '';
    img.draggable = false;
    btn.appendChild(img);

    btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        onShow();
    });

    /*
     * .ytp-right-controls uses flex-direction: row-reverse: first DOM child = visually rightmost (fullscreen).
     * insertBefore(btn, fs) makes btn the new first child → icon past fullscreen (looks "outside" the bar).
     * Insert *after* fullscreen in DOM → sits immediately to the left of fullscreen, inside the chrome row.
     */
    const fs = right.querySelector('.ytp-fullscreen-button');
    if (fs) {
        fs.insertAdjacentElement('afterend', btn);
    } else {
        right.appendChild(btn);
    }
}

function debouncedTryInject(onShow) {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        debounceTimer = null;
        tryInject(onShow);
    }, 120);
}

function startObserver(onShow) {
    if (mo) return;
    mo = new MutationObserver(() => debouncedTryInject(onShow));
    mo.observe(document.body, { childList: true, subtree: true });
}

export function stopYouTubeShowSidebarObserver() {
    if (mo) {
        mo.disconnect();
        mo = null;
    }
    if (debounceTimer) {
        clearTimeout(debounceTimer);
        debounceTimer = null;
    }
}

/**
 * @param {boolean} active - Show inject + observer (sidebar hidden); false removes control and observer.
 * @param {() => void} onShow - Same handler as the floating button.
 */
export function setYouTubeShowSidebarControlActive(active, onShow) {
    if (!active) {
        removeYouTubeShowSidebarControl();
        stopYouTubeShowSidebarObserver();
        return;
    }
    tryInject(onShow);
    startObserver(onShow);
}

import { LogDev } from '../../log.js';
import browser from 'webextension-polyfill';

export const GOONOPTICON_REPO_URL = 'https://github.com/CrudePixels/Goonopticon-Extension';

function wireModal(modal) {
    const closeBtn = modal.querySelector('.popup-modal__close');
    closeBtn?.addEventListener('click', () => modal.remove());
    modal.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') modal.remove();
    });
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
    setTimeout(() => closeBtn?.focus(), 50);
}

/**
 * Short usage tips (replaces long combined Help/About copy).
 */
export function showHelpModal() {
    LogDev('Help modal opened', 'interaction');
    document.getElementById('goonPopupHelpModal')?.remove();
    const modal = document.createElement('div');
    modal.id = 'goonPopupHelpModal';
    modal.className = 'popup-modal';
    modal.tabIndex = -1;
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.innerHTML = `
        <div class="popup-modal__content popup-modal__content--compact">
            <button type="button" class="popup-modal__close" aria-label="Close">✕</button>
            <h2>Help</h2>
            <ul class="popup-help-list">
                <li>On a <strong>YouTube</strong> watch page, the sidebar lists your notes for that video.</li>
                <li>If the sidebar is hidden, use the <strong>Goonopticon icon</strong> in the player controls (or the floating button on non-watch pages).</li>
                <li><strong>+ Note</strong> — enter text and an optional timestamp in one dialog.</li>
                <li><strong>Settings</strong> — themes, desktop bridge port, and <strong>Advanced features</strong> (search, tags, groups, lock).</li>
            </ul>
        </div>
    `;
    document.body.appendChild(modal);
    wireModal(modal);
}

/**
 * Version, credit, repo link.
 */
export function showAboutModal() {
    LogDev('About modal opened', 'interaction');
    document.getElementById('goonPopupAboutModal')?.remove();
    const modal = document.createElement('div');
    modal.id = 'goonPopupAboutModal';
    modal.className = 'popup-modal';
    modal.tabIndex = -1;
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    const manifest = browser.runtime.getManifest();
    const ver = manifest?.version ? `v${manifest.version}` : '';
    modal.innerHTML = `
        <div class="popup-modal__content popup-modal__content--compact">
            <button type="button" class="popup-modal__close" aria-label="Close">✕</button>
            <h2>About</h2>
            <p class="popup-about-lead"><strong>Goonopticon</strong> — YouTube timestamp notes, groups, and tags.</p>
            <p class="popup-about-meta">Version <strong id="aboutVersionSpan">${ver}</strong></p>
            <p class="popup-about-credit">Henchman CrudePixels</p>
            <p class="popup-about-links">
                <a href="${GOONOPTICON_REPO_URL}" target="_blank" rel="noopener noreferrer">GitHub</a>
                ·
                <a href="${GOONOPTICON_REPO_URL}/releases/latest" target="_blank" rel="noopener noreferrer">Latest release</a>
            </p>
        </div>
    `;
    document.body.appendChild(modal);
    const span = modal.querySelector('#aboutVersionSpan');
    if (span && !span.textContent && manifest?.version) {
        span.textContent = `v${manifest.version}`;
    }
    wireModal(modal);
}

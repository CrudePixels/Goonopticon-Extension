// Sidebar Footer Component
import { LogDev } from '../../log.js';
import * as browser from 'webextension-polyfill';

/**
 * Renders the sidebar footer.
 * @param {Object} props - Footer properties and handlers.
 * @returns {HTMLElement} The sidebar footer DOM element.
 */
export function renderSidebarFooter(props) {
    const {
        onAddNote,
        onClearAll,
        onAddGroup,
        onLockToggle,
        locked,
        groups,
        stats,
        advancedFeatures = false,
    } = props;

    try {
        const footer = document.createElement('div');
        footer.className = 'sidebar__footer';
        footer.style.display = 'flex';
        footer.style.flexDirection = 'column';
        footer.style.height = '100%';
        footer.style.position = 'relative';

        // --- Main Action Buttons ---
        const actionsContainer = document.createElement('div');
        actionsContainer.style.display = 'flex';
        actionsContainer.style.flexDirection = 'column';
        actionsContainer.style.gap = '8px';
        actionsContainer.style.margin = '0 0 12px 0';
        actionsContainer.style.alignItems = 'center';
        actionsContainer.style.width = '100%';

        if (advancedFeatures) {
            const groupBtn = document.createElement('button');
            groupBtn.className = 'sidebar__action-btn';
            groupBtn.textContent = '+ Group';
            groupBtn.title = 'Create a new note group';
            groupBtn.style.width = '90%';
            groupBtn.style.maxWidth = '280px';
            groupBtn.onclick = () => { if (typeof onAddGroup === 'function') onAddGroup(); };
            actionsContainer.appendChild(groupBtn);
        }

        // + Note button (combined)
        const noteBtn = document.createElement('button');
        noteBtn.className = 'sidebar__action-btn';
        noteBtn.textContent = '+ Note';
        noteBtn.style.width = '90%';
        noteBtn.style.maxWidth = '280px';
        noteBtn.onclick = () => {
            if (typeof onAddNote === 'function') onAddNote();
        };
        actionsContainer.appendChild(noteBtn);

        if (advancedFeatures) {
            const lockBtn = document.createElement('button');
            lockBtn.className = 'sidebar__action-btn';
            lockBtn.textContent = locked ? 'Unlock' : 'Lock';
            lockBtn.title = locked ? 'Unlock the sidebar to edit notes and groups' : 'Lock the sidebar to prevent accidental edits';
            lockBtn.style.width = '90%';
            lockBtn.style.maxWidth = '280px';
            lockBtn.onclick = () => { if (typeof onLockToggle === 'function') onLockToggle(); };
            actionsContainer.appendChild(lockBtn);
        }

        footer.appendChild(actionsContainer);

        // --- Divider ---
        const divider = document.createElement('div');
        divider.className = 'sidebar-divider';
        footer.appendChild(divider);

        // Stats display
        if (stats) {
            const statsDiv = document.createElement('div');
            statsDiv.className = 'sidebar__stats';
            statsDiv.textContent = stats;
            footer.appendChild(statsDiv);
        }

        // Hide Sidebar (swapped from header)
        const hideBtn = document.createElement('button');
        hideBtn.className = 'sidebar__action-btn sidebar__hide-sidebar-btn';
        hideBtn.type = 'button';
        hideBtn.textContent = 'Hide Sidebar';
        hideBtn.style.display = 'block';
        hideBtn.style.margin = '8px auto 0 auto';
        hideBtn.style.maxWidth = '280px';
        hideBtn.style.width = '90%';
        hideBtn.onclick = () => {
            browser.storage.local.set({ 'PodAwful::SidebarVisible': 'false' }).then(() => {
                const sidebar = document.getElementById('podawful-sidebar');
                if (sidebar) {
                    sidebar.classList.add('sidebar-hide');
                    sidebar.style.display = 'none';
                }
                document.body.classList.remove('sidebar-visible');
            });
        };
        footer.appendChild(hideBtn);

        return footer;
    } catch (e) {
        LogDev('renderSidebarFooter error: ' + e, 'error');
        const errorDiv = document.createElement('div');
        errorDiv.textContent = 'Footer failed to render';
        errorDiv.style.color = 'var(--error, #c00)';
        return errorDiv;
    }
}
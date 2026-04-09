// Sidebar Header Component
import { LogDev } from '../../log.js';
import * as browser from 'webextension-polyfill';
import { renderTagFilter } from './tagFilterComponent.js';
import { getAllTags } from '../logic.js';
import quotesRaw from '../../../Resources/Quotes.txt';

/**
 * Renders the sidebar header.
 * @param {Object} props - Header properties and handlers.
 * @returns {HTMLElement} The sidebar header DOM element.
 */
export function renderSidebarHeader(props) {
    const {
        groups,
        selectedGroup,
        onGroupSelect,
        onAddGroup,
        onImportPage,
        onExportPage,
        onImportAll,
        onExportAll,
        locked,
        onLockToggle,
        theme,
        onThemeToggle,
        showTagManagerModal,
        notes,
        selectedTags,
        onTagSelect,
        onTagSearch,
        onClearTags
    } = props;

    try {
        const header = document.createElement('div');
        header.className = 'sidebar__header';

        // --- Goonopticon Logo and Title ---
        const logo = document.createElement('img');
        logo.className = 'sidebar-logo';
        logo.src = browser.runtime.getURL('Resources/icon-48.png');
        logo.alt = 'Goonopticon Logo';
        logo.style.display = 'block';
        // Fallback: hide image if it fails to load
        logo.onerror = () => {
            logo.style.display = 'none';
        };
        header.appendChild(logo);

        const title = document.createElement('h2');
        title.className = 'sidebar-title';
        title.textContent = 'Goonopticon';
        title.style.textAlign = 'center';
        header.appendChild(title);

        // --- Divider ---
        const divider1 = document.createElement('div');
        divider1.className = 'sidebar-divider';
        header.appendChild(divider1);

        // --- Website / quote button (swapped from footer) ---
        const quotes = quotesRaw.split('\n').map((q) => q.trim()).filter(Boolean);
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        const websiteButton = document.createElement('button');
        websiteButton.className = 'sidebar__podawful-link sidebar__podawful-link--header';
        websiteButton.textContent = randomQuote;
        websiteButton.title = 'Choose Website';
        websiteButton.type = 'button';
        websiteButton.style.textAlign = 'center';
        websiteButton.style.padding = '10px 16px';
        websiteButton.style.color = 'var(--accent, #FFD600)';
        websiteButton.style.fontSize = '1.1em';
        websiteButton.style.fontWeight = '600';
        websiteButton.style.borderRadius = '8px';
        websiteButton.style.backgroundColor = 'rgba(255,214,0,0.08)';
        websiteButton.style.border = '1.5px solid var(--accent, #FFD600)';
        websiteButton.style.userSelect = 'text';
        websiteButton.style.textDecoration = 'none';
        websiteButton.style.transition = 'all 0.2s ease';
        websiteButton.style.cursor = 'pointer';
        websiteButton.style.margin = '0 auto 12px auto';
        websiteButton.style.display = 'block';
        websiteButton.addEventListener('mouseenter', () => {
            websiteButton.style.backgroundColor = 'var(--accent, #FFD600)';
            websiteButton.style.color = 'var(--sidebar-bg, #1a1a1a)';
        });
        websiteButton.addEventListener('mouseleave', () => {
            websiteButton.style.backgroundColor = 'rgba(255,214,0,0.08)';
            websiteButton.style.color = 'var(--accent, #FFD600)';
        });
        websiteButton.onclick = async () => {
            if (typeof window.showTwoChoiceModal === 'function') {
                const choice = await window.showTwoChoiceModal({
                    title: 'Choose Website',
                    message: 'Which website would you like to visit?',
                    option1: '🌐 Visit Podawful.com',
                    option2: '⚡ Visit Awful.tech',
                });
                if (choice === '🌐 Visit Podawful.com') {
                    window.open('https://podawful.com', '_blank', 'noopener,noreferrer');
                } else if (choice === '⚡ Visit Awful.tech') {
                    window.open('https://awful.tech', '_blank', 'noopener,noreferrer');
                }
            } else {
                window.open('https://podawful.com', '_blank', 'noopener,noreferrer');
            }
        };
        header.appendChild(websiteButton);

        // --- Tag Filter Section ---
        const filterSection = document.createElement('div');
        filterSection.className = 'sidebar-tag-filter';
        filterSection.style.textAlign = 'center';
        filterSection.style.marginBottom = '12px';
        
        // Get all available tags from notes
        const allTags = getAllTags(notes || []);
        
        // Render the tag filter component
        const tagFilter = renderTagFilter({
            tags: allTags,
            selectedTags: selectedTags || [],
            onTagSelect: onTagSelect,
            onClear: onClearTags,
            onSearch: onTagSearch,
            showTagManagerModal: showTagManagerModal,
            highlight: props.searchValue || '',
            advancedFeatures: props.advancedFeatures === true,
        });
        
        filterSection.appendChild(tagFilter);
        header.appendChild(filterSection);

        // --- Divider ---
        const divider2 = document.createElement('div');
        divider2.className = 'sidebar-divider';
        header.appendChild(divider2);

        return header;
    } catch (e) {
        LogDev('renderSidebarHeader error: ' + e, 'error');
        const errorDiv = document.createElement('div');
        errorDiv.textContent = 'Header failed to render';
        errorDiv.style.color = 'var(--error, #c00)';
        return errorDiv;
    }
}
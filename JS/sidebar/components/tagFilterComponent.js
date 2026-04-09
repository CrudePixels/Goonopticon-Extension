// Tag Filter Component
import { LogDev } from '../../log.js';

/**
 * Renders the tag filter component.
 * @param {Object} props - Tag filter properties and handlers.
 * @returns {HTMLElement} The tag filter DOM element.
 */
export function renderTagFilter(props) {
    const {
        tags,
        selectedTags,
        onTagSelect,
        onClear,
        highlight,
        advancedFeatures = false,
    } = props;

    try {
        const container = document.createElement('div');
        container.className = 'tag-filter sidebar-tag-filter';

        if (advancedFeatures) {
            const searchRow = document.createElement('div');
            searchRow.className = 'tag-filter__search-row';

            const searchInput = document.createElement('input');
            searchInput.className = 'tag-filter__search';
            searchInput.type = 'text';
            searchInput.placeholder = 'Search...';
            searchInput.title = 'Filter notes by text in the sidebar';
            if (highlight) searchInput.value = highlight;
            searchInput.setAttribute('aria-label', 'Search');
            searchInput.oninput = null;
            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && typeof props.onSearch === 'function') {
                    props.onSearch(e.target.value);
                }
            });
            searchInput.addEventListener('blur', (e) => {
                if (typeof props.onSearch === 'function') {
                    props.onSearch(e.target.value);
                }
            });
            searchRow.appendChild(searchInput);

            const clearBtn = document.createElement('button');
            clearBtn.className = 'tag-filter__clear';
            clearBtn.textContent = '✕';
            clearBtn.setAttribute('aria-label', 'Clear search');
            clearBtn.title = 'Clear search';
            clearBtn.disabled = !highlight;
            clearBtn.onclick = () => {
                if (typeof props.onSearch === 'function') props.onSearch('');
            };
            searchRow.appendChild(clearBtn);

            container.appendChild(searchRow);
        }

        // Tag list
        const tagList = document.createElement('div');
        tagList.className = 'tag-filter__list';
        (tags || []).forEach(tag => {
            const tagBtn = document.createElement('button');
            tagBtn.className = 'tag-filter__tag' + (selectedTags && selectedTags.includes(tag) ? ' tag-filter__tag--selected' : '');
            tagBtn.textContent = tag;
            tagBtn.setAttribute('aria-pressed', selectedTags && selectedTags.includes(tag) ? 'true' : 'false');
            tagBtn.onclick = () => {
                if (typeof onTagSelect === 'function') onTagSelect(tag);
            };
            tagList.appendChild(tagBtn);
        });
        container.appendChild(tagList);

        // Clear button
        if (selectedTags && selectedTags.length > 0) {
            const clearSelectedBtn = document.createElement('button');
            clearSelectedBtn.className = 'tag-filter__clear';
            clearSelectedBtn.textContent = 'Clear';
            clearSelectedBtn.setAttribute('aria-label', 'Clear selected tags');
            clearSelectedBtn.onclick = () => {
                if (typeof onClear === 'function') onClear();
            };
            container.appendChild(clearSelectedBtn);
        }

        if (advancedFeatures) {
            const tagManagerBtn = document.createElement('button');
            tagManagerBtn.className = 'tag-filter__manager-btn';
            tagManagerBtn.textContent = 'Manage Tags';
            tagManagerBtn.title = 'Rename, merge, or remove tags';
            tagManagerBtn.setAttribute('aria-label', 'Open tag manager');
            tagManagerBtn.onclick = () => {
                if (typeof props.showTagManagerModal === 'function') props.showTagManagerModal();
            };
            container.appendChild(tagManagerBtn);
        }

        return container;
    } catch (e) {
        LogDev('renderTagFilter error: ' + e, 'error');
        const errorDiv = document.createElement('div');
        errorDiv.textContent = 'Tag filter failed to render';
        errorDiv.style.color = 'var(--error, #c00)';
        return errorDiv;
    }
}
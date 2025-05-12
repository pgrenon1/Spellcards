class SpellCard {
    constructor(spellData, classData) {
        this.name = spellData.name || '';
        this.level = spellData.level || 0;
        this.school = this.getSchool(spellData.school || '');
        this.castingTime = this.formatTime(spellData.time || []);
        this.range = this.formatRange(spellData.range || {});
        this.materialComponent = this.getMaterialComponent(spellData.components || {});
        this.components = this.formatComponents(spellData.components || {});
        this.duration = this.formatDuration(spellData.duration || []);
        this.description = this.formatDescription(spellData.entries || []);
        this.higherLevels = this.formatHigherLevels(spellData.entriesHigherLevel || []);
        this.classes = this.getSpellClasses(classData);
        this.source = spellData.source || '';
        this.selected = false;
    }

    capitalizeFirstLetter(str) 
    {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    getSchool(school) {
        const schools = {
            'A': 'Abjuration',
            'C': 'Conjuration',
            'D': 'Divination',
            'E': 'Enchantment',
            'V': 'Evocation',
            'I': 'Illusion',
            'N': 'Necromancy',
            'T': 'Transmutation'
        };
        return schools[school] || 'Unknown';
    }

    formatTime(timeData) {
        if (!timeData.length) return "1 action";
        const time = timeData[0];
        return `${time.number || 1} ${time.unit || 'action'}`;
    }

    formatRange(rangeData) {
        if (!rangeData.distance) return "Self";
        const distance = rangeData.distance;
        return `${distance.amount || ""} ${this.capitalizeFirstLetter(distance.type || 'feet')}`;
    }

    getMaterialComponent(compData) {
        if (compData.m && typeof compData.m === 'string') 
        {
            return compData.m;
        }
        return null;
    }

    formatComponents(compData) {
        const components = [];
        if (compData.v) components.push('V');
        if (compData.s) components.push('S');
        if (compData.m) components.push('M');
        return components.join(' ');
    }

    formatDuration(durationData) {
        if (!durationData.length) return "Instantaneous";
        
        const duration = durationData[0];
        if (duration.type === 'instant') return "Instantaneous";
        
        const time = duration.duration || {};
        let result = `${time.amount || 1} ${time.type || 'round'}${time.amount === 1 ? '' : 's'}`;
        
        if (duration.concentration) 
        {
            if (time.type === 'minute') 
            {
                const amount = time.amount || 1;
                result = `Conc. ${amount} min${amount === 1 ? '' : 's'}`;
            }
            else 
            {
                result = `Conc. ${result}`;
            }
        }
        
        return result;
    }

    sanitizeDescription(text) {
        if (typeof text !== 'string') return text;

        // Handle various markdown patterns
        return text
            // Handle @d20 tags - add plus sign if needed
            .replace(/{@d20 ([^}]+)}/g, (match, p1) => {
                const num = parseInt(p1);
                const modifier = num >= 0 ? `+${num}` : num.toString();
                return `<strong>${modifier}</strong>`;
            })
            
            // Handle @sense tags - capitalize
            .replace(/{@sense ([^}]+)}/g, (match, p1) => {
                return '<strong>' + 
                    p1.split(' ')
                        .map(word => this.capitalizeFirstLetter(word))
                        .join(' ') + 
                    '</strong>';
            })
            
            // Handle @hit tags - just the modifier in bold
            .replace(/{@hit ([^}]+)}/g, '<strong>$1</strong>')
            
            // Handle @filter tags - extract and capitalize main term
            .replace(/{@filter ([^}|]+)(?:\|[^}]+)?}/g, (match, p1) => {
                return '<strong>' + 
                    p1.split(' ')
                        .map(word => this.capitalizeFirstLetter(word))
                        .join(' ') + 
                    '</strong>';
            })
            
            // Handle @b tags - just bold
            .replace(/{@b ([^}]+)}/g, '<strong>$1</strong>')
            
            // Handle adventure references
            .replace(/{@adventure ([^}|]+)(?:\|[^}]+)?}/g, (match, p1) => {
                return '<strong>' + 
                    p1.split(' ')
                        .map(word => this.capitalizeFirstLetter(word))
                        .join(' ') + 
                    '</strong>';
            })
            
            // Handle @i tags - capitalize and italicize
            .replace(/{@i ([^}]+)}/g, (match, p1) => {
                return '<i>' + 
                    p1.split(' ')
                        .map(word => this.capitalizeFirstLetter(word))
                        .join(' ') + 
                    '</i>';
            })
            
            // Handle skill checks
            .replace(/{@skill ([^}]+)}/g, '<strong>$1</strong>')
            
            // Handle items with sources
            .replace(/{@item ([^}|]+)\|[^}]+}/g, '<strong>$1</strong>')
            
            // Handle conditions
            .replace(/{@condition ([^}|]+)(?:\|[^}]+)?}/g, '<strong>$1</strong>')
            
            // Handle damage
            .replace(/{@damage ([^}]+)}/g, '<strong>$1</strong>')
            
            // Handle actions
            .replace(/{@action ([^}|]+)(?:\|[^}]+)?}/g, '<strong>$1</strong>')
            
            // Handle spell references
            .replace(/{@spell ([^}|]+)(?:\|[^}]+)?}/g, '<strong>$1</strong>')
            
            // Handle notes - display in italics
            .replace(/\{@note ([^}]+)\}/g, '<i>$1</i>')
            
            // Handle race references - handle all formats (double pipes, source book, or plain)
            .replace(/\{@race [^}]+\|\|([^}]+)\}/g, '<strong>$1</strong>')  // double pipe format
            .replace(/\{@race ([^|}]+)[^}]*\}/g, '<strong>$1</strong>')     // source book or plain format
            
            // Handle dice notation - handle both piped and non-piped formats
            .replace(/\{@dice (?:([^|}]+)\|)?([^|}]+)\}/g, '<strong>$2</strong>')
            
            // Handle quick references - use last part after pipes
            .replace(/{@quickref [^}]+\|+([^|}]+)}/g, (match, p1) => {
                return '<strong>' + 
                    p1.split(' ')
                        .map(word => this.capitalizeFirstLetter(word))
                        .join(' ') + 
                    '</strong>';
            })
            
            // Handle book references
            .replace(/{@book ([^}|]+)(?:\|[^}]+)?}/g, '<strong>$1</strong>')
            
            // Handle variant rules
            .replace(/{@variantrule ([^}|]+)(?:\|[^}]+)?}/g, '<strong>$1</strong>')
            
            // Handle DCs
            .replace(/{@dc ([^}]+)}/g, '<strong>DC $1</strong>')
            
            // Handle scaling damage
            .replace(/{@scaledamage ([^}|]+)\|[^}|]+\|[^}]+}/g, '<strong>$1</strong>')
            
            // Handle scaling dice
            .replace(/{@scaledice ([^}|]+)\|[^}|]+\|[^}]+}/g, '<strong>$1</strong>')
            
            // Handle chances
            .replace(/{@chance ([^}|]+)(?:\|\|\|[^}]+)?}/g, '<strong>$1%</strong>')
            
            // Handle hazards
            .replace(/{@hazard ([^}|]+)(?:\|[^}]+)?}/g, '<strong>$1</strong>')
            
            // Handle status conditions
            .replace(/{@status ([^}|]+)(?:\|[^}]+)?}/g, '<strong>$1</strong>')
            
            // Handle creature references
            .replace(/{@creature ([^}|]+)(?:\|[^}]+)?}/g, '<strong>$1</strong>')
            
            // Handle class features - display only the feature name
            .replace(/\{@classFeature ([^|}]+)[^}]*\}/g, '<strong>$1</strong>')
            
            // Capitalize first letter of each word in the replaced text
            .replace(/<strong>([^<]+)<\/strong>/g, (match, p1) => {
                return '<strong>' + 
                    p1.split(' ')
                        .map(word => this.capitalizeFirstLetter(word))
                        .join(' ') + 
                    '</strong>';
            });
    }

    formatDescription(entries) {
        let description = '';
        
        // Add material component at the top if it exists
        if (this.materialComponent) 
        {
            description = `<p><strong>Materials:</strong> ${this.sanitizeDescription(this.materialComponent)}</p>\n\n`;
        }
        
        if (Array.isArray(entries)) 
        {
            // Handle arrays of text or objects
            description += entries.map(entry => {
                if (typeof entry === 'string') 
                {
                    return this.sanitizeDescription(entry);
                } 
                else if (entry.type === 'list') 
                {
                    // Handle bullet point lists
                    return '<ul>' + 
                        entry.items.map(item => 
                            `<li>${this.sanitizeDescription(item)}</li>`
                        ).join('') + 
                        '</ul>';
                } 
                else if (entry.type === 'table') 
                {
                    // Handle tables
                    return '<table class="spell-table">' +
                        (entry.caption ? `<caption>${this.sanitizeDescription(entry.caption)}</caption>` : '') +
                        (entry.colLabels ? 
                            '<tr>' + 
                            entry.colLabels.map(label => `<th>${this.sanitizeDescription(label)}</th>`).join('') +
                            '</tr>' : '') +
                        entry.rows.map(row => 
                            '<tr>' + 
                            row.map(cell => {
                                // Handle cell content that might be an entries object
                                if (typeof cell === 'object' && cell.type === 'entries') 
                                {
                                    return `<td>${this.formatDescription(cell.entries)}</td>`;
                                }
                                return `<td>${this.sanitizeDescription(String(cell))}</td>`;
                            }).join('') +
                            '</tr>'
                        ).join('') +
                        '</table>';
                } 
                else if (entry.type === 'entries') 
                {
                    // Handle named entry groups
                    return `<div class="spell-entry-group">
                        <h4>${this.capitalizeFirstLetter(entry.name)}</h4>
                        ${this.formatDescription(entry.entries)}
                    </div>`;
                } 
                else if (entry.type === 'quote') 
                {
                    // Handle quotes - render the quoted text in italics
                    return `<i>${this.formatDescription(entry.entries)}</i>`;
                }
                return this.sanitizeDescription(JSON.stringify(entry));
            }).join('\n\n');
        } 
        else 
        {
            description += this.sanitizeDescription(String(entries));
        }
        
        return description;
    }

    formatHigherLevels(higherLevel) {
        if (!higherLevel.length) return "";
        
        for (const entry of higherLevel) {
            if (entry.name === 'At Higher Levels' || 
                entry.name === 'Using a Higher-Level Spell Slot' ||
                entry.name === 'Cantrip Upgrade') {
                return this.sanitizeDescription(entry.entries.join('\n'));
            }
        }
        return "";
    }

    getSpellClasses(classData) {
        if (!classData || !classData.class) return [];
        
        // Get unique class names (ignoring source)
        const uniqueClasses = new Set(
            classData.class.map(c => c.name)
        );
        
        return Array.from(uniqueClasses).sort();
    }

    async createCardElement() {
        const card = document.createElement('div');
        card.className = 'spell-card';
        
        const spellLevel = this.level === 0 ? "Cantrip" : 
                          this.level === 3 ? "3rd-level" : 
                          `${this.level}th-level`;
        
        const template = await this.loadTemplate();
        const templateData = {
            name: this.name,
            levelText: this.level === 0 ? 'Cantrip' : `${spellLevel} ${this.school.toLowerCase()}`,
            castingTime: this.castingTime,
            range: this.range,
            components: this.components,
            duration: this.duration,
            description: this.description.split('\n\n').map(p => `<p>${p}</p>`).join(''),
            higherLevels: this.higherLevels,
            classTags: this.classes.map(c => `<span class="class-tag">${c}</span>`).join(''),
            source: this.source
        };
        
        card.innerHTML = this.fillTemplate(template, templateData);
        
        // Add click handler for selection
        card.addEventListener('click', () => {
            this.selected = !this.selected;
            card.classList.toggle('selected', this.selected);
            updateSelectionStatus();
            updateControlsButtons();
        });
        
        return card;
    }

    async loadTemplate() {
        try {
            const response = await fetch('card.html');
            return await response.text();
        } catch (error) {
            console.error('Error loading template:', error);
            return ''; // Return empty string if template loading fails
        }
    }

    fillTemplate(template, data) {
        // First handle conditional sections
        let result = template.replace(/\{\{#if ([^}]+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (match, condition, content) => {
            return data[condition] ? content : '';
        });
        
        // Then handle regular replacements
        result = result.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
            return data[key] || '';
        });
        
        return result;
    }

    toJSON() {
        return {
            name: this.name,
            level: this.level,
            school: this.school,
            castingTime: this.castingTime,
            range: this.range,
            components: this.components,
            duration: this.duration,
            description: this.description,
            higherLevels: this.higherLevels,
            classes: this.classes,
            source: this.source
        };
    }
}

async function loadSpellData() {
    try {
        // Load the index
        const indexResponse = await fetch('5etools-src/data/spells/index.json');
        const index = await indexResponse.json();
        
        // Load sources.json for class information
        const sourcesResponse = await fetch('5etools-src/data/spells/sources.json');
        const sources = await sourcesResponse.json();
        
        const spells = [];
        
        // Load each source file
        for (const [sourceKey, sourceFile] of Object.entries(index)) {
            try {
                const response = await fetch(`5etools-src/data/spells/${sourceFile}`);
                const sourceData = await response.json();
                if (sourceData.spell) {
                    // Add spells with their class information
                    sourceData.spell.forEach(spell => {
                        const classData = findSpellClasses(spell.name, sources);
                        spells.push({
                            spellData: spell,
                            classData: classData
                        });
                    });
                }
            } catch (error) {
                console.warn(`Could not load ${sourceFile}:`, error);
            }
        }
        
        return spells;
    } catch (error) {
        console.error('Error loading spells:', error);
        return [];
    }
}

function findSpellClasses(spellName, sources) {
    // Search through all source books for the spell
    for (const sourceBook of Object.values(sources)) {
        if (sourceBook[spellName]) {
            return sourceBook[spellName];
        }
    }
    return null;
}

// Add this near the top of the file with other state variables
let currentSortOrder = 'desc';

// Update the sort function
function sortSpells(spells, sortBy, sortOrder) {
    return [...spells].sort((a, b) => {
        let comparison = 0;
        switch (sortBy) {
            case 'name':
                comparison = (a.spellData.name || '').localeCompare(b.spellData.name || '');
                break;
            case 'level':
                const levelA = a.spellData.level || 0;
                const levelB = b.spellData.level || 0;
                comparison = levelA - levelB;
                break;
            case 'school':
                const schoolA = a.spellData.school || '';
                const schoolB = b.spellData.school || '';
                comparison = schoolA.localeCompare(schoolB);
                break;
            default:
                comparison = 0;
        }
        return sortOrder === 'desc' ? -comparison : comparison;
    });
}

function updateSortDisplay() {
    const sortBy = document.getElementById('sortBy');
    const options = sortBy.options;
    const arrow = currentSortOrder === 'desc' ? '↑' : '↓';
    
    for (let i = 0; i < options.length; i++) {
        const option = options[i];
        const baseName = option.textContent.replace(/[↑↓]$/, '').trim();
        option.textContent = `${baseName} ${option.selected ? arrow : ''}`;
    }
}

// Add this near the top where other helper functions are defined
function getSpellVersion(spellData) {
    // Extract version info from the source
    // Newer sources generally indicate reprints
    const sourceOrder = {
        'PHB': 1,    // Player's Handbook (Original)
        'XGE': 2,    // Xanathar's Guide to Everything
        'TCE': 3,    // Tasha's Cauldron of Everything
        // Add more sources as needed, with higher numbers for newer books
    };
    
    return sourceOrder[spellData.source] || 999; // Unknown sources treated as newest
}

function filterAndSortSpells(spells, searchText, level, school, characterClass, sortBy, reprintMode) {
    // First, group spells by name to handle reprints
    const spellGroups = new Map();
    
    spells.forEach(spell => {
        const name = spell.spellData.name;
        if (!spellGroups.has(name)) {
            spellGroups.set(name, []);
        }
        spellGroups.get(name).push(spell);
    });
    
    // Filter spell groups based on reprint preferences
    const filteredSpells = [];
    spellGroups.forEach(versions => {
        // Sort versions by source order
        versions.sort((a, b) => getSpellVersion(b.spellData) - getSpellVersion(a.spellData));
        
        switch (reprintMode) {
            case 'latest':
                filteredSpells.push(versions[0]); // Add only the latest version
                break;
            case 'original':
                filteredSpells.push(versions[versions.length - 1]); // Add only the earliest version
                break;
            case 'all':
                filteredSpells.push(...versions); // Add all versions
                break;
        }
    });
    
    // Apply other filters
    const filtered = filteredSpells.filter(({spellData, classData}) => {
        const matchesSearch = searchText === '' || 
            spellData.name.toLowerCase().includes(searchText.toLowerCase());
        const matchesLevel = level === 'all' || spellData.level === parseInt(level);
        const matchesSchool = school === 'all' || spellData.school === school;
        const matchesClass = characterClass === 'all' || 
            (classData && classData.class && 
             classData.class.some(c => c.name === characterClass));
        
        return matchesSearch && matchesLevel && matchesSchool && matchesClass;
    });

    return sortSpells(filtered, sortBy, currentSortOrder);
}

function checkForOverflow(element) {
    return element.scrollHeight > element.clientHeight;
}

function updateOverflowStatus() {
    const cards = document.querySelectorAll('.spell-card');
    const overflowingCards = [];
    
    cards.forEach(card => {
        const description = card.querySelector('.spell-description');
        const hasOverflow = checkForOverflow(description);
        
        // Remove any existing warning
        const existingWarning = card.querySelector('.card-overflow-warning');
        if (existingWarning) {
            existingWarning.remove();
        }
        
        if (hasOverflow) {
            const warning = document.createElement('span');
            warning.className = 'card-overflow-warning';
            warning.textContent = '⚠️';
            card.appendChild(warning);
            
            const name = card.querySelector('.spell-header h2').textContent;
            overflowingCards.push(name);
        }
    });
    
    const statusIcon = document.querySelector('.status-icon');
    const overflowCount = document.querySelector('.overflow-count');
    const overflowList = document.getElementById('overflowList');
    
    if (overflowingCards.length > 0) {
        statusIcon.classList.add('has-overflow');
        statusIcon.textContent = '⚠️';
        overflowCount.textContent = `(${overflowingCards.length})`;
        overflowList.innerHTML = overflowingCards
            .map(name => `<div class="overflow-item">${name}</div>`)
            .join('');
    } else {
        statusIcon.classList.remove('has-overflow');
        statusIcon.textContent = 'ℹ️';
        overflowCount.textContent = '';
        overflowList.textContent = 'No overflowing cards';
    }
}

async function renderSpellCards(spells) {
    const container = document.getElementById('spellCards');
    container.innerHTML = '';
    
    window.allSpellCards = spells.map(({spellData, classData}) => new SpellCard(spellData, classData));
    
    // Create all cards in parallel
    const cardPromises = window.allSpellCards.map(spell => spell.createCardElement());
    const cards = await Promise.all(cardPromises);
    
    // Append all cards to the container
    cards.forEach(card => container.appendChild(card));
    
    // Add a small delay to ensure the DOM has updated
    setTimeout(updateOverflowStatus, 100);
    updateControlsButtons();
}

// Add this function to handle select all functionality
function toggleSelectAll() {
    const selectAllButton = document.getElementById('selectAllButton');
    const visibleCards = document.querySelectorAll('.spell-card');
    const allSelected = Array.from(visibleCards).every(card => card.classList.contains('selected'));
    
    // Toggle selection state
    visibleCards.forEach((card, index) => {
        const spellCard = window.allSpellCards[index];
        if (allSelected) {
            // Deselect all
            card.classList.remove('selected');
            spellCard.selected = false;
        } else {
            // Select all
            card.classList.add('selected');
            spellCard.selected = true;
        }
    });
    
    // Update button states
    updateSelectAllButton();
    updateSelectionStatus();
}

// Add this function to update Select All button state
function updateSelectAllButton() {
    const selectAllButton = document.getElementById('selectAllButton');
    const visibleCards = document.querySelectorAll('.spell-card');
    const allSelected = Array.from(visibleCards).every(card => card.classList.contains('selected'));
    
    selectAllButton.classList.toggle('all-selected', allSelected);
    selectAllButton.textContent = allSelected ? 'Deselect All' : 'Select All';
}

// Modify the updateExportButton function
function updateControlsButtons() {
    const exportButton = document.getElementById('exportButton');
    const generatePdfButton = document.getElementById('generatePdfButton');
    const selectedSpells = document.querySelectorAll('.spell-card.selected');
    exportButton.disabled = selectedSpells.length === 0;
    generatePdfButton.disabled = selectedSpells.length === 0;
    updateSelectAllButton();
}

function exportSelectedSpells() {
    const selectedCards = document.querySelectorAll('.spell-card.selected');
    const selectedSpells = Array.from(selectedCards).map(card => {
        const index = Array.from(card.parentElement.children).indexOf(card);
        return window.allSpellCards[index].toJSON();
    });

    const jsonContent = JSON.stringify(selectedSpells, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'SelectedSpells.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function updateSelectionStatus() {
    const selectedCards = document.querySelectorAll('.spell-card.selected');
    const selectionCount = document.querySelector('.selection-count');
    const selectionList = document.getElementById('selectionList');
    
    if (selectedCards.length > 0) {
        selectionCount.textContent = `Selected: ${selectedCards.length}`;
        selectionList.innerHTML = Array.from(selectedCards)
            .map(card => {
                const name = card.querySelector('.spell-header h2').textContent;
                return `<div class="selection-item">${name}</div>`;
            })
            .join('');
    } else {
        selectionCount.textContent = 'None selected';
        selectionList.textContent = 'No spells selected';
    }
    
    // Update button states
    updateControlsButtons();
}

async function generatePdf() {
    const selectedCards = document.querySelectorAll('.spell-card.selected');
    if (selectedCards.length === 0) return;

    // Create a new container for the PDF layout
    const pdfContainer = document.createElement('div');
    pdfContainer.style.display = 'grid';
    pdfContainer.style.gridTemplateColumns = 'repeat(auto-fill, minmax(var(--card-width), 1fr))';
    pdfContainer.style.gap = '0';
    pdfContainer.style.padding = '0';
    pdfContainer.style.width = '210mm'; // A4 width
    pdfContainer.style.margin = '0 auto';

    // Clone selected cards into the PDF container
    selectedCards.forEach(card => {
        const cardClone = card.cloneNode(true);
        cardClone.classList.remove('selected');
        cardClone.style.cursor = 'default';
        cardClone.style.margin = '0';
        cardClone.style.pageBreakInside = 'avoid';
        
        // Remove selection checkmark and overflow warning
        const checkmark = cardClone.querySelector('.card-overflow-warning');
        if (checkmark) checkmark.remove();
        
        pdfContainer.appendChild(cardClone);
    });

    // Create a temporary container for PDF generation
    const tempContainer = document.createElement('div');
    tempContainer.style.visibility = 'hidden';
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.appendChild(pdfContainer);
    document.body.appendChild(tempContainer);

    // Configure PDF options
    const opt = {
        margin: 0,
        filename: 'SpellCards.pdf',
        image: { type: 'jpeg', quality: 1 },
        html2canvas: { 
            scale: 2,
            useCORS: true,
            letterRendering: true
        },
        jsPDF: { 
            unit: 'mm', 
            format: 'a4', 
            orientation: 'portrait'
        }
    };

    try {
        await html2pdf().set(opt).from(pdfContainer).save();
    } finally {
        // Clean up
        document.body.removeChild(tempContainer);
    }
}

// Update the initialize function to include the PDF button handler
async function initialize() {
    const spells = await loadSpellData();
    
    // Add card size control handlers
    const cardWidth = document.getElementById('cardWidth');
    const ratioWidth = document.getElementById('ratioWidth');
    const ratioHeight = document.getElementById('ratioHeight');
    
    function updateCardSize() {
        const width = parseInt(cardWidth.value);
        const rWidth = parseInt(ratioWidth.value);
        const rHeight = parseInt(ratioHeight.value);
        
        // Ensure we have valid numbers
        if (width && rWidth && rHeight && rWidth > 0 && rHeight > 0) {
            const ratio = rHeight / rWidth;
            console.log('Updating card size:', `${width}mm`, `${rWidth}:${rHeight}`, ratio);
            document.documentElement.style.setProperty('--card-width', `${width}mm`);
            document.documentElement.style.setProperty('--card-ratio', ratio);
            
            // Check for overflow after a small delay to allow the DOM to update
            setTimeout(updateOverflowStatus, 100);
        }
    }
    
    // Add event listeners for both 'input' and 'change' events
    cardWidth.addEventListener('input', updateCardSize);
    cardWidth.addEventListener('change', updateCardSize);
    ratioWidth.addEventListener('input', updateCardSize);
    ratioWidth.addEventListener('change', updateCardSize);
    ratioHeight.addEventListener('input', updateCardSize);
    ratioHeight.addEventListener('change', updateCardSize);
    
    // Set initial values
    updateCardSize();
    
    window.allSpellCards = []; // Store reference to all spell cards
    
    // Set up event listeners for filters and sorting
    const searchInput = document.getElementById('searchInput');
    const levelFilter = document.getElementById('levelFilter');
    const schoolFilter = document.getElementById('schoolFilter');
    const classFilter = document.getElementById('classFilter');
    const reprintFilter = document.getElementById('reprintFilter');
    const sortBySelect = document.getElementById('sortBy');
    
    async function updateDisplay() {
        const filteredAndSortedSpells = filterAndSortSpells(
            spells,
            searchInput.value,
            levelFilter.value,
            schoolFilter.value,
            classFilter.value,
            sortBySelect.value,
            reprintFilter.value
        );
        await renderSpellCards(filteredAndSortedSpells);
        updateSortDisplay();
        updateSelectAllButton();
    }
    
    // Add event listeners
    searchInput.addEventListener('input', updateDisplay);
    levelFilter.addEventListener('change', updateDisplay);
    schoolFilter.addEventListener('change', updateDisplay);
    classFilter.addEventListener('change', updateDisplay);
    reprintFilter.addEventListener('change', updateDisplay);
    
    // Handle sort selection and order toggling
    sortBySelect.addEventListener('click', (e) => {
        // Only handle clicks on options
        if (e.target.tagName === 'OPTION') {
            const clickedValue = e.target.value;
            if (clickedValue === sortBySelect.value) {
                // Same sort method clicked, toggle order
                currentSortOrder = currentSortOrder === 'desc' ? 'asc' : 'desc';
            } else {
                // New sort method selected, default to descending
                currentSortOrder = 'desc';
            }
            sortBySelect.value = clickedValue;
            updateDisplay();
            
            // Prevent the default behavior to keep the select open
            e.preventDefault();
        }
    });
    
    // Add select all button handler
    const selectAllButton = document.getElementById('selectAllButton');
    selectAllButton.addEventListener('click', toggleSelectAll);
    
    // Add export button handler
    const exportButton = document.getElementById('exportButton');
    exportButton.addEventListener('click', exportSelectedSpells);

    // Add PDF generation button handler
    const generatePdfButton = document.getElementById('generatePdfButton');
    generatePdfButton.addEventListener('click', generatePdf);
    
    // Initial status updates
    updateSelectionStatus();
    await updateDisplay();
}

// Start the application
initialize();
document.addEventListener('DOMContentLoaded', () => {
    // Initialize date buttons
    initializeDateButtons();
    
    // Load substitutions for current date by default
    loadSubstitutionsForDate(0);
    
    // Setup refresh button
    document.getElementById('refresh-button').addEventListener('click', () => {
        const activeButton = document.querySelector('.date-btn.active');
        const offset = activeButton ? parseInt(activeButton.dataset.offset) : 0;
        loadSubstitutionsForDate(offset);
    });
    
    // Setup menu button
    document.getElementById('menu-button').addEventListener('click', toggleSideMenu);
    document.getElementById('close-side-menu').addEventListener('click', toggleSideMenu);
    document.getElementById('overlay').addEventListener('click', toggleSideMenu);
    
    // Setup theme selectors
    initializeThemeSelectors();
});

// Initialize date buttons
function initializeDateButtons() {
    const dateButtons = document.querySelectorAll('.date-btn');
    
    dateButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            dateButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');
            
            // Load substitutions for selected date
            const offset = parseInt(button.dataset.offset);
            loadSubstitutionsForDate(offset);
        });
    });
}

// Load substitutions for a specific date
function loadSubstitutionsForDate(offset) {
    // Show loading indicator
    document.getElementById('substitutions-container').classList.remove('hidden');
    document.getElementById('no-substitutions').classList.add('hidden');
    
    // Calculate date based on offset
    const date = new Date();
    date.setDate(date.getDate() + offset);
    
    // Update selected date text
    updateSelectedDateText(date);
    
    // Format date for file name
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const filename = `${year}-${month}-${day}.xlsx`;
    const url = `https://zmianawplanie.pl/uploads/${filename}`;
    
    // Fetch substitutions file
    fetch(url)
        .then(response => {
            if (!response.ok) throw new Error('Brak zastępstw');
            return response.arrayBuffer();
        })
        .then(data => processExcelData(data))
        .catch(error => {
            console.error(error);
            showNoSubstitutions();
        });
}

// Update selected date text
function updateSelectedDateText(date) {
    const days = ['niedziela', 'poniedziałek', 'wtorek', 'środa', 'czwartek', 'piątek', 'sobota'];
    const months = [
        'stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca', 
        'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia'
    ];
    
    const dayName = days[date.getDay()];
    const day = date.getDate();
    const monthName = months[date.getMonth()];
    
    document.getElementById('selected-date').textContent = `(${dayName}, ${day} ${monthName})`;
}

// Process Excel data
function processExcelData(data) {
    const workbook = XLSX.read(data, { type: 'array' });
    const sheetName = "Oddziały";
    const sheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(sheet);
    
    // Sort and organize data with improved handling of art classes
    const sortedData = jsonData.map(row => {
        let baseClass = row.Oddział || "";
        let isArtClass = baseClass.includes("LSP") || baseClass.includes("PA") || baseClass.includes("PB");
        let numericPart = parseInt(baseClass.match(/\d+/), 10) || 0;
        let alphabeticalPart = baseClass.match(/[A-Z]+/)?.[0] || "";
        
        // Create a unique identifier for each class
        let classKey = baseClass;
        
        // Normalize display name
        let displayName = baseClass;
        if (baseClass.includes("LSP")) {
            displayName = baseClass.replace("LSP", "");
        } else if (baseClass.includes("PA")) {
            displayName = baseClass.replace("PA", "A");
        } else if (baseClass.includes("PB")) {
            displayName = baseClass.replace("PB", "B");
        }
        
        return { 
            ...row, 
            classKey,
            displayName,
            isArtClass,
            numericPart, 
            alphabeticalPart,
            originalClass: baseClass
        };
    }).sort((a, b) => {
        // First sort regular classes, then art classes
        if (a.isArtClass !== b.isArtClass) {
            return a.isArtClass ? 1 : -1; // Art classes at the end
        }
        
        // Then sort by numeric part
        if (a.numericPart !== b.numericPart) {
            return a.numericPart - b.numericPart;
        }
        
        // Then by alphabetical part
        return a.alphabeticalPart.localeCompare(b.alphabeticalPart);
    });
    
    // Group by class using the unique identifier
    const substitutionsByClass = {};
    
    sortedData.forEach(row => {
        const classKey = row.classKey;
        if (!substitutionsByClass[classKey]) {
            substitutionsByClass[classKey] = {
                items: [],
                originalClass: row.originalClass,
                displayName: row.displayName,
                isArtClass: row.isArtClass
            };
        }
        substitutionsByClass[classKey].items.push(row);
    });
    
    // Render substitutions
    renderSubstitutions(substitutionsByClass);
}

// Identify substitution type
function identifySubstitutionType(row) {
    const odwołane = row.Zastępca && ["Okienko dla uczniów", "Uczniowie zwolnieni do domu", "Uczniowie przychodzą później"].includes(row.Zastępca);
    const przeniesienie = row.Uwagi && row.Uwagi.trim() !== '';
    
    if (odwołane && przeniesienie) {
        return "moved"; // Odwołane ale z uwagami staje się przeniesione
    } else if (odwołane) {
        return "cancelled"; // Standardowe odwołanie
    } else if (przeniesienie) {
        return "moved"; // Standardowe przeniesienie
    } else if (row.Zastępca && row.Zastępca.trim() !== '') {
        return "substitution";
    } else {
        return "other";
    }
}

// Get type badge text based on type
function getTypeBadgeText(type) {
    switch (type) {
        case "cancelled": return "Odwołane";
        case "moved": return "Przeniesione";
        case "substitution": return "Zastępstwo";
        case "other": return "Informacja";
        default: return "Zastępstwo";
    }
}

// Shorten teacher name
function shortenName(name) {
    if (!name) return name;
    if (name === "Okienko dla uczniów") return name;
    if (name === "Uczniowie zwolnieni do domu") return name;
    if (name === "Uczniowie przychodzą później") return name;
    
    const parts = name.split(' ');
    if (parts.length === 2) {
        return `${parts[1].charAt(0)}. ${parts[0]}`; // Zmiana kolejności
    } else if (parts.length === 3) {
        return `${parts[2].charAt(0)}. ${parts[0]} ${parts[1]}`; // Zmiana kolejności
    }
    return name;
}

// Apply subject shortcuts
function applySubjectShortcuts(text) {
    if (!text) return text;
    
    const subjectShortcuts = {
        "Doradztwo zawodowe": "DZ",
        "Biznes i zarządzanie": "BiZ",
        "Historia i teraźniejszość": "HiT",
        "Podstawy warsztatu dziennikarskiego": "PWD",
        "Podstawy przedsiębiorczości": "PP",
        "Zajęcia biblioteczne": "Z. biblioteczne",
        "Zajęcia pedagogiczne": "Z. pedagogiczne",
        "Projektowanie multimedialne": "P. multimedialne",
        "Specjalność artystyczna": "S. artystyczna",
        "Historia sztuki": "H. sztuki"
    };
    
    text = text.replace(/\bJęzyk\b/g, "J.");
    Object.keys(subjectShortcuts).forEach(fullName => {
        const shortcut = subjectShortcuts[fullName];
        text = text.replace(new RegExp(fullName, "g"), shortcut);
    });
    
    return text;
}

// Find auto-substitution suggestion
function findAutoSubstitution(przedmiot, zastępca, odwołane, przeniesienie) {
    if (!zastępca && !odwołane && !przeniesienie) {
        if (przedmiot.includes("Matematyka")) {
            return "Sugerowane zastępstwo: Sosnowski Paweł (Matematyka)";
        } else if (przedmiot.includes("Fizyka")) {
            return "Sugerowane zastępstwo: Winkler Tadeusz (Fizyka)";
        } else if (przedmiot.includes("Angielski") || przedmiot.includes("J. angielski")) {
            return "Sugerowane zastępstwo: Dzierżęga Marta (J. angielski)";
        } else if (przedmiot.includes("Polski") || przedmiot.includes("J. polski")) {
            return "Sugerowane zastępstwo: Matys Helena (J. polski)";
        } else if (przedmiot.includes("Historia")) {
            return "Sugerowane zastępstwo: Materzok Wiktoria (Historia)";
        }
    }
    return null;
}

// Render substitutions
function renderSubstitutions(substitutionsByClass) {
    const container = document.getElementById('substitutions-container');
    container.innerHTML = ''; // Clear container
    
    let totalCount = 0;
    
    // Create a section for regular classes
    const regularSection = document.createElement('div');
    regularSection.className = 'section-regular';
    
    // Create a section for art classes
    const artSection = document.createElement('div');
    artSection.className = 'section-art';
    const artSectionHeader = document.createElement('h3');
    artSectionHeader.className = 'section-header';
    artSectionHeader.textContent = 'Klasy Plastyczne (LSP)';
    artSection.appendChild(artSectionHeader);
    
    // Create cards for each class
    Object.keys(substitutionsByClass).forEach(classKey => {
        const classData = substitutionsByClass[classKey];
        
        const card = document.createElement('div');
        card.className = 'sub-card';
        
        // Create card header
        const cardHeader = document.createElement('div');
        cardHeader.className = 'sub-card-header';
        
        const className = document.createElement('div');
        className.className = 'sub-class-name';
        
        // Class name
        className.textContent = classData.displayName;
        
        // Add art badge for LSP classes
        if (classData.isArtClass) {
            const artBadge = document.createElement('span');
            artBadge.className = 'class-badge art-badge';
            artBadge.textContent = 'LSP';
            className.appendChild(artBadge);
        }
        
        cardHeader.appendChild(className);
        card.appendChild(cardHeader);
        
        // Create substitution items
        classData.items.forEach(row => {
            const subType = identifySubstitutionType(row);
            const subItem = document.createElement('div');
            subItem.className = `sub-item ${subType}`;
            
            // Create sub header (lesson number and badges)
            const subHeader = document.createElement('div');
            subHeader.className = 'sub-header';
            
            // Lesson number
            if (row.Lekcja) {
                const lesson = document.createElement('div');
                lesson.className = 'sub-lesson';
                lesson.textContent = `Lekcja ${row.Lekcja}`;
                subHeader.appendChild(lesson);
            }
            
            // Badges container
            const badges = document.createElement('div');
            badges.className = 'sub-badges';
            
            // Type badge
            const typeBadge = document.createElement('span');
            typeBadge.className = `sub-badge type-badge ${subType}`;
            typeBadge.textContent = getTypeBadgeText(subType);
            badges.appendChild(typeBadge);
            
            // Room badge if available
            if (row.Sala) {
                const roomBadge = document.createElement('span');
                roomBadge.className = 'sub-badge room-badge';
                roomBadge.textContent = `Sala ${row.Sala}`;
                badges.appendChild(roomBadge);
            }
            
            subHeader.appendChild(badges);
            subItem.appendChild(subHeader);
            
            // Create content section
            const content = document.createElement('div');
            content.className = 'sub-content';
            
            // Subject
            const subject = document.createElement('div');
            subject.className = 'sub-subject';
            
            const odwołane = (subType === "cancelled");
            const przeniesienie = (subType === "moved");
            const przedmiot = applySubjectShortcuts(row.Przedmiot || '');
            
            if (odwołane || przeniesienie) {
                subject.innerHTML = `<s>${przedmiot}</s>`;
            } else {
                subject.textContent = przedmiot;
            }
            
            content.appendChild(subject);
            
            // Teacher substitution
            const teacherDiv = document.createElement('div');
            teacherDiv.className = 'sub-teacher';
            
            const nauczyciel = row["Nauczyciel/wakat"] || '';
            const zastępca = row.Zastępca || '';
            const nauczycielShort = shortenName(nauczyciel);
            const zastępcaShort = shortenName(zastępca);
            
            if (przeniesienie) {
                // Gdy lekcja jest przeniesiona, pokazujemy przekreślony nauczyciel i strzałka do uwag
                if (row.Uwagi && row.Uwagi.trim() !== '') {
                    teacherDiv.innerHTML = `<s>${nauczycielShort}</s> &rarr; ${row.Uwagi}`;
                } else {
                    teacherDiv.innerHTML = `<s>${nauczycielShort}</s>`;
                }
            } else if (odwołane) {
                // Gdy lekcja jest odwołana, pokazujemy przekreślony nauczyciel i strzałka do zastępca
                teacherDiv.innerHTML = `<s>${nauczycielShort}</s> &rarr; ${zastępca}`;
            } else if (nauczyciel && zastępca) {
                // Standardowe zastępstwo
                teacherDiv.innerHTML = `<s>${nauczycielShort}</s> &rarr; ${zastępcaShort}`;
            } else {
                // Bez zmian
                teacherDiv.textContent = nauczycielShort || zastępcaShort;
            }
            
            content.appendChild(teacherDiv);
            
            // Add notes if available
            if (row.Uwagi && row.Uwagi.trim() !== '' && !przeniesienie) {
                const note = document.createElement('div');
                note.className = 'note';
                note.textContent = `Uwaga: ${row.Uwagi}`;
                content.appendChild(note);
            }
            
            // Add automatic substitution suggestion if applicable
            const autoSubstitution = findAutoSubstitution(przedmiot, zastępca, odwołane, przeniesienie);
            if (autoSubstitution) {
                const autoNote = document.createElement('div');
                autoNote.className = 'note';
                autoNote.textContent = autoSubstitution;
                content.appendChild(autoNote);
            }
            
            subItem.appendChild(content);
            card.appendChild(subItem);
            totalCount++;
        });
        
        // Add card to appropriate section
        if (classData.isArtClass) {
            artSection.appendChild(card);
        } else {
            regularSection.appendChild(card);
        }
    });
    
    // Add sections to container
    container.appendChild(regularSection);
    
    // Only add art section if it has children
    if (artSection.childElementCount > 1) { // > 1 because it already has the header
        container.appendChild(artSection);
    }
    
    // Hide loading indicator
    const loadingIndicator = document.querySelector('.loading-indicator');
    if (loadingIndicator) {
        loadingIndicator.remove();
    }
    
    // Show no substitutions message if needed
    if (totalCount === 0) {
        showNoSubstitutions();
    } else {
        document.getElementById('no-substitutions').classList.add('hidden');
    }
}

// Show no substitutions message
function showNoSubstitutions() {
    document.getElementById('substitutions-container').innerHTML = '';
    document.getElementById('no-substitutions').classList.remove('hidden');
}

// Toggle side menu
function toggleSideMenu() {
    document.getElementById('side-menu').classList.toggle('open');
    document.getElementById('overlay').classList.toggle('active');
}

// Initialize theme selectors
function initializeThemeSelectors() {
    const themeOptions = document.querySelectorAll('.theme-option');
    const savedTheme = localStorage.getItem('theme') || 'dark';
    
    // Apply saved theme on load
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // Update active class based on saved theme
    themeOptions.forEach(option => {
        if (option.dataset.theme === savedTheme) {
            option.classList.add('active');
        } else {
            option.classList.remove('active');
        }
        
        // Add click event listener
        option.addEventListener('click', () => {
            const theme = option.dataset.theme;
            
            // Remove active class from all options
            themeOptions.forEach(opt => opt.classList.remove('active'));
            
            // Add active class to clicked option
            option.classList.add('active');
            
            // Apply theme
            document.documentElement.setAttribute('data-theme', theme);
            
            // Save theme to localStorage
            localStorage.setItem('theme', theme);
        });
    });
}

// Install app banner functionality
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then((registration) => {
                console.log('Service Worker zarejestrowany pomyślnie:', registration.scope);
            })
            .catch((error) => {
                console.error('Błąd rejestracji Service Worker:', error);
            });
    });
}

// Handle install banner
let deferredPrompt;
const installBanner = document.getElementById('install-banner');
const installButton = document.getElementById('install-app');
const closeInstallButton = document.getElementById('close-install');

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installBanner.classList.add('show');
});

installButton.addEventListener('click', () => {
    installBanner.classList.remove('show');
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('Użytkownik zaakceptował instalację A2HS');
            } else {
                console.log('Użytkownik odrzucił instalację A2HS');
            }
            deferredPrompt = null;
        });
    }
});

closeInstallButton.addEventListener('click', () => {
    installBanner.classList.remove('show');
});
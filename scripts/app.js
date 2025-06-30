// DOM Elements
const welcomeScreen = document.getElementById('welcome-screen');
const startAppBtn = document.getElementById('start-app');
const menuButton = document.getElementById('menu-button');
const sideMenu = document.getElementById('side-menu');
const closeSideMenuBtn = document.getElementById('close-side-menu');
const overlay = document.getElementById('overlay');
const installBanner = document.getElementById('install-banner');
const installBtn = document.getElementById('install-app');
const closeInstallBtn = document.getElementById('close-install');
const themeOptions = document.querySelectorAll('.theme-option');
const currentDateElement = document.getElementById('current-date');

// Global Variables
let deferredPrompt;

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    // Initialize app functions
    initWelcomeScreen();
    updateCurrentDate();
    initThemeSelector();
    initEventListeners();
    checkForInstallPrompt();
    
    // Add service worker for PWA functionality
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js')
            .then(registration => {
                console.log('Service Worker registered with scope:', registration.scope);
            })
            .catch(error => {
                console.error('Service Worker registration failed:', error);
            });
    }
});

// Welcome Screen Logic
function initWelcomeScreen() {
    // Check if the user has already seen the welcome screen
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    
    if (hasSeenWelcome === 'true') {
        welcomeScreen.classList.add('hidden');
    } else {
        welcomeScreen.classList.remove('hidden');
    }
    
    // Start App button click handler
    startAppBtn.addEventListener('click', () => {
        welcomeScreen.classList.add('hidden');
        localStorage.setItem('hasSeenWelcome', 'true');
    });
}

// Date Functions
function updateCurrentDate() {
    if (currentDateElement) {
        const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
        const currentDate = new Date().toLocaleDateString('pl-PL', options);
        currentDateElement.textContent = capitalizeFirstLetter(currentDate);
    }
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Theme Selector
function initThemeSelector() {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme') || 'dark';
    applyTheme(savedTheme);
    
    // Mark the active theme option
    themeOptions.forEach(option => {
        if (option.dataset.theme === savedTheme) {
            option.classList.add('active');
        }
        
        // Add click event listener
        option.addEventListener('click', () => {
            const selectedTheme = option.dataset.theme;
            applyTheme(selectedTheme);
            saveTheme(selectedTheme);
            
            // Update active class
            themeOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
        });
    });
}

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
}

function saveTheme(theme) {
    localStorage.setItem('theme', theme);
}

// Event Listeners
function initEventListeners() {
    // Menu button click handler
    menuButton.addEventListener('click', toggleSideMenu);
    
    // Close side menu button click handler
    closeSideMenuBtn.addEventListener('click', toggleSideMenu);
    
    // Overlay click handler
    overlay.addEventListener('click', toggleSideMenu);
    
    // Install banner handlers
    if (installBtn) {
        installBtn.addEventListener('click', installApp);
    }
    
    if (closeInstallBtn) {
        closeInstallBtn.addEventListener('click', dismissInstallBanner);
    }
    
    // Touch ripple effect
    document.addEventListener('click', createRippleEffect);
}

// Side Menu Functions
function toggleSideMenu() {
    sideMenu.classList.toggle('active');
    overlay.classList.toggle('active');
    document.body.classList.toggle('no-scroll');
}

// Install App Banner Functions
function checkForInstallPrompt() {
    // Check if the user has dismissed the install banner
    const hasSeenInstallBanner = localStorage.getItem('hasSeenInstallBanner');
    
    // Only show the install banner if it hasn't been dismissed
    if (!hasSeenInstallBanner) {
        // Check if the app is already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            // App is already installed, don't show the banner
            return;
        }
        
        // Show install banner after 3 seconds
        setTimeout(() => {
            installBanner.style.display = 'flex';
        }, 3000);
    }
    
    // Listen for the beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent the default browser install prompt
        e.preventDefault();
        
        // Store the event for later use
        deferredPrompt = e;
        
        // Show the install banner if not dismissed
        if (!hasSeenInstallBanner) {
            installBanner.style.display = 'flex';
        }
    });
}

function installApp() {
    // Hide the install banner
    installBanner.style.display = 'none';
    
    // Show the install prompt
    if (deferredPrompt) {
        deferredPrompt.prompt();
        
        // Wait for the user to respond to the prompt
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the install prompt');
            } else {
                console.log('User dismissed the install prompt');
            }
            
            // Clear the deferred prompt
            deferredPrompt = null;
        });
    }
}

function dismissInstallBanner() {
    installBanner.style.display = 'none';
    localStorage.setItem('hasSeenInstallBanner', 'true');
}

// Ripple Effect
function createRippleEffect(event) {
    const buttons = [
        '.welcome-btn', 
        '.header-button', 
        '.dock-item', 
        '.side-menu-item', 
        '.theme-option',
        '.install-btn'
    ];
    
    // Check if the click was on a button or interactive element
    if (event.target.closest(buttons.join(', '))) {
        const element = event.target.closest(buttons.join(', '));
        const rect = element.getBoundingClientRect();
        
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        const ripple = document.createElement('span');
        ripple.classList.add('touch-ripple');
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        
        element.appendChild(ripple);
        
        // Remove the ripple after animation completes
        setTimeout(() => {
            ripple.remove();
        }, 800);
    }
}

// Notification Functions
function showNotification(message, duration = 3000) {
    // Create notification element
    const notification = document.createElement('div');
    notification.classList.add('notification');
    notification.textContent = message;
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Hide and remove notification after duration
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, duration);
}

// Export functions for other modules
window.appFunctions = {
    showNotification,
    toggleSideMenu
};
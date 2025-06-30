// DOM Elements
const timerIndicator = document.getElementById('timer-indicator');
const timerLabel = document.getElementById('timer-label');
const timerTime = document.getElementById('timer-time');
const timerProgressBar = document.getElementById('timer-progress-bar');
const timerNext = document.getElementById('timer-next');

// Schedule Configuration
const schoolSchedule = {
    // Format: [hour, minute]
    periods: [
        { name: "0 lekcja", start: [7, 10], end: [7, 55] },
        { name: "Przerwa", start: [7, 55], end: [8, 00] },
        { name: "1 lekcja", start: [8, 0], end: [8, 45] },
        { name: "Przerwa", start: [8, 45], end: [8, 55] },
        { name: "2 lekcja", start: [8, 55], end: [9, 40] },
        { name: "Przerwa", start: [9, 40], end: [9, 45] },
        { name: "3 lekcja", start: [9, 45], end: [10, 30] },
        { name: "Przerwa", start: [10, 30], end: [10, 45] }, // Longer break
        { name: "4 lekcja", start: [10, 45], end: [11, 30] },
        { name: "Przerwa", start: [11, 30], end: [11, 35] },
        { name: "5 lekcja", start: [11, 35], end: [12, 20] },
        { name: "Przerwa", start: [12, 20], end: [12, 25] }, // Longer break
        { name: "6 lekcja", start: [12, 25], end: [13, 10] },
        { name: "Przerwa", start: [13, 10], end: [13, 15] },
        { name: "7 lekcja", start: [13, 15], end: [14, 00] },
        { name: "Przerwa", start: [14, 00], end: [14, 05] },
        { name: "8 lekcja", start: [14, 05], end: [14, 50] },
        { name: "Przerwa", start: [14, 50], end: [14, 55] },
        { name: "9 lekcja", start: [14, 55], end: [15, 40] },
        { name: "Przerwa", start: [15, 40], end: [15, 45] },
        { name: "10 lekcja", start: [15, 45], end: [16, 30] },
        { name: "Przerwa", start: [16, 30], end: [16, 35] },
        { name: "11 lekcja", start: [16, 35], end: [17, 20] },
    ],
    // Days when school is in session (0 = Sunday, 1 = Monday, etc.)
    schoolDays: [1, 2, 3, 4, 5] // Monday to Friday
};

// Initialize Timer
document.addEventListener('DOMContentLoaded', () => {
    // Start timer update interval
    updateTimer();
    setInterval(updateTimer, 1000);
});

// Timer Functions
function updateTimer() {
    const now = new Date();
    const day = now.getDay();
    
    // Check if today is a school day
    if (!schoolSchedule.schoolDays.includes(day)) {
        displayOffSchoolMessage();
        return;
    }
    
    // Get current period
    const currentPeriod = getCurrentPeriod(now);
    
    if (!currentPeriod) {
        displayOffHoursMessage();
        return;
    }
    
    // Display current period info
    displayPeriodInfo(currentPeriod, now);
}

function getCurrentPeriod(now) {
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinute;
    
    // Check if current time falls within any period
    for (const period of schoolSchedule.periods) {
        const startTimeInMinutes = period.start[0] * 60 + period.start[1];
        const endTimeInMinutes = period.end[0] * 60 + period.end[1];
        
        if (currentTimeInMinutes >= startTimeInMinutes && currentTimeInMinutes < endTimeInMinutes) {
            return {
                ...period,
                startTimeInMinutes,
                endTimeInMinutes,
                isBreak: period.name.includes("Przerwa")
            };
        }
    }
    
    // Outside of school hours
    return null;
}

function getNextPeriod(currentPeriod) {
    const currentIndex = schoolSchedule.periods.findIndex(p => 
        p.start[0] === currentPeriod.start[0] && 
        p.start[1] === currentPeriod.start[1]);
    
    if (currentIndex !== -1 && currentIndex < schoolSchedule.periods.length - 1) {
        const nextPeriod = schoolSchedule.periods[currentIndex + 1];
        return nextPeriod;
    }
    
    return null;
}

function formatTime(hours, minutes) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function displayPeriodInfo(currentPeriod, now) {
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentSecond = now.getSeconds();
    const currentTimeInMinutes = currentHour * 60 + currentMinute + (currentSecond / 60);
    
    // Calculate remaining time
    const remainingMinutes = currentPeriod.endTimeInMinutes - currentTimeInMinutes;
    const remainingHours = Math.floor(remainingMinutes / 60);
    const remainingMinutesDisplay = Math.floor(remainingMinutes % 60);
    const remainingSecondsDisplay = Math.floor((remainingMinutes % 1) * 60);
    
    // Display remaining time
    timerTime.textContent = `${String(remainingHours).padStart(2, '0')}:${String(remainingMinutesDisplay).padStart(2, '0')}:${String(remainingSecondsDisplay).padStart(2, '0')}`;
    
    // Update label and indicator
    if (currentPeriod.isBreak) {
        timerLabel.textContent = `Trwa przerwa`;
        timerIndicator.classList.add('break');
    } else {
        timerLabel.textContent = `Trwa ${currentPeriod.name.toLowerCase()}`;
        timerIndicator.classList.remove('break');
    }
    
    // Update progress bar
    const periodDuration = currentPeriod.endTimeInMinutes - currentPeriod.startTimeInMinutes;
    const elapsedTime = currentTimeInMinutes - currentPeriod.startTimeInMinutes;
    const progressPercentage = (elapsedTime / periodDuration) * 100;
    
    timerProgressBar.style.width = `${progressPercentage}%`;
    
    // Display next period info
    const nextPeriod = getNextPeriod(currentPeriod);
    
    if (nextPeriod) {
        const nextStart = formatTime(nextPeriod.start[0], nextPeriod.start[1]);
        const nextEnd = formatTime(nextPeriod.end[0], nextPeriod.end[1]);
        
        if (nextPeriod.name.includes("Przerwa")) {
            timerNext.textContent = `Następna przerwa: ${nextStart} - ${nextEnd}`;
        } else {
            timerNext.textContent = `Następna lekcja: ${nextPeriod.name}, ${nextStart} - ${nextEnd}`;
        }
    } else {
        timerNext.textContent = `Koniec lekcji na dziś`;
    }
}

function displayOffSchoolMessage() {
    timerLabel.textContent = 'Dzień wolny';
    timerTime.textContent = '00:00:00';
    timerNext.textContent = 'Dziś nie ma lekcji';
    timerProgressBar.style.width = '0%';
    timerIndicator.classList.add('break');
}

function displayOffHoursMessage() {
    const now = new Date();
    const currentHour = now.getHours();
    
    if (currentHour < schoolSchedule.periods[0].start[0]) {
        // Before school hours
        const startTime = formatTime(schoolSchedule.periods[0].start[0], schoolSchedule.periods[0].start[1]);
        timerLabel.textContent = 'Przed lekcjami';
        timerTime.textContent = '00:00:00';
        timerNext.textContent = `Lekcje zaczynają się o ${startTime}`;
    } else {
        // After school hours
        timerLabel.textContent = 'Po lekcjach';
        timerTime.textContent = '00:00:00';
        timerNext.textContent = 'Koniec lekcji na dziś';
    }
    
    timerProgressBar.style.width = '0%';
    timerIndicator.classList.add('break');
}

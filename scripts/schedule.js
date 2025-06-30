// Script for handling schedule behaviors
document.addEventListener('DOMContentLoaded', function() {
    // Handle class items click for expanding/collapsing
    const classItems = document.querySelectorAll('.class-item');
    
    classItems.forEach(item => {
        item.addEventListener('click', function() {
            const className = this.getAttribute('data-class');
            const scheduleContent = document.getElementById(`schedule-${className}`);
            const arrow = this.querySelector('.class-arrow');
            
            // Toggle active class on schedule content
            if (scheduleContent.classList.contains('active')) {
                scheduleContent.classList.remove('active');
                arrow.classList.remove('active');
            } else {
                // Close any open schedule first
                document.querySelectorAll('.schedule-content.active').forEach(openContent => {
                    openContent.classList.remove('active');
                });
                document.querySelectorAll('.class-arrow.active').forEach(activeArrow => {
                    activeArrow.classList.remove('active');
                });
                
                // Open the clicked schedule
                scheduleContent.classList.add('active');
                arrow.classList.add('active');
                
                // Scroll to the content with smooth animation
                setTimeout(() => {
                    scheduleContent.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }, 100);
            }
        });
    });
    
    // Side menu handling - using the same code as in app.js for consistency
    const menuButton = document.getElementById('menu-button');
    const sideMenu = document.getElementById('side-menu');
    const closeMenuButton = document.getElementById('close-side-menu');
    const overlay = document.getElementById('overlay');
    
    menuButton.addEventListener('click', function(e) {
        e.preventDefault();
        sideMenu.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
    
    function closeMenu() {
        sideMenu.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    closeMenuButton.addEventListener('click', closeMenu);
    overlay.addEventListener('click', closeMenu);
});
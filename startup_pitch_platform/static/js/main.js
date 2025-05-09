/**
 * Startup Investment Pitching Platform
 * Main JavaScript File
 */

// DOM Elements
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
const modals = document.querySelectorAll('.modal');
const modalToggles = document.querySelectorAll('[href^="#"][href$="-modal"]');
const modalCloses = document.querySelectorAll('.modal-close');
const registerTabs = document.querySelectorAll('.tab-btn');
const carouselPrev = document.querySelector('.carousel-prev');
const carouselNext = document.querySelector('.carousel-next');
const pitchCards = document.querySelector('.pitch-cards');

// Navigation
function initNavigation() {
    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('active');
            navLinks.classList.toggle('active');
        });
    }

    // Add scroll class to navigation
    window.addEventListener('scroll', () => {
        const nav = document.querySelector('.main-nav');
        if (nav) {
            if (window.scrollY > 50) {
                nav.classList.add('scrolled');
            } else {
                nav.classList.remove('scrolled');
            }
        }
    });
}

// Modals
function initModals() {
    // Open modal
    modalToggles.forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            e.preventDefault();
            const modalId = toggle.getAttribute('href').replace('#', '');
            const modal = document.getElementById(modalId);

            if (modal) {
                openModal(modal);
            }
        });
    });

    // Close modal with X button
    modalCloses.forEach(close => {
        close.addEventListener('click', () => {
            const modal = close.closest('.modal');
            if (modal) {
                closeModal(modal);
            }
        });
    });

    // Close modal when clicking outside
    modals.forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal);
            }
        });
    });

    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            modals.forEach(modal => {
                if (modal.classList.contains('active')) {
                    closeModal(modal);
                }
            });
        }
    });

    // Register tabs
    if (registerTabs.length) {
        registerTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                registerTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                // Additional tab functionality can be added here
            });
        });
    }
}

function openModal(modal) {
    document.body.style.overflow = 'hidden';
    modal.classList.add('active');

    // Add animation classes
    const content = modal.querySelector('.modal-content');
    if (content) {
        content.style.animation = 'scaleIn 0.3s ease';
    }
}

function closeModal(modal) {
    document.body.style.overflow = '';
    modal.classList.remove('active');
}

// Carousel
function initCarousel() {
    if (carouselPrev && carouselNext && pitchCards) {
        let currentPosition = 0;
        const cardWidth = 340; // Card width + gap
        const numCards = pitchCards.children.length;
        const maxPosition = Math.max(0, numCards - 3); // Show 3 cards at a time on desktop

        updateCarouselButtons();

        carouselPrev.addEventListener('click', () => {
            if (currentPosition > 0) {
                currentPosition--;
                updateCarouselPosition();
            }
        });

        carouselNext.addEventListener('click', () => {
            if (currentPosition < maxPosition) {
                currentPosition++;
                updateCarouselPosition();
            }
        });

        function updateCarouselPosition() {
            // For smaller screens, we adjust the number of cards shown
            let visibleCards = 3;

            if (window.innerWidth < 992) {
                visibleCards = 2;
            }

            if (window.innerWidth < 768) {
                visibleCards = 1;
            }

            const maxPos = Math.max(0, numCards - visibleCards);
            currentPosition = Math.min(currentPosition, maxPos);

            const transformValue = -currentPosition * cardWidth;

            // Apply smooth animation
            gsap.to(pitchCards, {
                x: transformValue,
                duration: 0.5,
                ease: 'power2.out'
            });

            updateCarouselButtons();
        }

        function updateCarouselButtons() {
            let visibleCards = 3;

            if (window.innerWidth < 992) {
                visibleCards = 2;
            }

            if (window.innerWidth < 768) {
                visibleCards = 1;
            }

            const maxPos = Math.max(0, numCards - visibleCards);

            carouselPrev.disabled = currentPosition <= 0;
            carouselNext.disabled = currentPosition >= maxPos;

            carouselPrev.style.opacity = carouselPrev.disabled ? '0.5' : '1';
            carouselNext.style.opacity = carouselNext.disabled ? '0.5' : '1';
        }

        // Update on window resize
        window.addEventListener('resize', () => {
            updateCarouselPosition();
        });
    }
}

// Scroll animations
function initScrollAnimations() {
    // Detect elements to animate when they enter the viewport
    const animateElements = document.querySelectorAll('.animate-on-scroll');

    function checkInView() {
        const windowHeight = window.innerHeight;
        const windowTop = window.scrollY;
        const windowBottom = windowTop + windowHeight;

        animateElements.forEach(element => {
            const elementTop = element.offsetTop;
            const elementBottom = elementTop + element.offsetHeight;

            // Check if element is in viewport
            if (elementBottom > windowTop && elementTop < windowBottom) {
                element.classList.add('animated');
            }
        });
    }

    // Initial check
    checkInView();

    // Check on scroll
    window.addEventListener('scroll', checkInView);
}

// Smooth scrolling for anchor links
function initSmoothScroll() {
    const anchorLinks = document.querySelectorAll('a[href^="#"]:not([href="#"])');

    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Skip modal links
            if (this.getAttribute('href').includes('-modal')) {
                return;
            }

            e.preventDefault();

            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                // Close mobile menu if open
                if (navLinks && navLinks.classList.contains('active')) {
                    navToggle.classList.remove('active');
                    navLinks.classList.remove('active');
                }

                // Scroll to element
                window.scrollTo({
                    top: targetElement.offsetTop - 80, // Account for fixed header
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Form validation
function initFormValidation() {
    const forms = document.querySelectorAll('form');

    forms.forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            let isValid = true;
            const inputs = form.querySelectorAll('input[required]');

            inputs.forEach(input => {
                if (!input.value.trim()) {
                    isValid = false;
                    input.classList.add('invalid');
                } else {
                    input.classList.remove('invalid');
                }

                // Email validation
                if (input.type === 'email' && input.value.trim()) {
                    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailPattern.test(input.value.trim())) {
                        isValid = false;
                        input.classList.add('invalid');
                    }
                }

                // Password match validation for registration
                if (input.id === 'register-confirm-password') {
                    const password = document.getElementById('register-password');
                    if (password && input.value !== password.value) {
                        isValid = false;
                        input.classList.add('invalid');
                    }
                }
            });

            if (isValid) {
                // In a real app, submit the form or call API
                console.log('Form submitted successfully');
                form.reset();

                // If it's a modal form, close the modal
                const modal = form.closest('.modal');
                if (modal) {
                    closeModal(modal);
                }
            }
        });

        // Real-time validation
        const inputs = form.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                if (input.classList.contains('invalid')) {
                    if (input.value.trim()) {
                        input.classList.remove('invalid');
                    }
                }
            });
        });
    });
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initModals();
    initCarousel();
    initScrollAnimations();
    initSmoothScroll();
    initFormValidation();

    // Add animate-on-scroll class to sections
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        if (!section.classList.contains('hero-section')) {
            section.classList.add('animate-on-scroll');
        }
    });

    // Add typing animation to hero title
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        gsap.from(heroTitle, {
            opacity: 0,
            y: 50,
            duration: 1,
            delay: 0.5
        });
    }

    // Add fade in animation to hero description
    const heroDescription = document.querySelector('.hero-description');
    if (heroDescription) {
        gsap.from(heroDescription, {
            opacity: 0,
            y: 30,
            duration: 1,
            delay: 0.8
        });
    }

    // Add fade in animation to hero buttons
    const heroButtons = document.querySelector('.hero-buttons');
    if (heroButtons) {
        gsap.from(heroButtons, {
            opacity: 0,
            y: 20,
            duration: 1,
            delay: 1.1
        });
    }

    // Add counter animation to statistics
    const statNumbers = document.querySelectorAll('.stat-number');
    if (statNumbers.length) {
        statNumbers.forEach(stat => {
            const value = stat.textContent;
            stat.textContent = '0';

            gsap.to(stat, {
                textContent: value,
                duration: 2,
                delay: 1.3,
                ease: 'power1.out',
                onUpdate: function() {
                    stat.textContent = stat.textContent.replace(/\d+/, function(match) {
                        return Math.round(parseFloat(match)).toString();
                    });
                }
            });
        });
    }
});

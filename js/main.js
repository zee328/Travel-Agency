// Register service worker for offline/caching support
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/js/sw.js').catch(() => {
    // Silently fail if SW not available
  });
}
/*
    TRAVEL AGENCY WEBSITE - MAIN JAVASCRIPT
    zee trivago - Interactive Features
   
    FEATURES:
    - Mobile navigation toggle (hamburger menu)
    - Smooth scroll navigation
    - Contact form validation
   
    Using vanilla JavaScript (no frameworks)
    All code is beginner-friendly with detailed comments
*/

// API base URL for backend endpoints (override via window.API_BASE or data-api-base on <body>)
const API_BASE = window.API_BASE || document.body.dataset.apiBase || 'http://localhost:4000/api';

// Supported currencies and exchange rates (relative to USD)
const SUPPORTED_CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD'];
const EXCHANGE_RATES = {
    USD: 1.0,
    EUR: 0.92,
    GBP: 0.79,
    JPY: 149.5,
    AUD: 1.52,
    CAD: 1.36
};

function convertCurrencyAmount(amount, fromCurrency = 'USD', toCurrency = 'USD') {
    const from = fromCurrency.toUpperCase();
    const to = toCurrency.toUpperCase();
    const fromRate = EXCHANGE_RATES[from];
    const toRate = EXCHANGE_RATES[to];
    if (!fromRate || !toRate) return amount;
    const amountInUSD = amount / fromRate;
    return amountInUSD * toRate;
}

function convertFromUSD(amount, currency) {
    return convertCurrencyAmount(amount, 'USD', currency);
}

function formatCurrencyAmount(amount, currency) {
    const code = currency?.toUpperCase() || 'USD';
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: code,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

const THEME_OPTIONS = [
    { id: 'light', label: 'Light' },
    { id: 'dark', label: 'Dark' },
    { id: 'ocean', label: 'Ocean' },
    { id: 'forest', label: 'Forest' },
    { id: 'desert', label: 'Desert' }
];

// In-memory state for dynamic rendering
let testimonialData = [];

// ========== DOM READY CHECK ==========
// This ensures the HTML is fully loaded before we try to interact with elements
document.addEventListener('DOMContentLoaded', function() {
    console.log('✓ Page loaded successfully');
    
    // Initialize all functionality
    initializeMobileNavigation();
    initializeNavigation();
    initializeContactForm();
    initializeChatbot();
    initializeNewsletterForm();
    initializeBackToTop();
    initializeCurrencyConverter();
    initializeWeatherSearch();
});

// ========== MOBILE NAVIGATION TOGGLE ==========

/**
 * Initialize mobile navigation toggle (hamburger menu)
 * This allows users to open/close navigation on small screens
 */
function initializeMobileNavigation() {
    const hamburger = document.getElementById('hamburgerMenu');
    const navLinks = document.getElementById('navLinks');
    
    // Check if hamburger menu exists (for responsive design)
    if (!hamburger) return;
    
    /**
     * Toggle mobile menu visibility
     * Adds/removes 'active' class to show/hide navigation
     */
    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
        console.log('Mobile menu toggled');
    });
    
    // Close mobile menu when a link is clicked (for better UX)
    const links = navLinks.querySelectorAll('a');
    links.forEach(link => {
        link.addEventListener('click', function() {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });
}

// ========== SMOOTH SCROLL NAVIGATION ==========

/**
 * Initialize smooth scrolling for navigation links
 * When you click a navigation link, the page smoothly scrolls to that section
 */
function initializeNavigation() {
    const navLinks = document.querySelectorAll('.nav-links a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            // Get the target section ID from the href attribute (e.g., "#home")
            const targetId = this.getAttribute('href');
            
            // Only handle internal links (starting with #)
            if (targetId.startsWith('#')) {
                event.preventDefault();
                
                const targetSection = document.querySelector(targetId);
                if (targetSection) {
                    // Scroll smoothly to the target section
                    // 'smooth' behavior creates the nice animation
                    targetSection.scrollIntoView({ behavior: 'smooth' });
                    console.log('Scrolled to:', targetId);
                }
            }
        });
    });
}

// ========== CONTACT FORM VALIDATION ==========

/**
 * Initialize contact form handling with enhanced validation
 * Provides real-time field validation and user auth account tracking
 */
function initializeContactForm() {
    const contactForm = document.querySelector('.contact-form');
    
    if (!contactForm) return;
    
    // Get all form fields for real-time validation
    const nameInput = contactForm.querySelector('input[name="name"]');
    const emailInput = contactForm.querySelector('input[name="email"]');
    const phoneInput = contactForm.querySelector('input[name="phone"]');
    const messageInput = contactForm.querySelector('textarea[name="message"]');
    
    // Add blur listeners - only validate when user leaves field (after they've had a chance to type)
    if (nameInput) {
        nameInput.addEventListener('blur', () => validateField('name', false, true));
        nameInput.addEventListener('focus', () => clearFieldError('name'));
    }
    if (emailInput) {
        emailInput.addEventListener('blur', () => validateField('email', false, true));
        emailInput.addEventListener('focus', () => clearFieldError('email'));
    }
    if (phoneInput) {
        phoneInput.addEventListener('blur', () => validateField('phone', true, true));
        phoneInput.addEventListener('focus', () => clearFieldError('phone'));
    }
    
    // For message: show character count on input but only validate on blur
    if (messageInput) {
        messageInput.addEventListener('input', () => {
            const count = messageInput.value.trim().length;
            const hint = document.getElementById('messageHint');
            if (hint) {
                hint.textContent = count > 0 ? `${count} characters${count >= 10 ? ' ✓' : ''}` : 'Minimum 10 characters';
                if (count >= 10) hint.style.color = '#2ed573';
                else if (count > 0) hint.style.color = 'var(--text-light)';
                else hint.style.color = 'var(--text-light)';
            }
        });
        messageInput.addEventListener('blur', () => validateField('message', false, true));
        messageInput.addEventListener('focus', () => clearFieldError('message'));
    }
    
    // Listen for form submission
    contactForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        // Get all form input values
        const name = nameInput ? nameInput.value.trim() : '';
        const email = emailInput ? emailInput.value.trim() : '';
        const phone = phoneInput ? phoneInput.value.trim() : '';
        const message = messageInput ? messageInput.value.trim() : '';
        const destination = contactForm.querySelector('input[name="destination"]')?.value.trim() || '';
        
        // Validate all fields on submit (show all errors at once)
        const isNameValid = validateField('name', false, true);
        const isEmailValid = validateField('email', false, true);
        const isPhoneValid = validateField('phone', true, true); // phone is optional
        const isMessageValid = validateField('message', false, true);
        
        if (!isNameValid || !isEmailValid || !isMessageValid) {
            showErrorMessage('Please complete all required fields correctly');
            return;
        }
        
        // If validation passes, create user account and submit form
        createUserAccount(name, email, phone).then(() => {
            submitContactForm({
                name,
                email,
                phone,
                destination,
                message
            });
        });
    });
    
    /**
     * Clear error message for a field
     */
    function clearFieldError(fieldName) {
        const errorEl = document.getElementById(`${fieldName}Error`);
        if (errorEl) errorEl.textContent = '';
    }
    
    /**
     * Validate individual form field
     * @param {string} fieldName - The name of the field to validate
     * @param {boolean} isOptional - Whether the field is optional
     * @param {boolean} showErrors - Whether to display error messages
     */
    function validateField(fieldName, isOptional = false, showErrors = false) {
        const field = contactForm.querySelector(`input[name="${fieldName}"], textarea[name="${fieldName}"]`);
        if (!field) return true;
        
        const value = field.value.trim();
        const errorEl = document.getElementById(`${fieldName}Error`);
        let error = '';
        let isValid = true;
        
        if (fieldName === 'name') {
            if (!value && !isOptional) {
                error = 'This field needs correction - Name is required';
                isValid = false;
            } else if (value.length < 2 && value.length > 0) {
                error = 'This field needs correction - Name must be at least 2 characters';
                isValid = false;
            } else if (value.length > 100) {
                error = 'This field needs correction - Name is too long';
                isValid = false;
            }
        } else if (fieldName === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!value && !isOptional) {
                error = 'This field needs correction - Email is required';
                isValid = false;
            } else if (value && !emailRegex.test(value)) {
                error = 'This field needs correction - Invalid email format';
                isValid = false;
            }
        } else if (fieldName === 'phone') {
            if (value && value.length < 10) {
                error = 'This field needs correction - Phone must be at least 10 characters';
                isValid = false;
            }
        } else if (fieldName === 'message') {
            if (!value && !isOptional) {
                error = 'This field needs correction - Message is required';
                isValid = false;
            } else if (value.length < 10 && value.length > 0) {
                error = 'This field needs correction - Minimum 10 characters';
                isValid = false;
            } else if (value.length > 2000) {
                error = 'This field needs correction - Message is too long';
                isValid = false;
            }
        }
        
        // Update field visual state and error message
        if (showErrors && errorEl) errorEl.textContent = error;
        field.classList.remove('success', 'error');
        
        // Only show success/error classes if we're showing errors
        if (showErrors) {
            if (isValid && value) {
                field.classList.add('success');
            } else if (!isValid) {
                field.classList.add('error');
            }
        }
        
        return isValid;
    }
    
    console.log('✓ Contact form initialized with enhanced validation');
}

/**
 * Create a user account for the form submitter
 * Stores user in localStorage for future reference
 * @param {string} name - User's full name
 * @param {string} email - User's email
 * @param {string} phone - User's phone (optional)
 */
async function createUserAccount(name, email, phone) {
    try {
        // Get existing users from localStorage
        const users = JSON.parse(localStorage.getItem('zeetrivago_users') || '[]');
        
        // Check if user already exists
        const existingUser = users.find(u => u.email === email);
        if (existingUser) {
            console.log('✓ User account already exists:', email);
            return Promise.resolve();
        }
        
        // Create new user account
        const userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        const newUser = {
            id: userId,
            name,
            email,
            phone,
            createdAt: new Date().toISOString(),
            accountStatus: 'active',
            preferences: {
                notifications: true,
                newsletter: false,
                travelAlerts: true
            }
        };
        
        // Store user in localStorage
        users.push(newUser);
        localStorage.setItem('zeetrivago_users', JSON.stringify(users));
        
        // Store current user session
        localStorage.setItem('zeetrivago_currentUser', JSON.stringify({
            id: newUser.id,
            name: newUser.name,
            email: newUser.email
        }));
        
        console.log('✓ User account created:', newUser.id);
        showSuccessMessage(`Account created for ${name}! Welcome to zee trivago.`);
        
        return Promise.resolve();
    } catch (error) {
        console.error('Account creation error:', error);
        // Don't block form submission if account creation fails
        return Promise.resolve();
    }
}
    
    // All validations passed!
    return true;
}

/**
 * Display success message to the user
 * In a real app, this would be a styled notification
 * For now, we use alert() which is simple but noticeable
 * 
 * @param {string} message - The success message to display
 */
function showSuccessMessage(message) {
    console.log('✓ Success:', message);
    
    // Show alert to user
    alert(message);
    
    // TODO: In future, replace alert() with custom styled notification box
    // This would be more user-friendly and professional
}

/**
 * Display error message to the user
 * Used when form validation fails
 * 
 * @param {string} message - The error message to display
 */
function showErrorMessage(message) {
    console.error('✗ Validation Error:', message);
    
    // Show alert to user
    alert(message);
    
    // TODO: In future, replace alert() with custom styled error box
    // This would highlight which field has the error
}

// ========== NEWSLETTER SUBSCRIPTION ==========

/**
 * Initialize newsletter subscription form
 * Validates email and shows confirmation
 */
function initializeNewsletterForm() {
    const newsletterForm = document.getElementById('newsletterForm');
    
    if (!newsletterForm) return;
    
    newsletterForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        const emailInput = document.getElementById('newsletterEmail');
        const email = emailInput.value.trim();
        
        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showErrorMessage('Please enter a valid email address');
            return;
        }
        subscribeToNewsletter(email);
    });
    
    console.log('✓ Newsletter form initialized');
}

// ========== THEME PICKER ==========

/**
 * Initialize multi-theme picker
 * Applies selected theme to <body data-theme> and persists preference
 */
function initializeThemeToggle() {
    const optionsContainer = document.getElementById('themeOptions');
    if (!optionsContainer) return;

    const savedTheme = localStorage.getItem('theme');
    const initialTheme = THEME_OPTIONS.some(t => t.id === savedTheme) ? savedTheme : 'light';
    applyTheme(initialTheme);

    optionsContainer.addEventListener('click', (event) => {
        const button = event.target.closest('[data-theme]');
        if (!button) return;
        applyTheme(button.dataset.theme);
    });

    function applyTheme(themeName) {
        const theme = THEME_OPTIONS.some(t => t.id === themeName) ? themeName : 'light';
        document.body.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        updateActiveChip(theme);
        console.log('✓ Theme switched to:', theme);
    }

    function updateActiveChip(activeTheme) {
        optionsContainer.querySelectorAll('[data-theme]').forEach(btn => {
            const isActive = btn.dataset.theme === activeTheme;
            btn.classList.toggle('active', isActive);
            btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        });
    }
}

// ========== BACK TO TOP BUTTON ==========

/**
 * Initialize back to top button
 * Shows/hides based on scroll position
 */
function initializeBackToTop() {
    const backToTopButton = document.getElementById('backToTop');
    
    if (!backToTopButton) return;
    
    // Show/hide button based on scroll position
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backToTopButton.classList.add('visible');
        } else {
            backToTopButton.classList.remove('visible');
        }
    });
    
    // Scroll to top on click
    backToTopButton.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        console.log('✓ Scrolled to top');
    });
    
    console.log('✓ Back to top button initialized');
}

// ========== ABOUT SECTION COUNTERS ==========

/**
 * Animated counter for about section statistics
 * Counts up to target numbers when section comes into view
 */
function initializeAboutCounters() {
    const counters = document.querySelectorAll('.count-up');
    if (counters.length === 0) return;

    let hasAnimated = false;

    const animateCounter = (counter) => {
        const target = parseInt(counter.getAttribute('data-target'));
        const duration = 2000; // 2 seconds
        const increment = target / (duration / 16); // 60fps
        let current = 0;

        const updateCounter = () => {
            current += increment;
            if (current < target) {
                counter.textContent = Math.floor(current);
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target;
            }
        };

        updateCounter();
    };

    // Intersection Observer to trigger animation when section is visible
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !hasAnimated) {
                hasAnimated = true;
                counters.forEach(counter => {
                    animateCounter(counter);
                });
            }
        });
    }, { threshold: 0.5 });

    // Observe the about section
    const aboutSection = document.querySelector('.about-stats');
    if (aboutSection) {
        observer.observe(aboutSection);
    }

    console.log('✓ About counters initialized');
}

// ========== CURRENCY CONVERTER ==========

/**
 * Initialize currency converter widget
 * Uses real-time exchange rates
 */
function initializeCurrencyConverter() {
    const amountInput = document.getElementById('currencyAmount');
    const fromCurrency = document.getElementById('fromCurrency');
    const toCurrency = document.getElementById('toCurrency');
    const convertedAmount = document.getElementById('convertedAmount');
    
    console.log('Currency converter elements:', {
        amountInput: !!amountInput,
        fromCurrency: !!fromCurrency,
        toCurrency: !!toCurrency,
        convertedAmount: !!convertedAmount
    });
    
    if (!amountInput || !fromCurrency || !toCurrency || !convertedAmount) {
        console.warn('Currency converter elements not found');
        return;
    }
    
    /**
     * Convert currency and display result
     */
    function convertCurrency() {
        try {
            const amount = parseFloat(amountInput.value) || 0;
            const from = fromCurrency.value;
            const to = toCurrency.value;

            console.log('Converting:', { amount, from, to });

            const result = convertCurrencyAmount(amount, from, to);
            const formatted = formatCurrencyAmount(result, to);
            
            console.log('Conversion result:', formatted);
            convertedAmount.textContent = formatted;
        } catch (error) {
            console.error('Currency conversion error:', error);
            convertedAmount.textContent = 'Error';
        }
    }
    
    // Add event listeners
    amountInput.addEventListener('input', convertCurrency);
    fromCurrency.addEventListener('change', convertCurrency);
    toCurrency.addEventListener('change', convertCurrency);
    
    // Initial conversion with a small delay to ensure DOM is ready
    setTimeout(() => {
        convertCurrency();
    }, 100);
    
    console.log('✓ Currency converter initialized');
}

// ========== DATA FETCH & RENDER HELPERS ==========

async function fetchTestimonials() {
    const grid = document.getElementById('testimonialsGrid');
    if (!grid) return;
    grid.innerHTML = '<p class="loading">Loading testimonials...</p>';
    try {
        const response = await fetch(`${API_BASE}/testimonials`);
        if (!response.ok) throw new Error('Request failed');
        testimonialData = await response.json();
        renderTestimonials(testimonialData);
    } catch (error) {
        console.error('Failed to fetch testimonials', error);
        // Fallback sample testimonials to keep UI alive
        const fallback = [
            { name: 'Ava L.', rating: 5, comment: 'Seamless booking and amazing support. The Europe trip was unforgettable!', createdAt: new Date() },
            { name: 'Noah R.', rating: 5, comment: 'Loved the beach escape package—great resorts and activities.', createdAt: new Date() },
            { name: 'Mia K.', rating: 4, comment: 'Asia Adventure was well organized. Guides were friendly and knowledgeable.', createdAt: new Date() }
        ];
        testimonialData = fallback;
        renderTestimonials(fallback);
    }
}

function renderTestimonials(list) {
    const grid = document.getElementById('testimonialsGrid');
    if (!grid) return;
    if (!list || list.length === 0) {
        grid.innerHTML = '<p class="loading">No testimonials yet.</p>';
        return;
    }
    grid.innerHTML = list.map(item => `
        <article class="testimonial-card">
            <div class="rating">${'★'.repeat(item.rating || 5)}</div>
            <p class="testimonial-text">"${item.comment || ''}"</p>
            <div class="testimonial-author">
                <strong>${item.name}</strong>
                <span>${item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}</span>
            </div>
        </article>
    `).join('');
}

async function subscribeToNewsletter(email) {
    try {
        const response = await fetch(`${API_BASE}/newsletter`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        if (response.status === 409) {
            showErrorMessage('You are already subscribed.');
            return;
        }
        if (!response.ok) throw new Error('Request failed');
        showSuccessMessage('🎉 Thank you for subscribing! Check your inbox for exclusive travel deals.');
        const form = document.getElementById('newsletterForm');
        if (form) form.reset();
    } catch (error) {
        console.error('Failed to subscribe', error);
        showErrorMessage('Could not subscribe right now. Please try again later.');
    }
}

async function submitContactForm(payload) {
    try {
        const response = await fetch(`${API_BASE}/contact`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error('Request failed');
        showSuccessMessage('Thank you for reaching out! We\'ll get back to you within 24 hours.');
        const form = document.getElementById('contactForm');
        if (form) form.reset();
    } catch (error) {
        console.error('Failed to submit contact form', error);
        showErrorMessage('Could not send your message. Please try again later.');
    }
}

// ========== UTILITY FUNCTIONS ==========

// ========== AI CHATBOT FUNCTIONALITY ==========

/**
 * Initialize chatbot functionality
 * Creates a conversational AI assistant for user support
 * Handles opening/closing chat window and message processing
 */
function initializeChatbot() {
    const chatbotButton = document.getElementById('chatbotButton');
    const closeChatButton = document.getElementById('closeChatButton');
    const chatbotWindow = document.getElementById('chatbotWindow');
    const sendButton = document.getElementById('sendButton');
    const chatbotInput = document.getElementById('chatbotInput');
    
    // Check if chatbot elements exist
    if (!chatbotButton) return;
    
    /**
     * Toggle chatbot window visibility
     * Clicking the floating button opens/closes the chat window
     */
    chatbotButton.addEventListener('click', function() {
        chatbotWindow.classList.toggle('active');
        if (chatbotWindow.classList.contains('active')) {
            // Focus input when window opens for better UX
            chatbotInput.focus();
        }
    });
    
    /**
     * Close chatbot when close button is clicked
     */
    closeChatButton.addEventListener('click', function() {
        chatbotWindow.classList.remove('active');
    });
    
    /**
     * Send user message when send button is clicked
     */
    sendButton.addEventListener('click', sendChatMessage);
    
    /**
     * Send message when user presses Enter key
     */
    chatbotInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            sendChatMessage();
        }
    });
    
    /**
     * Send message to chatbot and display response
     */
    function sendChatMessage() {
        const userMessage = chatbotInput.value.trim();
        
        if (!userMessage) return; // Don't send empty messages
        
        const messagesContainer = document.getElementById('chatbotMessages');
        
        // Display user message
        const userMessageEl = document.createElement('div');
        userMessageEl.className = 'user-message';
        userMessageEl.innerHTML = `<p>${escapeHTML(userMessage)}</p>`;
        messagesContainer.appendChild(userMessageEl);
        
        // Clear input field
        chatbotInput.value = '';
        
        // Simulate bot thinking delay (more natural conversation)
        setTimeout(() => {
            // Get bot response based on user message
            const botResponse = getBotResponse(userMessage);
            
            // Display bot message
            const botMessageEl = document.createElement('div');
            botMessageEl.className = 'bot-message';
            botMessageEl.innerHTML = `<p>${botResponse}</p>`;
            messagesContainer.appendChild(botMessageEl);
            
            // Scroll to latest message
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }, 500);
        
        // Scroll to latest message
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    /**
     * Generate bot response based on user input
     * Uses keyword matching to provide relevant answers
     * 
     * @param {string} userInput - What the user typed
     * @returns {string} - Bot's response
     */
    function getBotResponse(userInput) {
        // Convert input to lowercase for easier matching
        const input = userInput.toLowerCase();
        
        // Destination-related queries
        if (input.includes('bali') || input.includes('indonesia')) {
            return '🏖️ Bali is a tropical paradise! Perfect for beach lovers and culture enthusiasts. Popular activities include temple visits, rice terrace trekking, and surfing. Would you like help booking a Bali trip?';
        }
        if (input.includes('paris') || input.includes('france')) {
            return '🗼 Paris is the City of Light! Home to the Eiffel Tower, Louvre Museum, and world-class cuisine. Perfect for romantic getaways and art lovers. Ready to book your Parisian adventure?';
        }
        if (input.includes('dubai') || input.includes('uae')) {
            return '🌆 Dubai is a luxurious desert oasis! Experience ultra-modern architecture, pristine beaches, and desert safaris. Perfect for luxury travelers. Interested in a Dubai package?';
        }
        if (input.includes('tokyo') || input.includes('japan')) {
            return '🗾 Tokyo is a fascinating blend of ancient and modern! Visit temples, experience cutting-edge technology, and enjoy incredible food. A must-visit destination! Want help planning your Tokyo trip?';
        }
        if (input.includes('italy') || input.includes('rome') || input.includes('venice')) {
            return '🇮🇹 Italy offers incredible history, art, and cuisine! From Rome\'s ancient ruins to Venice\'s canals and Florence\'s Renaissance treasures, Italy is unforgettable. Shall I help you explore Italian destinations?';
        }
        
        // Booking and services
        if (input.includes('book') || input.includes('booking') || input.includes('reserve')) {
            return '📅 We offer comprehensive booking services! We can arrange flights, hotels, tours, and travel insurance. All customized to your preferences. Would you like to discuss your travel plans?';
        }
        if (input.includes('price') || input.includes('cost') || input.includes('how much')) {
            return '💰 Our prices vary based on destinations and travel styles. We offer budget-friendly to luxury options. Contact our team for personalized quotes. Would you like a specific destination estimate?';
        }
        if (input.includes('package') || input.includes('tour')) {
            return '🎒 We offer customized travel packages for every budget and preference! From adventure trips to luxury escapes, we create unforgettable experiences. Tell me what kind of travel you\'re interested in!';
        }
        
        // Customer service
        if (input.includes('contact') || input.includes('call') || input.includes('email')) {
            return '📞 You can contact us through our website contact form or email hello@zeetrivago.com. Our team is available 24/7 to assist you. Anything specific I can help with right now?';
        }
        if (input.includes('visa') || input.includes('visa assistance')) {
            return '🛂 We provide expert visa assistance for all major destinations! Our team handles the paperwork and requirements, making travel planning stress-free. Which country are you planning to visit?';
        }
        if (input.includes('insurance') || input.includes('travel protection')) {
            return '🛡️ We offer comprehensive travel insurance covering medical emergencies, cancellations, and baggage loss. Essential for peace of mind while traveling. Would you like to add insurance to your booking?';
        }
        
        // Help and navigation
        if (input.includes('help') || input.includes('what can you do') || input.includes('how can you help')) {
            return '🤖 I can help you with:\n• Information about destinations\n• Travel packages and bookings\n• Visa assistance\n• Travel insurance\n• General travel advice\n\nWhat would you like to know about?';
        }
        if (input.includes('destination') || input.includes('where to go') || input.includes('recommend')) {
            return '🌍 We offer 150+ destinations worldwide! From tropical beaches to mountain adventures, romantic cities to adventure hotspots. What kind of travel interests you? Beach, culture, adventure, or luxury?';
        }
        
        // Greetings
        if (input.includes('hello') || input.includes('hi') || input.includes('hey')) {
            return '👋 Hello! Welcome to zee trivago! I\'m here to help with your travel plans. Are you looking for a specific destination or travel service?';
        }
        if (input.includes('thank') || input.includes('thanks') || input.includes('thank you')) {
            return '😊 You\'re welcome! Is there anything else I can help you with for your travel plans?';
        }
        
        // About company
        if (input.includes('about') || input.includes('who are you') || input.includes('company')) {
            return '🏢 zee trivago is your trusted travel partner since 2010! We specialize in creating personalized travel experiences. With 15+ years of experience and 150+ destinations, we\'ve helped 10,000+ travelers create unforgettable memories. How can we help yours?';
        }
        
        // Default response
        return '😊 That\'s a great question! For more detailed information, I\'d recommend contacting our team directly through the contact form or visiting our website sections. Is there anything specific about travel destinations or services I can help with?';
    }
    
    /**
     * Escape HTML special characters to prevent injection
     * Keeps user input safe
     * 
     * @param {string} text - Text to escape
     * @returns {string} - Escaped text
     */
    function escapeHTML(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }
}

// ========== WEATHER SEARCH ==========

/**
 * Initialize weather search functionality
 * Allows users to search for weather in any location worldwide
 * Uses OpenWeatherMap API for real-time data
 */
function initializeWeatherSearch() {
    const searchBtn = document.getElementById('weatherSearchBtn');
    const locationInput = document.getElementById('weatherLocationInput');
    const resultsContainer = document.getElementById('weatherResults');
    const suggestionsEl = document.getElementById('weatherSuggestions');
    const OPEN_WEATHER_API_KEY = '7288e1f589d12cdc243205b3a6d4727f';
    let selectedSuggestion = null;
    let activeIndex = -1;
    let debounceTimer = null;
    
    if (!searchBtn) return;
    
    // Handle search button click
    searchBtn.addEventListener('click', performWeatherSearch);
    
    // Handle Enter key in input field
    locationInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performWeatherSearch();
        }
    });
    
    // Autocomplete: fetch city suggestions as user types
    locationInput.addEventListener('input', () => {
        const q = locationInput.value.trim();
        selectedSuggestion = null;
        activeIndex = -1;
        if (debounceTimer) clearTimeout(debounceTimer);
        if (q.length < 2) {
            if (suggestionsEl) suggestionsEl.innerHTML = '';
            return;
        }
        debounceTimer = setTimeout(async () => {
            try {
                const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(q)}&limit=5&appid=${OPEN_WEATHER_API_KEY}`;
                const resp = await fetch(url);
                const list = await resp.json();
                renderSuggestions(list || []);
            } catch (e) {
                if (suggestionsEl) suggestionsEl.innerHTML = '';
            }
        }, 300);
    });
    
    // Keyboard navigation in suggestions
    locationInput.addEventListener('keydown', (e) => {
        const items = suggestionsEl?.querySelectorAll('.item') || [];
        if (!items.length) return;
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            activeIndex = Math.min(activeIndex + 1, items.length - 1);
            updateActiveItem(items);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            activeIndex = Math.max(activeIndex - 1, 0);
            updateActiveItem(items);
        } else if (e.key === 'Enter' && activeIndex >= 0) {
            e.preventDefault();
            items[activeIndex].click();
        }
    });
    
    function updateActiveItem(items) {
        items.forEach(el => el.classList.remove('active'));
        if (items[activeIndex]) items[activeIndex].classList.add('active');
    }
    
    function renderSuggestions(list) {
        if (!suggestionsEl) return;
        if (!list.length) { suggestionsEl.innerHTML = ''; return; }
        suggestionsEl.innerHTML = list.map((c, idx) => {
            const secondary = [c.state, c.country].filter(Boolean).join(', ');
            const label = `${c.name}${secondary ? ', ' + secondary : ''}`;
            return `<div class="item" role="option" data-lat="${c.lat}" data-lon="${c.lon}" data-label="${label}">
                        ${c.name}
                        <span class="secondary">${secondary}</span>
                    </div>`;
        }).join('');
        suggestionsEl.querySelectorAll('.item').forEach((el) => {
            el.addEventListener('mousedown', (evt) => {
                evt.preventDefault(); // prevent input blur before click
                const lat = parseFloat(el.dataset.lat);
                const lon = parseFloat(el.dataset.lon);
                const label = el.dataset.label;
                selectedSuggestion = { lat, lon, label };
                locationInput.value = label;
                suggestionsEl.innerHTML = '';
                performWeatherSearch();
            });
        });
    }
    
    // Hide suggestions when input loses focus (slight delay to allow click)
    locationInput.addEventListener('blur', () => {
        setTimeout(() => { if (suggestionsEl) suggestionsEl.innerHTML = ''; }, 150);
    });
    
    /**
     * Perform the weather search
     * Fetches weather data from OpenWeatherMap API
     */
    async function performWeatherSearch() {
        const location = locationInput.value.trim();
        
        if (!location) {
            resultsContainer.innerHTML = '<div class="error">Please enter a city name</div>';
            return;
        }
        
        // Show loading state
        resultsContainer.innerHTML = '<div class="loading">🔍 Searching weather...</div>';
        
        try {
            let weatherResponse;
            let forecastResponse;
            if (selectedSuggestion && !Number.isNaN(selectedSuggestion.lat) && !Number.isNaN(selectedSuggestion.lon)) {
                const { lat, lon } = selectedSuggestion;
                weatherResponse = await fetch(
                    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${OPEN_WEATHER_API_KEY}`
                );
                forecastResponse = await fetch(
                    `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${OPEN_WEATHER_API_KEY}`
                );
            } else {
                // Fallback to name-based search
                weatherResponse = await fetch(
                    `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&units=metric&appid=${OPEN_WEATHER_API_KEY}`
                );
                forecastResponse = await fetch(
                    `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(location)}&units=metric&appid=${OPEN_WEATHER_API_KEY}`
                );
            }
            
            if (!weatherResponse.ok) {
                const errorData = await weatherResponse.json();
                throw new Error(errorData.message || 'Location not found');
            }
            
            const weatherData = await weatherResponse.json();
            
            if (!forecastResponse.ok) {
                const errorData = await forecastResponse.json();
                throw new Error(errorData.message || 'Forecast not available');
            }
            
            const forecastData = await forecastResponse.json();
            
            // Display results
            displayWeatherResults(weatherData, forecastData);
            selectedSuggestion = null;
            
            console.log('✓ Weather fetched for:', location);
        } catch (error) {
            const errorMessage = error.message || 'Unable to fetch weather data';
            resultsContainer.innerHTML = `
                <div class="error">
                    ❌ ${errorMessage}. ${error.message.includes('Invalid API key') ? 'API key issue detected.' : 'Please check the spelling and try again.'}
                </div>
            `;
            console.error('Weather fetch error:', error.message);
        }
    }
    
    /**
     * Display weather results in the UI
     * Shows current conditions and 5-day forecast
     */
    function displayWeatherResults(current, forecast) {
        // Apply themed background based on current condition
        setWeatherTheme(current.weather[0].main);
        const weatherIcon = getWeatherIcon(current.weather[0].main);
        const temp = Math.round(current.main.temp);
        const feelsLike = Math.round(current.main.feels_like);
        const humidity = current.main.humidity;
        const windSpeed = Math.round(current.wind.speed * 3.6); // m/s to km/h
        
        // Build current weather card
        let html = `
            <div class="weather-card">
                <div class="weather-current">
                    <div class="weather-icon">${weatherIcon}</div>
                    <div>
                        <div class="weather-temp">${temp}°C</div>
                        <div>${current.name}, ${current.sys.country}</div>
                        <div style="font-size: 0.95rem; opacity: 0.9; margin-top: 5px;">
                            ${current.weather[0].description}
                        </div>
                    </div>
                </div>
                
                <div class="weather-details">
                    <div class="weather-detail-item">
                        <div class="weather-detail-label">Feels Like</div>
                        <div>${feelsLike}°C</div>
                    </div>
                    <div class="weather-detail-item">
                        <div class="weather-detail-label">Humidity</div>
                        <div>${humidity}%</div>
                    </div>
                    <div class="weather-detail-item">
                        <div class="weather-detail-label">Wind Speed</div>
                        <div>${windSpeed} km/h</div>
                    </div>
                    <div class="weather-detail-item">
                        <div class="weather-detail-label">Pressure</div>
                        <div>${current.main.pressure} mb</div>
                    </div>
                </div>
                
                <div class="weather-forecast">
                    <h3>📅 5-Day Forecast</h3>
                    <div class="forecast-grid">
        `;
        
        // Process forecast data (get one entry per day at noon)
        const forecastByDay = {};
        forecast.list.forEach(item => {
            const date = new Date(item.dt * 1000);
            const day = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
            
            // Get the closest to noon (12:00)
            if (!forecastByDay[day] || Math.abs(date.getHours() - 12) < 6) {
                forecastByDay[day] = item;
            }
        });
        
        // Display forecast cards
        Object.entries(forecastByDay).slice(0, 5).forEach(([day, data]) => {
            const icon = getWeatherIcon(data.weather[0].main);
            const temp = Math.round(data.main.temp);
            
            html += `
                <div class="forecast-item">
                    <div class="day">${day}</div>
                    <div class="icon">${icon}</div>
                    <div class="temp">${temp}°C</div>
                </div>
            `;
        });
        
        html += `
                    </div>
                </div>
            </div>
        `;
        
        resultsContainer.innerHTML = html;
    }
    
    /**
     * Get emoji icon for weather condition
     */
    function getWeatherIcon(condition) {
        const icons = {
            'Clear': '☀️',
            'Clouds': '☁️',
            'Rainy': '🌧️',
            'Rain': '🌧️',
            'Drizzle': '🌦️',
            'Thunderstorm': '⛈️',
            'Snow': '❄️',
            'Mist': '🌫️',
            'Smoke': '🌫️',
            'Haze': '🌫️',
            'Dust': '🌪️',
            'Fog': '🌫️',
            'Sand': '🌪️',
            'Ash': '🌫️',
            'Squall': '🌪️',
            'Tornado': '🌪️'
        };
        
        return icons[condition] || '🌤️';
    }
    
    /**
     * Set weather section theme class based on condition
     */
    function setWeatherTheme(condition) {
        const section = document.getElementById('weather');
        if (!section) return;
        const themes = ['theme-clear', 'theme-clouds', 'theme-rain', 'theme-snow'];
        themes.forEach(t => section.classList.remove(t));
        
        const map = {
            'Clear': 'theme-clear',
            'Clouds': 'theme-clouds',
            'Rain': 'theme-rain',
            'Drizzle': 'theme-rain',
            'Thunderstorm': 'theme-rain',
            'Snow': 'theme-snow',
            'Mist': 'theme-clouds',
            'Haze': 'theme-clouds',
            'Fog': 'theme-clouds'
        };
        
        section.classList.add(map[condition] || 'theme-clear');
    }
    
    console.log('✓ Weather search initialized');
}

// ========== UTILITY FUNCTIONS ==========

/**
 * Log page initialization info for debugging
 * Helps developers understand what's happening on page load
 */
function logPageInfo() {
    console.log('═══════════════════════════════════════');
    console.log('  zee trivago - Travel Agency Website');
    console.log('═══════════════════════════════════════');
    console.log('Loaded at:', new Date().toLocaleString());
    console.log('User Agent:', navigator.userAgent);
    console.log('═══════════════════════════════════════');
}

// ========== TRAVEL PACKAGES ==========

/**
 * Initialize travel packages functionality
 * Loads and displays packages with booking capabilities
 */
async function initializePackages() {
    const packagesGrid = document.getElementById('packagesGrid');
    
    if (!packagesGrid) return;
    
    try {
        // Fetch packages from local JSON file
        const response = await fetch('data/packages.json');
        const data = await response.json();
        const packages = data.packages;
        
        // Display package cards
        packagesGrid.innerHTML = packages.map(pkg => createPackageCard(pkg)).join('');
        
        // Add event listeners for "View Details" buttons
        document.querySelectorAll('.btn-view-details').forEach(btn => {
            btn.addEventListener('click', () => {
                const packageId = parseInt(btn.dataset.packageId);
                const selectedPackage = packages.find(p => p.id === packageId);
                openPackageModal(selectedPackage);
            });
        });
        
        console.log('✓ Packages loaded successfully');
    } catch (error) {
        console.error('Error loading packages:', error);
        packagesGrid.innerHTML = '<p class="error">Unable to load packages. Please try again later.</p>';
    }
}

/**
 * Create HTML for a package card
 */
function createPackageCard(pkg) {
    const popularBadge = pkg.popular ? '<span class="package-badge">POPULAR</span>' : '';
    const destinations = pkg.destinations.map(dest => `<span class="destination-tag">${dest}</span>`).join('');
    
    return `
        <div class="package-card">
            <img src="${pkg.image}" alt="${pkg.name}" class="package-image" onerror="this.src='assets/images/travelp1.jpg'">
            <div class="package-content">
                ${popularBadge}
                <h3 class="package-title">${pkg.name}</h3>
                <p class="package-description">${pkg.description}</p>
                
                <div class="package-destinations">
                    ${destinations}
                </div>
                
                <div class="package-details">
                    <div class="package-detail-item">
                        <span class="detail-icon">⏱️</span>
                        <span>${pkg.duration}</span>
                    </div>
                    <div class="package-detail-item">
                        <span class="detail-icon">👥</span>
                        <span>${pkg.groupSize}</span>
                    </div>
                    <div class="package-detail-item">
                        <span class="detail-icon">📊</span>
                        <span>${pkg.difficulty}</span>
                    </div>
                    <div class="package-detail-item">
                        <span class="detail-icon">🏨</span>
                        <span>${pkg.facilities[0]}</span>
                    </div>
                </div>
                
                <div class="package-price">
                    <div>
                        <div class="price-label">Starting from</div>
                        <div class="price-amount">$${pkg.price.toLocaleString()}</div>
                    </div>
                </div>
                
                <div class="package-actions">
                    <button class="btn-view-details" data-package-id="${pkg.id}">
                        View Package Details
                    </button>
                </div>
            </div>
        </div>
    `;
}

/**
 * Open package details modal
 */
function openPackageModal(pkg) {
    const modal = document.getElementById('packageModal');
    const modalBody = document.getElementById('modalBody');
    
    // Create modal content
    const facilitiesList = pkg.facilities.map(f => `<div class="facility-item">${f}</div>`).join('');
    const includesList = pkg.includes.map(i => `<li>${i}</li>`).join('');
    const itineraryHtml = pkg.itinerary.map(day => `
        <div class="itinerary-day">
            <h4>Day ${day.day}: ${day.title}</h4>
            <ul class="itinerary-activities">
                ${day.activities.map(a => `<li>${a}</li>`).join('')}
            </ul>
        </div>
    `).join('');
    
    modalBody.innerHTML = `
        <div class="modal-header">
            <img src="${pkg.image}" alt="${pkg.name}" onerror="this.src='assets/images/travelp1.jpg'">
            <div class="modal-title-overlay">
                <h2>${pkg.name}</h2>
                <p>${pkg.description}</p>
            </div>
        </div>
        
        <div class="modal-body">
            <div class="modal-section">
                <h3>📍 Destinations</h3>
                <p>${pkg.destinations.join(' → ')}</p>
            </div>
            
            <div class="modal-section">
                <h3>🏨 Facilities</h3>
                <div class="facilities-grid">
                    ${facilitiesList}
                </div>
            </div>
            
            <div class="modal-section">
                <h3>✅ Package Includes</h3>
                <ul class="includes-list">
                    ${includesList}
                </ul>
            </div>
            
            <div class="modal-section">
                <h3>📅 Sample Itinerary</h3>
                ${itineraryHtml}
            </div>
            
            <div class="modal-section">
                <div class="payment-section">
                    <h3 style="color: white;">💳 Book This Package</h3>
                    <div class="payment-price" id="paymentPriceDisplay"></div>
                    <div class="currency-select">
                        <label for="paymentCurrency">Pay in your currency</label>
                        <select id="paymentCurrency">
                            ${SUPPORTED_CURRENCIES.map(code => `<option value="${code}">${code}</option>`).join('')}
                        </select>
                    </div>
                    <p class="currency-note" id="paymentCurrencyNote"></p>
                    <p>per person (${pkg.duration})</p>
                    <button class="btn-book-now" onclick="initiatePayment(event, ${pkg.id}, ${pkg.price})">
                        Book Now - Secure Payment
                    </button>
                    <p class="secure-payment">🔒 Secure payment powered by Stripe</p>
                </div>
            </div>
        </div>
    `;
    
    // Sync displayed price with selected currency
    const currencySelect = document.getElementById('paymentCurrency');
    const priceDisplay = document.getElementById('paymentPriceDisplay');
    const currencyNote = document.getElementById('paymentCurrencyNote');
    const basePriceUSD = pkg.price;
    const preferredCurrency = localStorage.getItem('preferredCurrency');

    function updatePaymentPrice() {
        const currency = (currencySelect?.value || 'USD').toUpperCase();
        const converted = convertFromUSD(basePriceUSD, currency);
        if (priceDisplay) {
            priceDisplay.textContent = formatCurrencyAmount(converted, currency);
        }
        if (currencyNote) {
            currencyNote.textContent = currency === 'USD'
                ? 'Charged in USD at checkout.'
                : `Approx. conversion from USD (${formatCurrencyAmount(basePriceUSD, 'USD')}). Stripe shows the exact charge before you pay.`;
        }
        localStorage.setItem('preferredCurrency', currency);
    }

    if (currencySelect) {
        if (preferredCurrency && SUPPORTED_CURRENCIES.includes(preferredCurrency)) {
            currencySelect.value = preferredCurrency;
        }
        updatePaymentPrice();
        currencySelect.addEventListener('change', updatePaymentPrice);
    } else if (priceDisplay) {
        priceDisplay.textContent = formatCurrencyAmount(basePriceUSD, 'USD');
    }
    
    // Show modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

/**
 * Close modal functionality
 */
document.addEventListener('click', (e) => {
    const modal = document.getElementById('packageModal');
    const modalClose = document.getElementById('modalClose');
    
    if (e.target === modal || e.target === modalClose) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
});

/**
 * Initiate payment process with Stripe
 */
async function initiatePayment(event, packageId, amountUSD) {
    try {
        // Show loading state
        const button = event?.target;
        if (button) {
            button.disabled = true;
            button.textContent = 'Processing...';
        }
        
        // Get package details from the current modal
        const packageName = document.querySelector('.modal-title-overlay h2').textContent;
        const currencySelect = document.getElementById('paymentCurrency');
        const currency = (currencySelect?.value || 'USD').toUpperCase();
        const convertedAmount = convertFromUSD(amountUSD, currency);
        
        // Create checkout session
        const response = await fetch(`${API_BASE}/payment/create-checkout-session`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                packageId: packageId,
                packageName: packageName,
                amount: Number(convertedAmount.toFixed(2)),
                quantity: 1,
                currency: currency
            }),
        });
        
        const data = await response.json();
        
        if (response.ok && data.url) {
            // Redirect to Stripe checkout
            window.location.href = data.url;
        } else {
            throw new Error(data.error || 'Failed to create checkout session');
        }
        
    } catch (error) {
        console.error('Payment error:', error);
        alert(`Payment Error: ${error.message}\n\nPlease ensure:\n1. Backend server is running\n2. STRIPE_SECRET_KEY is configured in backend/.env\n3. Contact support if issue persists`);
        
        // Reset button
        const button = event?.target;
        if (button) {
            button.disabled = false;
            button.textContent = 'Book Now - Secure Payment';
        }
    }
}

/**
 * Check payment status on page load (for redirects from Stripe)
 */
function checkPaymentStatus() {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    const sessionId = urlParams.get('session_id');
    
    if (paymentStatus === 'success' && sessionId) {
        // Show success message
        alert('✅ Payment Successful!\n\nThank you for booking with Zee Trivago.\nA confirmation email will be sent shortly.');
        
        // Remove query parameters from URL
        window.history.replaceState({}, document.title, window.location.pathname);
    } else if (paymentStatus === 'cancelled') {
        // Show cancelled message
        alert('Payment was cancelled. You can try booking again.');
        
        // Remove query parameters from URL
        window.history.replaceState({}, document.title, window.location.pathname);
    }
}

// Check payment status on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkPaymentStatus);
} else {
    checkPaymentStatus();
}

// Run logging on page load
logPageInfo();
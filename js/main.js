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
    initializeThemeToggle();
    initializeBackToTop();
    initializeCurrencyConverter();
    initializeWeatherSearch();
    fetchTestimonials();
    initializeMap();
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
 * Initialize contact form handling
 * Validates form inputs before allowing submission
 */
function initializeContactForm() {
    const contactForm = document.querySelector('.contact-form');
    
    if (!contactForm) return;
    
    // Listen for form submission
    contactForm.addEventListener('submit', function(event) {
        // Prevent default form submission behavior
        event.preventDefault();
        
        // Get all form input values
        const nameInput = contactForm.querySelector('input[name="name"]');
        const emailInput = contactForm.querySelector('input[name="email"]');
        const phoneInput = contactForm.querySelector('input[name="phone"]');
        const messageInput = contactForm.querySelector('textarea[name="message"]');
        
        const name = nameInput ? nameInput.value.trim() : '';
        const email = emailInput ? emailInput.value.trim() : '';
        const message = messageInput ? messageInput.value.trim() : '';
        
        // Validate the form
        if (!validateForm(name, email, message)) {
            // If validation fails, the validateForm function shows error
            return;
        }
        
        // If validation passes, show success message
        submitContactForm({
            name,
            email,
            phone: phoneInput ? phoneInput.value.trim() : '',
            destination: contactForm.querySelector('input[name="destination"]')?.value.trim() || '',
            message
        });
    });
}

/**
 * Validate contact form inputs
 * Checks if all required fields are filled and correctly formatted
 * 
 * @param {string} name - User's full name
 * @param {string} email - User's email address
 * @param {string} message - User's message/inquiry
 * @returns {boolean} - Returns true if all validations pass, false otherwise
 */
function validateForm(name, email, message) {
    // Rule 1: Check if all fields are filled
    if (!name) {
        showErrorMessage('Please enter your name');
        return false;
    }
    
    if (!email) {
        showErrorMessage('Please enter your email address');
        return false;
    }
    
    if (!message) {
        showErrorMessage('Please enter a message');
        return false;
    }
    
    // Rule 2: Validate email format using regular expression
    // This regex checks for: something@something.something
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showErrorMessage('Please enter a valid email address (e.g., name@example.com)');
        return false;
    }
    
    // Rule 3: Check name length (at least 2 characters)
    if (name.length < 2) {
        showErrorMessage('Name must be at least 2 characters long');
        return false;
    }
    
    // Rule 4: Check message length (at least 10 characters)
    if (message.length < 10) {
        showErrorMessage('Message must be at least 10 characters long');
        return false;
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

// ========== DARK MODE TOGGLE ==========

/**
 * Initialize dark mode toggle functionality
 * Saves user preference in localStorage
 */
function initializeThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = themeToggle ? themeToggle.querySelector('.theme-icon') : null;
    
    if (!themeToggle) return;
    
    // Check for saved theme preference or default to light mode
    const currentTheme = localStorage.getItem('theme') || 'light';
    document.body.setAttribute('data-theme', currentTheme);
    updateThemeIcon(currentTheme, themeIcon);
    
    // Toggle theme on button click
    themeToggle.addEventListener('click', function() {
        let theme = document.body.getAttribute('data-theme');
        let newTheme = theme === 'light' ? 'dark' : 'light';
        
        document.body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme, themeIcon);
        
        console.log('✓ Theme switched to:', newTheme);
    });
    
    /**
     * Update theme icon based on current theme
     */
    function updateThemeIcon(theme, iconElement) {
        if (iconElement) {
            iconElement.textContent = theme === 'light' ? '🌙' : '☀️';
        }
    }
    
    console.log('✓ Theme toggle initialized');
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
    
    if (!amountInput || !fromCurrency || !toCurrency || !convertedAmount) return;
    
    // Exchange rates (simplified - in production, use a real API)
    const exchangeRates = {
        USD: 1.0,
        EUR: 0.92,
        GBP: 0.79,
        JPY: 149.50,
        AUD: 1.52,
        CAD: 1.36
    };
    
    /**
     * Convert currency and display result
     */
    function convertCurrency() {
        const amount = parseFloat(amountInput.value) || 0;
        const from = fromCurrency.value;
        const to = toCurrency.value;
        
        // Convert to USD first, then to target currency
        const amountInUSD = amount / exchangeRates[from];
        const result = amountInUSD * exchangeRates[to];
        
        // Format the result
        const formatted = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: to,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(result);
        
        convertedAmount.textContent = formatted;
    }
    
    // Add event listeners
    amountInput.addEventListener('input', convertCurrency);
    fromCurrency.addEventListener('change', convertCurrency);
    toCurrency.addEventListener('change', convertCurrency);
    
    // Initial conversion
    convertCurrency();
    
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
        grid.innerHTML = '<p class="error">Unable to load testimonials. Please try again later.</p>';
        console.error('Failed to fetch testimonials', error);
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

// ========== GOOGLE MAPS ========== 

let mapsScriptLoaded = false;

function initializeMap() {
    const mapEl = document.getElementById('map');
    if (!mapEl) return;

    const apiKey = mapEl.dataset.apiKey;
    if (!apiKey || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY') {
        console.warn('Google Maps API key is missing. Please set data-api-key on #map.');
        return;
    }

    loadGoogleMaps(apiKey)
        .then(() => buildMap(mapEl))
        .catch(err => {
            console.error('Failed to load Google Maps', err);
            mapEl.innerHTML = '<p class="error">Map unavailable right now.</p>';
        });
}

function loadGoogleMaps(apiKey) {
    if (mapsScriptLoaded) return Promise.resolve();
    return new Promise((resolve, reject) => {
        if (window.google && window.google.maps) {
            mapsScriptLoaded = true;
            resolve();
            return;
        }
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=__initMapCallback`;
        script.async = true;
        script.defer = true;
        window.__initMapCallback = () => {
            mapsScriptLoaded = true;
            resolve();
        };
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

function buildMap(mapEl) {
    const lat = parseFloat(mapEl.dataset.lat) || 0;
    const lng = parseFloat(mapEl.dataset.lng) || 0;
    const zoom = parseInt(mapEl.dataset.zoom, 10) || 12;
    const center = { lat, lng };

    const map = new google.maps.Map(mapEl, {
        center,
        zoom,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false
    });

    new google.maps.Marker({
        position: center,
        map,
        title: 'zee trivago Travel Agency'
    });
}

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
    
    if (!searchBtn) return;
    
    // Handle search button click
    searchBtn.addEventListener('click', performWeatherSearch);
    
    // Handle Enter key in input field
    locationInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performWeatherSearch();
        }
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
            // Fetch current weather
            const weatherResponse = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&units=metric&appid=7288e1f589d12cdc243205b3a6d4727f`
            );
            
            if (!weatherResponse.ok) {
                const errorData = await weatherResponse.json();
                throw new Error(errorData.message || 'Location not found');
            }
            
            const weatherData = await weatherResponse.json();
            
            // Fetch 5-day forecast
            const forecastResponse = await fetch(
                `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(location)}&units=metric&appid=7288e1f589d12cdc243205b3a6d4727f`
            );
            
            if (!forecastResponse.ok) {
                const errorData = await forecastResponse.json();
                throw new Error(errorData.message || 'Forecast not available');
            }
            
            const forecastData = await forecastResponse.json();
            
            // Display results
            displayWeatherResults(weatherData, forecastData);
            
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

// Run logging on page load
logPageInfo();
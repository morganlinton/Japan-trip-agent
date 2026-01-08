// API base URL
const API_BASE = '/api';

// DOM elements
const form = document.getElementById('daily-log-form');
const onsenCheckbox = document.getElementById('onsen-visit');
const onsenDetails = document.getElementById('onsen-details');
const suggestionsContainer = document.getElementById('suggestions-list');
const entriesContainer = document.getElementById('entries-list');
const progressContainer = document.getElementById('trip-progress');

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    loadTripProgress();
    loadEntries();
    loadSuggestions();

    // Setup form handlers
    setupFormHandlers();
});

function setupFormHandlers() {
    // Handle onsen checkbox
    onsenCheckbox.addEventListener('change', function() {
        onsenDetails.style.display = this.checked ? 'block' : 'none';
        if (!this.checked) {
            document.getElementById('onsen-details-text').value = '';
        }
    });

    // Handle form submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        await submitEntry();
    });
}

async function submitEntry() {
    const formData = new FormData(form);

    // Parse form data
    const entry = {
        location: formData.get('location'),
        activities: formData.get('activities'),
        liked: formData.get('liked') ? formData.get('liked').split(',').map(s => s.trim()).filter(s => s) : [],
        disliked: formData.get('disliked') ? formData.get('disliked').split(',').map(s => s.trim()).filter(s => s) : [],
        onsenVisit: formData.has('onsenVisit'),
        onsenDetails: formData.get('onsenDetails') || '',
        walkingNotes: formData.get('walkingNotes'),
        overallRating: formData.get('overallRating')
    };

    try {
        showMessage('Saving entry...', 'loading');

        const response = await fetch(`${API_BASE}/entries`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(entry)
        });

        const result = await response.json();

        if (result.success) {
            showMessage('✅ Entry saved successfully! Claude.md has been updated with your preferences.', 'success');
            form.reset();
            onsenDetails.style.display = 'none';

            // Reload data
            loadEntries();
            loadTripProgress();
            displaySuggestions(result.suggestions);
        } else {
            showMessage('❌ Error saving entry. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Error submitting entry:', error);
        showMessage('❌ Network error. Please check your connection.', 'error');
    }
}

async function loadTripProgress() {
    try {
        const response = await fetch(`${API_BASE}/progress`);
        const progress = await response.json();

        progressContainer.innerHTML = `
            <div>📅 Day ${progress.daysElapsed} of ${progress.totalDays} | ${progress.daysRemaining} days remaining</div>
            <div>📝 ${progress.entriesLogged} entries logged</div>
        `;
    } catch (error) {
        console.error('Error loading progress:', error);
    }
}

async function loadEntries() {
    try {
        const response = await fetch(`${API_BASE}/entries`);
        const entries = await response.json();

        displayEntries(entries);
    } catch (error) {
        console.error('Error loading entries:', error);
        entriesContainer.innerHTML = '<p class="loading">Error loading entries</p>';
    }
}

async function loadSuggestions() {
    try {
        const response = await fetch(`${API_BASE}/suggestions`);
        const suggestions = await response.json();

        displaySuggestions(suggestions);
    } catch (error) {
        console.error('Error loading suggestions:', error);
    }
}

function displayEntries(entries) {
    if (entries.length === 0) {
        entriesContainer.innerHTML = '<p class="loading">No entries yet. Start logging your trip!</p>';
        return;
    }

    const entriesHTML = entries.map(entry => {
        const date = new Date(entry.date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const ratingEmoji = {
            '5': '😍',
            '4': '😊',
            '3': '😐',
            '2': '😕',
            '1': '😞'
        };

        return `
            <div class="entry-card">
                <div class="entry-date">${date}</div>
                <div class="entry-location">📍 ${entry.location}</div>
                <div class="entry-activities">${entry.activities}</div>

                <div class="entry-tags">
                    ${entry.liked.map(item => `<span class="tag">${item}</span>`).join('')}
                    ${entry.disliked.map(item => `<span class="tag dislike">${item}</span>`).join('')}
                    ${entry.onsenVisit ? `<span class="tag onsen">♨️ Onsen: ${entry.onsenDetails}</span>` : ''}
                </div>

                ${entry.walkingNotes ? `<div><strong>🚶 Walking Notes:</strong> ${entry.walkingNotes}</div>` : ''}

                ${entry.overallRating ? `<div class="rating">Rating: ${ratingEmoji[entry.overallRating] || ''} ${entry.overallRating}/5</div>` : ''}
            </div>
        `;
    }).join('');

    entriesContainer.innerHTML = entriesHTML;
}

function displaySuggestions(suggestions) {
    if (!suggestions || suggestions.length === 0) {
        suggestionsContainer.innerHTML = '<p class="loading">Complete today\'s log to get personalized suggestions!</p>';
        return;
    }

    const suggestionsHTML = suggestions.map(suggestion =>
        `<div class="suggestion-item">${suggestion}</div>`
    ).join('');

    suggestionsContainer.innerHTML = suggestionsHTML;
}

function showMessage(message, type) {
    // Remove any existing messages
    const existingMessage = document.querySelector('.success-message, .error-message, .loading-message');
    if (existingMessage) {
        existingMessage.remove();
    }

    // Create new message
    const messageDiv = document.createElement('div');
    messageDiv.className = type === 'success' ? 'success-message' : type === 'error' ? 'error-message' : 'loading';
    messageDiv.textContent = message;

    // Insert at top of main content
    const main = document.querySelector('main');
    main.insertBefore(messageDiv, main.firstChild);

    // Auto-remove after 5 seconds (except loading messages)
    if (type !== 'loading') {
        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }
}
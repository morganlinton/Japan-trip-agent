const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Store for trip entries
let tripEntries = [];

// Load existing trip data
async function loadTripData() {
    try {
        const data = await fs.readFile('trip-data.json', 'utf8');
        tripEntries = JSON.parse(data);
    } catch (error) {
        tripEntries = [];
    }
}

// Save trip data
async function saveTripData() {
    await fs.writeFile('trip-data.json', JSON.stringify(tripEntries, null, 2));
}

// Update claude.md with learned preferences
async function updateClaudeFile(entry) {
    try {
        const claudeContent = await fs.readFile('claude.md', 'utf8');

        let updatedContent = claudeContent;

        // Add a learned preferences section if it doesn't exist
        if (!claudeContent.includes('## Learned Preferences')) {
            updatedContent += '\n\n## Learned Preferences\n';
        }

        // Add new insights based on the day's entry
        const dateStr = new Date(entry.date).toLocaleDateString();
        let insights = `\n### ${dateStr}\n`;

        if (entry.liked.length > 0) {
            insights += `- **Enjoyed**: ${entry.liked.join(', ')}\n`;
        }
        if (entry.disliked.length > 0) {
            insights += `- **Avoided**: ${entry.disliked.join(', ')}\n`;
        }
        if (entry.onsenVisit) {
            insights += `- **Onsen**: ${entry.onsenDetails}\n`;
        }
        if (entry.walkingNotes) {
            insights += `- **Mobility Notes**: ${entry.walkingNotes}\n`;
        }

        updatedContent += insights;

        await fs.writeFile('claude.md', updatedContent);
    } catch (error) {
        console.error('Error updating claude.md:', error);
    }
}

// Generate suggestions for next day
function generateSuggestions(entries, currentEntry) {
    const suggestions = [];

    // Analyze preferences from all entries
    const allLiked = entries.flatMap(e => e.liked);
    const allDisliked = entries.flatMap(e => e.disliked);

    // Onsen suggestions
    if (entries.every(e => e.onsenVisit)) {
        suggestions.push("Continue daily onsen tradition - look for hotels with on-site facilities");
    }

    // Walking considerations
    if (entries.some(e => e.walkingNotes?.includes('painful') || e.walkingNotes?.includes('difficult'))) {
        suggestions.push("Prioritize taxi transportation and venues with minimal walking");
    }

    // Activity suggestions based on likes
    if (allLiked.includes('cultural sites')) {
        suggestions.push("Look for accessible temples or cultural centers with minimal walking");
    }

    if (allLiked.includes('food')) {
        suggestions.push("Research restaurants near your accommodation to reduce travel time");
    }

    // Location-specific suggestions
    if (currentEntry.location.toLowerCase().includes('tokyo')) {
        suggestions.push("Consider department store restaurant floors (depachika) for easy dining options");
    }

    if (currentEntry.location.toLowerCase().includes('hokkaido') || currentEntry.location.toLowerCase().includes('rusutsu')) {
        suggestions.push("Check weather conditions for skiing and have indoor backup activities ready");
    }

    return suggestions;
}

// API Routes
app.get('/api/entries', (req, res) => {
    res.json(tripEntries);
});

app.post('/api/entries', async (req, res) => {
    try {
        const entry = {
            id: Date.now(),
            date: new Date().toISOString(),
            ...req.body
        };

        tripEntries.push(entry);
        await saveTripData();
        await updateClaudeFile(entry);

        // Generate suggestions for tomorrow
        const suggestions = generateSuggestions(tripEntries, entry);

        res.json({
            success: true,
            entry,
            suggestions
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to save entry' });
    }
});

app.get('/api/suggestions', (req, res) => {
    const latestEntry = tripEntries[tripEntries.length - 1];
    const suggestions = latestEntry ? generateSuggestions(tripEntries, latestEntry) : [];
    res.json(suggestions);
});

app.get('/api/progress', (req, res) => {
    const tripStart = new Date('2026-01-12');
    const tripEnd = new Date('2026-01-20');
    const today = new Date();

    const totalDays = Math.ceil((tripEnd - tripStart) / (1000 * 60 * 60 * 24));
    const daysElapsed = Math.max(0, Math.ceil((today - tripStart) / (1000 * 60 * 60 * 24)));
    const daysRemaining = Math.max(0, totalDays - daysElapsed);

    res.json({
        totalDays,
        daysElapsed,
        daysRemaining,
        entriesLogged: tripEntries.length
    });
});

// Start server
app.listen(PORT, async () => {
    await loadTripData();
    console.log(`Japan Trip Tracker running at http://localhost:${PORT}`);
});
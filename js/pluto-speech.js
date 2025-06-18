/* ==================================================
   🪐 PLUTO SPEECH SYSTEM - COMMUNICATION MODULE
   Extracted from index.html for better organization
   ================================================== */

// Global speech state
let currentPlutoSpeech = 'silent';
let plutoSpeechBubble = null;

/**
 * PlutoSpeechController - Manages Pluto's speech and communication
 */
class PlutoSpeechController {
    constructor() {
        this.currentSpeech = 'silent';
        this.speechBubble = null;
        this.speechDatabase = {};
        this.isLoaded = false;

        // Load speech database
        this.loadSpeechDatabase();
    }

    /**
     * Load speech database from JSON file
     */
    async loadSpeechDatabase() {
        try {
            const response = await fetch('data/pluto-speeches.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.speechDatabase = await response.json();
            this.isLoaded = true;
            console.log('✅ Pluto speech database loaded');
        } catch (error) {
            console.error('❌ Failed to load speech database:', error);
            // Fallback to embedded speeches
            this.initializeFallbackSpeeches();
        }
    }

    /**
     * Initialize fallback speeches if JSON loading fails
     */
    initializeFallbackSpeeches() {
        this.speechDatabase = {
            greeting: [
                "Merhaba! Ben Pluto! 🪐",
                "Selam arkadaş! ✨",
                "Hey! Buradayım! 🌟"
            ],
            encouragement: [
                "Harika gidiyorsun! 💪",
                "Sen harikasın! 🎯",
                "Muhteşem! ⭐"
            ],
            lore: [
                "Ben uzak bir gezegendenim... 🌌",
                "Ritim ve zamanlama önemlidir! ⏰",
                "Uzayda çok şey öğrendim! 💫"
            ],
            joke: [
                "Cool gezegen benim! 😎❄️",
                "Mesafe kalbimde! 💖",
                "Büyük kalbim var! 💗"
            ],
            tip: [
                "Ritmini yakala! 🎵",
                "Sabır en büyük silahın! ⏳",
                "Konsantre ol! 🧘‍♂️"
            ],
            celebration: [
                "WOHOOO! 🎉🎊",
                "MÜTHIŞ! 🌟🏆",
                "İNANILMAZ! 🪐✨"
            ]
        };
        this.isLoaded = true;
        console.log('✅ Fallback speech database loaded');
    }

    /**
     * Show speech bubble with message
     * @param {string} message - Message to display
     */
    showSpeech(message) {
        // Remove existing bubble
        this.hideSpeech();

        // Create speech bubble
        this.speechBubble = document.createElement('div');
        this.speechBubble.className = 'pluto-speech-bubble';
        this.speechBubble.textContent = message;

        document.body.appendChild(this.speechBubble);

        // Show with animation
        setTimeout(() => {
            this.speechBubble.classList.add('show');
        }, 10);

        // Auto-hide after delay
        setTimeout(() => {
            this.hideSpeech();
        }, 3000 + message.length * 50); // Longer text = longer display
    }

    /**
     * Hide speech bubble
     */
    hideSpeech() {
        if (this.speechBubble) {
            this.speechBubble.classList.remove('show');
            setTimeout(() => {
                if (this.speechBubble && this.speechBubble.parentNode) {
                    this.speechBubble.parentNode.removeChild(this.speechBubble);
                }
                this.speechBubble = null;
            }, 300);
        }
    }

    /**
     * Test specific speech type
     * @param {string} speechType - Type of speech to test
     */
    testSpeech(speechType) {
        console.log(`Testing Pluto speech: ${speechType}`);

        if (typeof updateStatus === 'function') {
            updateStatus('speech', speechType);
        }

        if (!this.isLoaded) {
            console.warn('Speech database not loaded yet');
            this.showSpeech('Henüz konuşmaya hazır değilim... 🔄');
            return;
        }

        const speeches = this.speechDatabase[speechType];
        if (!speeches || speeches.length === 0) {
            console.error(`No speeches found for type: ${speechType}`);
            this.showSpeech('Bu konuda konuşacak bir şeyim yok... 🤐');
            return;
        }

        const randomSpeech = speeches[Math.floor(Math.random() * speeches.length)];
        this.showSpeech(randomSpeech);

        this.currentSpeech = speechType;
        currentPlutoSpeech = speechType;
    }

    /**
     * Say a random speech from a category
     * @param {string} category - Speech category
     */
    sayRandom(category) {
        this.testSpeech(category);
    }

    /**
     * Say a specific message directly
     * @param {string} message - Direct message to say
     */
    sayDirect(message) {
        this.showSpeech(message);
        this.currentSpeech = 'direct';
        currentPlutoSpeech = 'direct';
    }

    /**
     * Get current speech state
     */
    getCurrentSpeech() {
        return this.currentSpeech;
    }

    /**
     * Check if speech database is loaded
     */
    isReady() {
        return this.isLoaded;
    }

    /**
     * Get available speech types
     */
    getAvailableTypes() {
        return Object.keys(this.speechDatabase);
    }

    /**
     * Add new speech to database
     * @param {string} type - Speech type
     * @param {string} speech - Speech text
     */
    addSpeech(type, speech) {
        if (!this.speechDatabase[type]) {
            this.speechDatabase[type] = [];
        }
        this.speechDatabase[type].push(speech);
    }

    /**
     * Context-aware speech based on game state
     * @param {Object} gameState - Current game state
     */
    contextualSpeech(gameState) {
        if (!this.isLoaded) return;

        let speechType = 'greeting';

        if (gameState) {
            if (gameState.score > 1000) {
                speechType = 'celebration';
            } else if (gameState.combo >= 5) {
                speechType = 'encouragement';
            } else if (gameState.lives <= 1) {
                speechType = 'encouragement';
            } else if (Math.random() < 0.3) {
                speechType = Math.random() < 0.5 ? 'tip' : 'joke';
            }
        }

        this.testSpeech(speechType);
    }
}

// Global instance
const PlutoSpeech = new PlutoSpeechController();

/* ==================================================
   LEGACY FUNCTION SUPPORT
   For backward compatibility with existing code
   ================================================== */

/**
 * Legacy function: Test Pluto speech
 * @param {string} speechType - Speech type to test
 */
function testPlutoSpeech(speechType) {
    PlutoSpeech.testSpeech(speechType);
}

/**
 * Legacy function: Show Pluto speech bubble
 * @param {string} message - Message to display
 */
function showPlutoSpeech(message) {
    PlutoSpeech.sayDirect(message);
}

/**
 * Legacy function: Hide speech bubble
 */
function hidePlutoSpeech() {
    PlutoSpeech.hideSpeech();
}

/* ==================================================
   EXPORTS
   ================================================== */

// Export for module systems (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        PlutoSpeechController,
        PlutoSpeech,
        testPlutoSpeech,
        showPlutoSpeech,
        hidePlutoSpeech
    };
}

// Also attach to window for global access
if (typeof window !== 'undefined') {
    window.PlutoSpeech = PlutoSpeech;
    window.testPlutoSpeech = testPlutoSpeech;
    window.showPlutoSpeech = showPlutoSpeech;
    window.hidePlutoSpeech = hidePlutoSpeech;
}

console.log('💬 Pluto Speech System loaded!'); 
/* ==================================================
   🪐 PLUTO MOOD SYSTEM - BEHAVIORAL CONTROLLER
   Extracted from index.html for better organization
   ================================================== */

// Global mood state
let currentPlutoMood = 'neutral';

/**
 * PlutoMoodController - Manages Pluto's moods and behaviors
 */
class PlutoMoodController {
    constructor() {
        this.currentMood = 'neutral';
        this.moodTimer = 0;
        this.moodInterval = 5000; // Change mood every 5 seconds
        this.isAnimating = false;
        this.lastMoodType = -1;

        // Movement types for random mood changes
        this.movementTypes = ['orbit', 'fly-around', 'zoom-out', 'spiral-dance'];

        // Initialize mood behaviors
        this.initializeMoodBehaviors();
    }

    /**
     * Initialize mood behavior configurations
     */
    initializeMoodBehaviors() {
        this.moodBehaviors = {
            happy: {
                eyes: {
                    color: '#ffffff',
                    glow: '0 0 15px 3px rgba(255, 255, 255, 0.9)'
                },
                body: {
                    glow: '0 0 30px rgba(76, 175, 80, 0.5)'
                },
                animation: 'pluto-bounce',
                speech: [
                    "Çok mutluyum! 😊✨",
                    "Yippie! Harika gidiyor! 🎉🪐",
                    "Bu muhteşem! Keşke her zaman böyle olsa! ✨💫",
                    "Süper! Ben en sevimli gezegenim! 🌟🥰"
                ]
            },
            angry: {
                eyes: {
                    color: '#ffffff',
                    glow: '0 0 20px 5px rgba(255, 255, 255, 0.9)'
                },
                body: {
                    glow: '0 0 40px rgba(255, 100, 100, 0.6)'
                },
                animation: 'pluto-angry-shake',
                speech: [
                    "Çok kızgınım! 😠",
                    "Bu hiç adil değil! 😡",
                    "Sinir oluyorum! 🔥",
                    "Grrr! 👹"
                ]
            },
            sleepy: {
                eyes: {
                    color: '#ffffff',
                    glow: '0 0 8px 2px rgba(255, 255, 255, 0.6)'
                },
                body: {
                    glow: '0 0 20px rgba(158, 158, 158, 0.4)'
                },
                animation: 'pluto-sleepy-bob',
                speech: [
                    "Uykuluyum... Küçük bir şekerleme... 😴💤",
                    "Biraz dinleneyim... Rüyamda halkalar görüyorum... 💤🪐",
                    "Zzzz... Güzel rüyalar... 🌙✨",
                    "Yorgunum... Ama hala tatlıyım... 😪🥰"
                ]
            },
            excited: {
                eyes: {
                    color: '#ffffff',
                    glow: '0 0 18px 4px rgba(255, 255, 255, 0.9)'
                },
                body: {
                    glow: '0 0 35px rgba(255, 152, 0, 0.7)'
                },
                animation: 'pluto-excited',
                speech: [
                    "Çok heyecanlıyım! Zıplayacağım! 🤩💫",
                    "Bu inanılmaz! Evrenin en güzel şeyi! 🚀✨",
                    "Wohooo! Dans etmek istiyorum! 🎊🪐",
                    "Fantastik! Ben en şanslı küçük gezegenim! ⭐🥰"
                ]
            },
            confused: {
                eyes: {
                    color: '#795548',
                    glow: '0 0 12px 2px rgba(121, 85, 72, 0.7)'
                },
                body: {
                    glow: '0 0 25px rgba(121, 85, 72, 0.5)'
                },
                animation: 'pluto-wobble',
                speech: [
                    "Kafam karıştı... 🤔",
                    "Bu ne anlama geliyor? 🤨",
                    "Anlamadım... 😕",
                    "Hmm... 🧐"
                ]
            },
            wise: {
                eyes: {
                    color: '#3F51B5',
                    glow: '0 0 20px 4px rgba(63, 81, 181, 0.8)'
                },
                body: {
                    glow: '0 0 40px rgba(63, 81, 181, 0.6)'
                },
                animation: 'pluto-meditation',
                speech: [
                    "Bilgelik gerekiyor... 🧙",
                    "Düşünmek lazım... 💭",
                    "Sakin ol, genç halka... 🧘",
                    "Evren dengeyi arıyor... ⚖️"
                ]
            },
            neutral: {
                eyes: {
                    color: '#ffffff',
                    glow: '0 0 10px 2px rgba(255, 255, 255, 0.6)'
                },
                body: {
                    glow: '0 0 20px rgba(83, 72, 122, 0.4)'
                },
                animation: 'pluto-idle-pulse',
                speech: [
                    "Merhaba sevgili arkadaşım! 👋✨",
                    "Nasıl gidiyor? Ben çok iyiyim! 🪐🥰",
                    "Ben buradayım! En sevimli küçük gezegen! 🌌💫",
                    "Halka avına hazır! Birlikte eğlenelim! 🎯🪐"
                ]
            }
        };
    }

    /**
     * Get Pluto elements
     */
    getPlutoElements() {
        const plutoContainer = document.getElementById('game-pluto-container');
        const plutoBody = plutoContainer?.querySelector('.scene_titan');
        const eyes = plutoContainer?.querySelectorAll('.eye');

        return { plutoContainer, plutoBody, eyes };
    }

    /**
     * Update Pluto's mood based on delta time
     * @param {number} delta - Time delta
     */
    updateMood(delta) {
        const { plutoBody } = this.getPlutoElements();
        if (!plutoBody) return;

        // Don't change mood if Pluto is in the middle of a special animation
        if (this.isAnimating) {
            return;
        }

        // Update mood timer
        this.moodTimer += delta;

        // Determine Pluto's mood based on game state (if game exists)
        let newMood = 'neutral';

        // Priority system: special animations have lower priority than game states
        if (typeof window.game !== 'undefined' && window.game) {
            const game = window.game;
            if (game.feverMode) {
                newMood = 'excited';
            } else if (game.lives <= 1) {
                newMood = 'angry';
            } else if (game.combo >= 3) {
                newMood = 'excited';
            } else if (this.moodTimer >= this.moodInterval) {
                // Only trigger special moods if in neutral game state
                let randomIndex;
                do {
                    randomIndex = Math.floor(Math.random() * this.movementTypes.length);
                } while (randomIndex === this.lastMoodType); // Don't repeat the same movement

                newMood = this.movementTypes[randomIndex];
                this.lastMoodType = randomIndex;
                this.moodTimer = 0; // Reset timer
            }
        } else if (this.moodTimer >= this.moodInterval) {
            // Standalone mood changes when no game is running
            const moods = ['happy', 'sleepy', 'excited', 'confused', 'wise', 'neutral'];
            let randomIndex;
            do {
                randomIndex = Math.floor(Math.random() * moods.length);
            } while (randomIndex === this.lastMoodType);

            newMood = moods[randomIndex];
            this.lastMoodType = randomIndex;
            this.moodTimer = 0;
        }

        // Apply mood change if different
        if (this.currentMood !== newMood) {
            this.changeMood(newMood);
        }
    }

    /**
     * Change Pluto's mood
     * @param {string} mood - New mood to apply
     */
    changeMood(mood) {
        const { plutoBody } = this.getPlutoElements();
        if (!plutoBody) return;

        console.log('Pluto mood changing to:', mood);
        this.currentMood = mood;

        // Remove all mood animations
        plutoBody.style.animation = '';

        // Apply new mood animation based on mood type
        const isSpecialMovement = this.movementTypes.includes(mood);

        if (isSpecialMovement) {
            // Handle special movement animations
            this.applySpecialMovement(mood);
        } else {
            // Handle regular mood animations
            this.applyRegularMood(mood);
        }
    }

    /**
     * Apply special movement animation
     * @param {string} mood - Movement type
     */
    applySpecialMovement(mood) {
        const { plutoBody } = this.getPlutoElements();
        if (!plutoBody) return;

        switch (mood) {
            case 'orbit':
                plutoBody.style.animation = 'pluto-orbit-mode 8s ease-in-out';
                this.isAnimating = true;
                setTimeout(() => {
                    if (this.currentMood === 'orbit') {
                        this.isAnimating = false;
                        this.changeMood('neutral');
                    }
                }, 8000);
                break;
            case 'fly-around':
                plutoBody.style.animation = 'pluto-fly-around 10s ease-in-out';
                this.isAnimating = true;
                setTimeout(() => {
                    if (this.currentMood === 'fly-around') {
                        this.isAnimating = false;
                        this.changeMood('neutral');
                    }
                }, 10000);
                break;
            case 'zoom-out':
                plutoBody.style.animation = 'pluto-zoom-out 6s ease-in-out';
                this.isAnimating = true;
                setTimeout(() => {
                    if (this.currentMood === 'zoom-out') {
                        this.isAnimating = false;
                        this.changeMood('neutral');
                    }
                }, 6000);
                break;
            case 'spiral-dance':
                plutoBody.style.animation = 'pluto-spiral-dance 8s ease-in-out';
                this.isAnimating = true;
                setTimeout(() => {
                    if (this.currentMood === 'spiral-dance') {
                        this.isAnimating = false;
                        this.changeMood('neutral');
                    }
                }, 8000);
                break;
            default:
                this.applyRegularMood('neutral');
                break;
        }
    }

    /**
     * Apply regular mood animation
     * @param {string} mood - Mood type
     */
    applyRegularMood(mood) {
        const { plutoBody } = this.getPlutoElements();
        if (!plutoBody) return;

        const moodConfig = this.moodBehaviors[mood] || this.moodBehaviors.neutral;

        switch (mood) {
            case 'excited':
                plutoBody.style.animation = 'pluto-excited 0.8s infinite ease-in-out';
                this.isAnimating = false; // Excited can be interrupted
                break;
            case 'angry':
                plutoBody.style.animation = 'pluto-angry-shake 1s infinite ease-in-out';
                this.isAnimating = false; // Angry can be interrupted
                break;
            case 'happy':
                plutoBody.style.animation = 'pluto-bounce 1.2s infinite ease-in-out';
                this.isAnimating = false;
                break;
            case 'sleepy':
                plutoBody.style.animation = 'pluto-sleepy-bob 3s infinite ease-in-out';
                this.isAnimating = false;
                break;
            case 'confused':
                plutoBody.style.animation = 'pluto-wobble 2s infinite ease-in-out';
                this.isAnimating = false;
                break;
            case 'wise':
                plutoBody.style.animation = 'pluto-meditation 5s infinite ease-in-out';
                this.isAnimating = false;
                break;
            default: // neutral
                plutoBody.style.animation = 'pluto-idle-pulse 4s infinite ease-in-out';
                this.isAnimating = false;
                break;
        }

        // Apply visual effects
        this.applyMoodVisuals(mood);
    }

    /**
     * Apply mood-specific visual effects
     * @param {string} mood - Mood type
     */
    applyMoodVisuals(mood) {
        const { plutoBody, eyes } = this.getPlutoElements();
        const moodConfig = this.moodBehaviors[mood] || this.moodBehaviors.neutral;

        // Apply eye effects
        if (eyes && eyes.length > 0) {
            eyes.forEach(eye => {
                eye.style.backgroundColor = moodConfig.eyes.color;
                eye.style.boxShadow = moodConfig.eyes.glow;
            });
        }

        // Apply body glow
        if (plutoBody && moodConfig.body.glow) {
            plutoBody.style.boxShadow = moodConfig.body.glow;
        }
    }

    /**
     * Test specific mood
     * @param {string} moodType - Mood to test
     */
    testMood(moodType) {
        console.log(`Testing Pluto mood: ${moodType}`);

        if (typeof updateStatus === 'function') {
            updateStatus('mood', moodType);
        }

        const moodConfig = this.moodBehaviors[moodType];
        if (!moodConfig) {
            console.error(`Unknown mood type: ${moodType}`);
            return;
        }

        // Apply mood
        this.changeMood(moodType);

        // Say mood-related speech
        if (moodConfig.speech && moodConfig.speech.length > 0) {
            const randomSpeech = moodConfig.speech[Math.floor(Math.random() * moodConfig.speech.length)];
            if (typeof showPlutoSpeech === 'function') {
                showPlutoSpeech(randomSpeech);
            }
        }

        window.currentPlutoMood = moodType;
    }

    /**
     * Get current mood
     */
    getCurrentMood() {
        return this.currentMood;
    }

    /**
     * Check if Pluto is currently in a blocking animation
     */
    isCurrentlyAnimating() {
        return this.isAnimating;
    }

    /**
     * Reset to neutral mood
     */
    resetMood() {
        this.changeMood('neutral');
        this.moodTimer = 0;
        this.isAnimating = false;
    }

    /**
     * Set animation state (for external control)
     * @param {boolean} animating - Whether Pluto is animating
     */
    setAnimatingState(animating) {
        this.isAnimating = animating;
    }
}

// Global instance
const PlutoMoods = new PlutoMoodController();

/* ==================================================
   LEGACY FUNCTION SUPPORT
   For backward compatibility with existing code
   ================================================== */

/**
 * Legacy function: Test Pluto mood
 * @param {string} moodType - Mood type to test
 */
function testPlutoMood(moodType) {
    PlutoMoods.testMood(moodType);
}

/**
 * Legacy function: Update Pluto mood (for game integration)
 * @param {number} delta - Time delta
 */
function updatePlutoMood(delta) {
    PlutoMoods.updateMood(delta);
}

/**
 * Legacy function: Change Pluto mood (for game integration)
 * @param {string} mood - Mood to change to
 */
function changePlutoMood(mood) {
    PlutoMoods.changeMood(mood);
}

/* ==================================================
   EXPORTS
   ================================================== */

// Export for module systems (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        PlutoMoodController,
        PlutoMoods,
        testPlutoMood,
        updatePlutoMood,
        changePlutoMood
    };
}

// Also attach to window for global access
if (typeof window !== 'undefined') {
    window.PlutoMoodController = PlutoMoodController;
    window.PlutoMoods = PlutoMoods;
    window.testPlutoMood = testPlutoMood;
    window.updatePlutoMood = updatePlutoMood;
    window.changePlutoMood = changePlutoMood;

    // Make mood behaviors available globally for compatibility
    window.plutoMoodBehaviors = PlutoMoods.moodBehaviors;
}

console.log('🎭 Pluto Mood System loaded!'); 
/* ==================================================
   🪐 PLUTO ANIMATION LIBRARY - MAIN MODULE
   Complete Pluto animation system integration
   ================================================== */

/**
 * PlutoAnimationLibrary - Main controller that orchestrates all Pluto systems
 */
class PlutoAnimationLibrary {
    constructor() {
        this.version = '3.0.0';
        this.isInitialized = false;
        this.components = {
            animations: null,
            moods: null,
            speech: null,
            testPanel: null
        };

        console.log('🪐 Pluto Animation Library v' + this.version + ' initializing...');
        this.init();
    }

    /**
     * Initialize the animation library
     */
    async init() {
        try {
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                await new Promise(resolve => {
                    document.addEventListener('DOMContentLoaded', resolve);
                });
            }

            // Initialize components
            await this.initializeComponents();

            // Setup integrations
            this.setupIntegrations();

            // Finalize
            this.isInitialized = true;
            console.log('✅ Pluto Animation Library fully loaded!');

            // Welcome message
            this.welcomeMessage();

        } catch (error) {
            console.error('❌ Failed to initialize Pluto Animation Library:', error);
        }
    }

    /**
     * Initialize all components
     */
    async initializeComponents() {
        // Check for components (they should auto-initialize)
        this.waitForComponent('PlutoAnimationController', 5000).then(controller => {
            this.components.animations = controller;
            console.log('✅ Animation Controller connected');
        });

        this.waitForComponent('PlutoMoodController', 5000).then(controller => {
            this.components.moods = controller;
            console.log('✅ Mood Controller connected');
        });

        this.waitForComponent('PlutoSpeech', 5000).then(controller => {
            this.components.speech = controller;
            console.log('✅ Speech Controller connected');
        });

        this.waitForComponent('PlutoTestPanel', 5000).then(controller => {
            this.components.testPanel = controller;
            console.log('✅ Test Panel Controller connected');
        });
    }

    /**
     * Wait for a component to be available
     * @param {string} componentName - Name of the component
     * @param {number} timeout - Timeout in milliseconds
     */
    waitForComponent(componentName, timeout = 5000) {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();

            const checkComponent = () => {
                if (window[componentName]) {
                    resolve(window[componentName]);
                } else if (Date.now() - startTime > timeout) {
                    reject(new Error(`Component ${componentName} not found within ${timeout}ms`));
                } else {
                    setTimeout(checkComponent, 100);
                }
            };

            checkComponent();
        });
    }

    /**
     * Setup integrations between components
     */
    setupIntegrations() {
        // Game event listeners
        this.setupGameIntegration();

        // Cross-component communication
        this.setupComponentCommunication();

        // Performance monitoring
        this.setupPerformanceMonitoring();
    }

    /**
     * Setup game integration
     */
    setupGameIntegration() {
        // Listen for game events
        document.addEventListener('gameStart', () => {
            this.onGameStart();
        });

        document.addEventListener('gameEnd', () => {
            this.onGameEnd();
        });

        document.addEventListener('ringBreak', (e) => {
            this.onRingBreak(e.detail);
        });

        document.addEventListener('scoreUpdate', (e) => {
            this.onScoreUpdate(e.detail);
        });

        console.log('🎮 Game integration setup complete');
    }

    /**
     * Setup component communication
     */
    setupComponentCommunication() {
        // Animation + Speech integration
        if (this.components.animations && this.components.speech) {
            // Hook animation changes to trigger speech
            const originalAnimation = window.testPlutoAnimation;
            window.testPlutoAnimation = (animationType) => {
                if (originalAnimation) originalAnimation(animationType);
                this.onAnimationChange(animationType);
            };
        }

        // Mood + Speech integration
        if (this.components.moods && this.components.speech) {
            const originalMood = window.testPlutoMood;
            window.testPlutoMood = (moodType) => {
                if (originalMood) originalMood(moodType);
                this.onMoodChange(moodType);
            };
        }

        console.log('🔗 Component communication setup complete');
    }

    /**
     * Setup performance monitoring
     */
    setupPerformanceMonitoring() {
        // Monitor animation performance
        let animationCount = 0;
        const originalRAF = window.requestAnimationFrame;

        window.requestAnimationFrame = (callback) => {
            animationCount++;
            return originalRAF.call(window, callback);
        };

        // Log performance stats every 30 seconds
        setInterval(() => {
            const fps = Math.round(animationCount / 30);
            console.log(`🎭 Pluto Animation Performance: ~${fps} FPS`);
            animationCount = 0;
        }, 30000);

        console.log('📊 Performance monitoring setup complete');
    }

    /**
     * Game event handlers
     */
    onGameStart() {
        if (this.components.speech) {
            this.components.speech.sayRandom('greeting');
        }
        console.log('🎮 Game started - Pluto activated');
    }

    onGameEnd() {
        if (this.components.speech) {
            this.components.speech.sayRandom('celebration');
        }
        console.log('🎮 Game ended - Pluto celebrates');
    }

    onRingBreak(ringData) {
        if (this.components.speech && this.components.animations) {
            // React to ring breaks
            if (ringData.combo >= 5) {
                this.components.speech.sayRandom('celebration');
                this.triggerAnimation('excited');
            } else {
                this.components.speech.sayRandom('encouragement');
            }
        }
    }

    onScoreUpdate(scoreData) {
        // React to score milestones
        if (scoreData.score % 1000 === 0 && scoreData.score > 0) {
            if (this.components.speech) {
                this.components.speech.sayRandom('celebration');
            }
        }
    }

    onAnimationChange(animationType) {
        // Contextual speech based on animation
        const animationSpeeches = {
            'excited': 'Çok heyecanlıyım! 🤩',
            'sad': 'Biraz üzgünüm... 😢',
            'orbit': 'Yörünge modunda! 🌌',
            'patrol': 'Devriye geziyorum! 👮‍♂️'
        };

        if (animationSpeeches[animationType] && this.components.speech) {
            this.components.speech.sayDirect(animationSpeeches[animationType]);
        }
    }

    onMoodChange(moodType) {
        // Trigger appropriate animations for moods
        const moodAnimations = {
            'happy': 'excited',
            'sad': 'sad',
            'angry': 'shake',
            'excited': 'bounce'
        };

        if (moodAnimations[moodType] && this.components.animations) {
            this.triggerAnimation(moodAnimations[moodType]);
        }
    }

    /**
     * Public API methods
     */

    /**
     * Trigger an animation
     * @param {string} animationType - Animation type
     */
    triggerAnimation(animationType) {
        if (typeof testPlutoAnimation === 'function') {
            testPlutoAnimation(animationType);
        }
    }

    /**
     * Set mood
     * @param {string} moodType - Mood type
     */
    setMood(moodType) {
        if (typeof testPlutoMood === 'function') {
            testPlutoMood(moodType);
        }
    }

    /**
     * Say something
     * @param {string} message - Message to say
     */
    speak(message) {
        if (this.components.speech) {
            this.components.speech.sayDirect(message);
        }
    }

    /**
     * Random speech from category
     * @param {string} category - Speech category
     */
    sayRandom(category) {
        if (this.components.speech) {
            this.components.speech.sayRandom(category);
        }
    }

    /**
     * Test feature
     * @param {string} featureType - Feature to test
     */
    testFeature(featureType) {
        if (typeof testPlutoFeature === 'function') {
            testPlutoFeature(featureType);
        }
    }

    /**
     * Get system status
     */
    getStatus() {
        return {
            version: this.version,
            initialized: this.isInitialized,
            components: {
                animations: !!this.components.animations,
                moods: !!this.components.moods,
                speech: !!this.components.speech,
                testPanel: !!this.components.testPanel
            }
        };
    }

    /**
     * Welcome message
     */
    welcomeMessage() {
        setTimeout(() => {
            this.speak('Merhaba! Pluto Animation System v' + this.version + ' hazır! 🪐✨');
        }, 1000);
    }

    /**
     * Quick demo of all features
     */
    demo() {
        console.log('🎭 Starting Pluto Animation Demo...');

        const demoSequence = [
            { action: 'speak', param: 'Demo başlıyor! 🎬', delay: 0 },
            { action: 'animation', param: 'excited', delay: 2000 },
            { action: 'mood', param: 'happy', delay: 4000 },
            { action: 'speech', param: 'tip', delay: 6000 },
            { action: 'animation', param: 'orbit', delay: 8000 },
            { action: 'mood', param: 'wise', delay: 10000 },
            { action: 'speech', param: 'lore', delay: 12000 },
            { action: 'animation', param: 'idle', delay: 14000 },
            { action: 'speak', param: 'Demo tamamlandı! 🎉', delay: 16000 }
        ];

        demoSequence.forEach(step => {
            setTimeout(() => {
                switch (step.action) {
                    case 'speak':
                        this.speak(step.param);
                        break;
                    case 'animation':
                        this.triggerAnimation(step.param);
                        break;
                    case 'mood':
                        this.setMood(step.param);
                        break;
                    case 'speech':
                        this.sayRandom(step.param);
                        break;
                }
            }, step.delay);
        });
    }
}

// Global instance
const PlutoLib = new PlutoAnimationLibrary();

/* ==================================================
   LEGACY SUPPORT & GLOBAL API
   ================================================== */

// Global API for easy access
window.Pluto = {
    // Animation controls
    animate: (type) => PlutoLib.triggerAnimation(type),
    mood: (type) => PlutoLib.setMood(type),
    speak: (message) => PlutoLib.speak(message),
    say: (category) => PlutoLib.sayRandom(category),

    // Test functions
    test: (feature) => PlutoLib.testFeature(feature),
    demo: () => PlutoLib.demo(),

    // System info
    status: () => PlutoLib.getStatus(),
    version: PlutoLib.version,

    // Direct access to library
    lib: PlutoLib
};

// Console helper
console.log(`
🪐 PLUTO ANIMATION LIBRARY v${PlutoLib.version}
===============================================
Quick commands:
• Pluto.animate('excited')  - Trigger animation
• Pluto.mood('happy')       - Set mood  
• Pluto.speak('Hello!')     - Direct speech
• Pluto.say('greeting')     - Random greeting
• Pluto.demo()              - Run full demo
• Pluto.status()            - Check system status

Test Panel: Press Ctrl+Shift+P to toggle
===============================================
`);

/* ==================================================
   EXPORTS
   ================================================== */

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        PlutoAnimationLibrary,
        PlutoLib
    };
}

console.log('🚀 Pluto Animation Library loaded and ready!'); 
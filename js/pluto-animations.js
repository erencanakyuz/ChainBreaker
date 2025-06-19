/* ==================================================
   🪐 PLUTO ANIMATION SYSTEM - CORE ANIMATIONS
   Extracted from index.html for better organization
   ================================================== */

// Global animation state
let currentPlutoAnimation = 'idle';
let patrolMode = false;
let patrolInterval = null;

/**
 * PlutoAnimationController - Core animation management system
 */
class PlutoAnimationController {
    constructor() {
        this.currentAnimation = 'idle';
        this.isAnimating = false;
        this.patrolMode = false;
        this.patrolInterval = null;

        // Initialize CSS animations if not already present
        this.initializeAnimations();
    }

    /**
     * Initialize CSS animations by loading the external stylesheet
     */
    initializeAnimations() {
        // Check if pluto-animations.css is already loaded
        const existingLink = document.querySelector('link[href*="pluto-animations.css"]');
        if (!existingLink) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'css/pluto-animations.css';
            link.onload = () => console.log('✅ Pluto animations CSS loaded');
            link.onerror = () => console.error('❌ Failed to load pluto-animations.css');
            document.head.appendChild(link);
        }
    }

    /**
     * Get Pluto body element
     */
    getPlutoBody() {
        const plutoContainer = document.getElementById('game-pluto-container');
        return plutoContainer?.querySelector('.scene_titan');
    }

    /**
     * Test and apply Pluto animation
     * @param {string} animationType - Type of animation to apply
     */
    testAnimation(animationType) {
        console.log(`Testing Pluto animation: ${animationType}`);

        // Update status if function exists (from test panel)
        if (typeof updateStatus === 'function') {
            updateStatus('animation', animationType);
        }

        // Show animation indicator if function exists
        if (typeof showAnimationIndicator === 'function') {
            showAnimationIndicator(`Animation: ${animationType}`);
        }

        const plutoBody = this.getPlutoBody();
        if (!plutoBody) {
            console.error('Pluto body not found!');
            return false;
        }

        // Remove all existing animations
        plutoBody.style.animation = 'none';

        // Force reflow
        plutoBody.offsetHeight;

        // Apply new animation
        const animationConfig = this.getAnimationConfig(animationType);
        if (animationConfig) {
            plutoBody.style.animation = animationConfig.css;
            this.currentAnimation = animationType;
            this.isAnimating = animationConfig.blocking || false;

            // Set timeout for blocking animations to return to idle
            if (animationConfig.duration && animationConfig.blocking) {
                setTimeout(() => {
                    if (this.currentAnimation === animationType) {
                        this.stopAnimation();
                        this.testAnimation('idle');
                    }
                }, animationConfig.duration);
            }

            return true;
        } else {
            console.error(`Unknown animation type: ${animationType}`);
            return false;
        }
    }

    /**
     * Get animation configuration
     * @param {string} animationType - Animation type
     * @returns {Object} Animation configuration
     */
    getAnimationConfig(animationType) {
        const animations = {
            'orbit': {
                css: 'pluto-orbit-mode 5s ease-in-out infinite',
                duration: 5000,
                blocking: true
            },
            'fly-around': {
                css: 'pluto-fly-around 6s ease-in-out infinite',
                duration: 6000,
                blocking: true
            },
            'zoom-out': {
                css: 'pluto-zoom-out 4s ease-in-out infinite',
                duration: 4000,
                blocking: true
            },
            'spiral-dance': {
                css: 'pluto-spiral-dance 5s ease-in-out infinite',
                duration: 5000,
                blocking: true
            },
            'excited': {
                css: 'pluto-excited 0.8s ease-in-out infinite',
                blocking: false
            },
            'sad': {
                css: 'pluto-sad 1.5s ease-in-out infinite',
                blocking: false
            },
            'idle': {
                css: 'pluto-idle-pulse 3s ease-in-out infinite',
                blocking: false
            },
            'angry-shake': {
                css: 'pluto-angry-shake 0.6s ease-in-out infinite',
                blocking: false
            },
            'sleepy-bob': {
                css: 'pluto-sleepy-bob 2.5s ease-in-out infinite',
                blocking: false
            },
            'bounce': {
                css: 'pluto-bounce 0.9s ease-in-out infinite',
                blocking: false
            },
            'wobble': {
                css: 'pluto-wobble 1.5s ease-in-out infinite',
                blocking: false
            },
            'meditation': {
                css: 'pluto-meditation 4s ease-in-out infinite',
                blocking: false
            },
            // Advanced animations - made faster and more responsive
            'ring-hunter': {
                css: 'pluto-ring-hunter 7s ease-in-out infinite',
                duration: 7000,
                blocking: true
            },
            'screen-explorer': {
                css: 'pluto-screen-explorer 8s ease-in-out infinite',
                duration: 8000,
                blocking: true
            },
            'cosmic-drift': {
                css: 'pluto-cosmic-drift 9s ease-in-out infinite',
                duration: 9000,
                blocking: true
            },
            'chase-rings': {
                css: 'pluto-chase-rings 8s ease-in-out infinite',
                duration: 8000,
                blocking: true
            },
            'dimensional-travel': {
                css: 'pluto-dimensional-travel 9s ease-in-out infinite',
                duration: 9000,
                blocking: true
            }
        };

        return animations[animationType];
    }

    /**
     * Stop all Pluto animations
     */
    stopAnimation() {
        console.log('Stopping all Pluto animations');

        if (typeof updateStatus === 'function') {
            updateStatus('animation', 'stopped');
        }

        if (typeof showAnimationIndicator === 'function') {
            showAnimationIndicator('Animation: Stopped');
        }

        // Stop patrol mode if active
        if (this.patrolMode) {
            this.stopPatrolMode();
            return;
        }

        const plutoBody = this.getPlutoBody();
        if (plutoBody) {
            plutoBody.style.animation = 'none';
            plutoBody.style.transition = 'transform 1s ease-in-out';
            plutoBody.style.transform = 'translate(-50%, -50%) scale(1)';

            setTimeout(() => {
                plutoBody.style.transition = '';
            }, 1000);
        }

        this.currentAnimation = 'stopped';
        this.isAnimating = false;

        if (typeof showPlutoSpeech === 'function') {
            showPlutoSpeech("Durdum! 🛑");
        }
    }

    /**
     * Start patrol mode - Pluto moves in random patterns
     */
    startPatrolMode() {
        if (this.patrolMode) return;

        console.log('Starting Pluto patrol mode');
        this.patrolMode = true;

        const patrolAnimations = ['orbit', 'fly-around', 'zoom-out', 'spiral-dance', 'ring-hunter'];
        let currentPatrolIndex = 0;

        const executePatrol = () => {
            if (!this.patrolMode) return;

            const animation = patrolAnimations[currentPatrolIndex];
            this.testAnimation(animation);

            currentPatrolIndex = (currentPatrolIndex + 1) % patrolAnimations.length;

            // Schedule next patrol movement
            const config = this.getAnimationConfig(animation);
            const delay = config.duration || 5000;

            this.patrolInterval = setTimeout(executePatrol, delay + 1000);
        };

        executePatrol();

        if (typeof showPlutoSpeech === 'function') {
            showPlutoSpeech("Devriye başlıyor! 🚀");
        }
    }

    /**
     * Stop patrol mode
     */
    stopPatrolMode() {
        console.log('Stopping Pluto patrol mode');
        this.patrolMode = false;

        if (this.patrolInterval) {
            clearTimeout(this.patrolInterval);
            this.patrolInterval = null;
        }

        this.stopAnimation();

        if (typeof showPlutoSpeech === 'function') {
            showPlutoSpeech("Devriye bitti! 🛑");
        }
    }

    /**
     * Get current animation state
     */
    getCurrentAnimation() {
        return this.currentAnimation;
    }

    /**
     * Check if Pluto is currently animating (blocking)
     */
    isCurrentlyAnimating() {
        return this.isAnimating;
    }

    /**
     * Apply animation based on game state
     * @param {string} gameState - Current game state (excited, sad, idle, etc.)
     */
    applyGameStateAnimation(gameState) {
        // Don't interrupt blocking animations
        if (this.isAnimating) return;

        this.testAnimation(gameState);
    }
}

// Global instance
const PlutoAnimations = new PlutoAnimationController();

/* ==================================================
   LEGACY FUNCTION SUPPORT
   For backward compatibility with existing code
   ================================================== */

/**
 * Legacy function: Test Pluto animation
 * @param {string} animationType - Animation type
 */
function testPlutoAnimation(animationType) {
    // Handle special case for patrol mode
    if (animationType === 'patrol') {
        PlutoAnimations.startPatrolMode();
        window.currentPlutoAnimation = 'patrol';
        return;
    }

    const success = PlutoAnimations.testAnimation(animationType);
    if (success) {
        window.currentPlutoAnimation = animationType;
    }
}

/**
 * Legacy function: Stop Pluto animation
 */
function stopPlutoAnimation() {
    PlutoAnimations.stopAnimation();
    window.currentPlutoAnimation = 'stopped';
}

/**
 * Start patrol mode (legacy function)
 */
function startPatrolMode() {
    PlutoAnimations.startPatrolMode();
}

/**
 * Stop patrol mode (legacy function)
 */
function stopPatrolMode() {
    PlutoAnimations.stopPatrolMode();
}

/* ==================================================
   EXPORTS
   ================================================== */

// Export for module systems (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        PlutoAnimationController,
        PlutoAnimations,
        testPlutoAnimation,
        stopPlutoAnimation,
        startPatrolMode,
        stopPatrolMode
    };
}

// Also attach to window for global access
if (typeof window !== 'undefined') {
    window.PlutoAnimationController = PlutoAnimationController;
    window.PlutoAnimations = PlutoAnimations;
    window.testPlutoAnimation = testPlutoAnimation;
    window.stopPlutoAnimation = stopPlutoAnimation;
    window.startPatrolMode = startPatrolMode;
    window.stopPatrolMode = stopPatrolMode;
}

console.log('🪐 Pluto Animation System loaded!'); 
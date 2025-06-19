import { playerProgression } from '../core/PlayerProgression.js';
import { templateManager } from '../core/TemplateManager.js';

export class Pluto {
    constructor(container, options = {}) {
        this.container = container;
        this.progression = playerProgression; // Use the singleton instance

        this.element = null;
        this.skin = this.progression.getActiveSkin(); // Get saved skin

        this.mood = 'neutral';
        this.currentAnimation = 'idle';
        this.isVisible = true;

        // Story mode bypasses unlock restrictions
        this.storyMode = options.storyMode || false;

        // 🎮 CLEAN ANIMATION REGISTRY - NEW BASE SYSTEM
        this.availableAnimations = {
            // 🎯 Core animations (always unlocked)
            'idle': {
                name: 'Idle',
                duration: 5000,
                unlocked: true,
                description: 'Peaceful floating state'
            },
            'excited': {
                name: 'Excited',
                duration: 2000,
                unlocked: true,
                description: 'Bouncy excitement animation'
            },

            // 🏠 Menu context animations (cute & gentle)
            'cute-wiggle': {
                name: 'Cute Wiggle',
                duration: 3000,
                unlocked: true,
                context: 'menu',
                description: 'Playful wiggling movement'
            },
            'curious': {
                name: 'Curious',
                duration: 4000,
                unlocked: true,
                context: 'menu',
                description: 'Curious side-to-side look'
            },

            // 🎮 Game context animations (dynamic & intense)
            'power-burst': {
                name: 'Power Burst',
                duration: 2000,
                unlocked: false,
                context: 'game',
                description: 'Explosive power release'
            },
            'chain-break': {
                name: 'Chain Break',
                duration: 1000,
                unlocked: false,
                context: 'game',
                description: 'Chain breaking shake effect'
            },
            'victory-dance': {
                name: 'Victory Dance',
                duration: 2500,
                unlocked: false,
                context: 'game',
                description: 'Celebration victory dance'
            },

            // 🌟 Legacy universal animations (context-free, unlockable)
            'orbit': {
                name: 'Orbit',
                duration: 8000,
                unlocked: false,
                description: 'Planetary orbital movement'
            },
            'fly-around': {
                name: 'Fly Around',
                duration: 12000,
                unlocked: false,
                description: 'Flying around the screen'
            },
            'spiral-dance': {
                name: 'Spiral Dance',
                duration: 6000,
                unlocked: false,
                description: 'Elegant spiraling motion'
            },
            'zoom-out': {
                name: 'Zoom Out',
                duration: 4000,
                unlocked: false,
                description: 'Dramatic zoom effect'
            }
        };

        // Initialize (async) - the element creation is now handled separately
        this.initialized = this._initialize();

        console.log('🪐 Pluto: New Base Component initialization started with skin:', this.skin, this.storyMode ? '(Story Mode)' : '(Game Mode)');
    }

    // Async initialization method
    async _initialize() {
        try {
            // Create and initialize the new Pluto element
            await this._createPlutoElement();
            await this.applySkin(this.skin);
            this.setAnimation('idle');
            this.setMood('neutral');

            // Listen for global game events
            this._setupEventListeners();

            console.log('🪐 Pluto: New Base Component fully initialized');
            return true;
        } catch (error) {
            console.error('❌ Pluto: Initialization failed:', error);
            return false;
        }
    }

    // Create the main Pluto DOM element using new base structure
    async _createPlutoElement() {
        try {
            // Use template system instead of hardcoded HTML
            this.element = await templateManager.createElement('pluto-base-entity', {
                mood: this.mood,
                animation: this.currentAnimation,
                skin: this.skin
            });

            // Mount to container if provided
            if (this.container) {
                this.mount();
            }

            console.log('🪐 Pluto: New Base Element created using template system');
            return this.element;
        } catch (error) {
            console.error('❌ Pluto: Failed to create element using template, falling back to manual creation:', error);
            return this._createPlutoElementFallback();
        }
    }

    // Fallback method for manual element creation (new base structure)
    _createPlutoElementFallback() {
        const plutoEntity = document.createElement('div');
        plutoEntity.className = 'pluto-base-entity'; // New base class

        // Create shadow
        const shadow = document.createElement('div');
        shadow.className = 'scene_titanShadow';

        // Create t_wrap container
        const tWrap = document.createElement('div');
        tWrap.className = 't_wrap';

        // Create main titan body
        const titan = document.createElement('div');
        titan.className = 'scene_titan';

        // Create eye elements
        const eyes = document.createElement('div');
        eyes.className = 'eyes';

        const leftEye = document.createElement('div');
        leftEye.className = 'eye eye--left';

        const rightEye = document.createElement('div');
        rightEye.className = 'eye eye--right';

        eyes.appendChild(leftEye);
        eyes.appendChild(rightEye);

        // Create mouth element
        const mouth = document.createElement('div');
        mouth.className = 'mouth';

        // Assemble the new structure
        titan.appendChild(eyes);
        titan.appendChild(mouth);
        tWrap.appendChild(titan);
        plutoEntity.appendChild(shadow);
        plutoEntity.appendChild(tWrap);

        this.element = plutoEntity;

        // Mount to container if provided
        if (this.container) {
            this.mount();
        }

        console.log('🪐 Pluto: New Base Element created using fallback method');
        return plutoEntity;
    }

    // Setup event listeners for global game events
    _setupEventListeners() {
        // Listen for level completion
        window.addEventListener('levelComplete', (event) => {
            console.log('🪐 Pluto: Level completed, showing happy mood');
            this.setMood('happy');
            this.setAnimation('excited');
        });

        // Listen for player hurt/damage
        window.addEventListener('playerHurt', (event) => {
            console.log('🪐 Pluto: Player hurt, showing sad mood');
            this.setMood('sad');
        });

        // Listen for game start
        window.addEventListener('gameStart', (event) => {
            console.log('🪐 Pluto: Game started, showing excited mood');
            this.setMood('happy');
            this.setAnimation('excited');
        });

        // Listen for game over
        window.addEventListener('gameOver', (event) => {
            console.log('🪐 Pluto: Game over, showing sad mood');
            this.setMood('sad');
            this.setAnimation('idle');
        });

        // Listen for achievement unlocks
        window.addEventListener('itemUnlocked', (event) => {
            const { type, id } = event.detail;
            console.log(`🪐 Pluto: New ${type} unlocked: ${id}, celebrating!`);
            this.celebrate();
        });

        // Listen for skin changes from other components
        window.addEventListener('skinChanged', (event) => {
            const { skinName } = event.detail;
            if (skinName !== this.skin) {
                console.log(`🪐 Pluto: Skin changed to ${skinName}`);
                this.applySkin(skinName);
            }
        });

        // Listen for progression reset
        window.addEventListener('progressionReset', (event) => {
            console.log('🪐 Pluto: Progression reset, reverting to default skin');
            this.applySkin('default');
        });
    }

    // Apply a skin to Pluto (updated for new base structure)
    async applySkin(skinName) {
        if (!this.storyMode && !this.progression.isUnlocked('skin', skinName)) {
            console.warn(`🪐 Pluto: Skin "${skinName}" is not unlocked, using current skin`);
            return false;
        }

        try {
            // Load the skin CSS dynamically (skip for default skin)
            if (skinName !== 'default' && window.gameManager) {
                await window.gameManager.loadSkinCSS(skinName);
            }

            // Reset and apply new skin class to new base structure
            this.element.className = 'pluto-base-entity';
            if (skinName !== 'default') {
                this.element.classList.add(`skin--${skinName}`);
            }

            this.skin = skinName;
            console.log(`🪐 Pluto: Applied skin "${skinName}"${this.storyMode ? ' (Story Mode)' : ''}`);

            // Dispatch skin applied event
            window.dispatchEvent(new CustomEvent('plutoSkinApplied', {
                detail: { skinName }
            }));

            return true;
        } catch (error) {
            console.error(`❌ Pluto: Failed to apply skin "${skinName}":`, error);
            return false;
        }
    }

    // Set Pluto's mood
    setMood(moodName) {
        if (!this.storyMode && !this.progression.isUnlocked('mood', moodName)) {
            console.warn(`🪐 Pluto: Mood "${moodName}" is locked, keeping current mood`);
            return false;
        }

        this.element.dataset.mood = moodName; // Use data-attributes for CSS state
        this.mood = moodName;

        console.log(`🪐 Pluto: Mood changed to "${moodName}"${this.storyMode ? ' (Story Mode)' : ''}`);

        // Dispatch mood change event
        window.dispatchEvent(new CustomEvent('plutoMoodChanged', {
            detail: { mood: moodName }
        }));

        return true;
    }

    // Set Pluto's animation
    setAnimation(animationName) {
        // Check if animation exists
        const animationInfo = this.availableAnimations[animationName];
        if (!animationInfo) {
            console.warn(`🪐 Pluto: Animation "${animationName}" does not exist`);
            return false;
        }

        // Check context compatibility
        const currentContext = this.element?.dataset.context;
        if (animationInfo.context && animationInfo.context !== currentContext) {
            console.warn(`🪐 Pluto: Animation "${animationName}" is for ${animationInfo.context} context only`);
            return false;
        }

        // Check if unlocked (unless in story mode)
        if (!this.storyMode && !animationInfo.unlocked && !this.progression.isUnlocked('animation', animationName)) {
            console.warn(`🪐 Pluto: Animation "${animationName}" is locked, keeping current animation`);
            return false;
        }

        this.element.dataset.animation = animationName;
        this.currentAnimation = animationName;

        console.log(`🪐 Pluto: Animation changed to "${animationName}"${this.storyMode ? ' (Story Mode)' : ''}`);

        // Dispatch animation change event
        window.dispatchEvent(new CustomEvent('plutoAnimationChanged', {
            detail: {
                animation: animationName,
                duration: animationInfo.duration
            }
        }));

        return true;
    }

    // Get list of available animations
    getAvailableAnimations(includeContext = null) {
        const currentContext = this.element?.dataset.context;

        return Object.entries(this.availableAnimations)
            .filter(([key, info]) => {
                // Filter by context if specified
                if (includeContext && info.context && info.context !== includeContext) {
                    return false;
                }
                // Filter by current context if animation has context requirement
                if (!includeContext && info.context && info.context !== currentContext) {
                    return false;
                }
                // Check if unlocked (story mode bypasses)
                if (this.storyMode) return true;
                return info.unlocked || this.progression.isUnlocked('animation', key);
            })
            .map(([key, info]) => ({
                id: key,
                ...info,
                isActive: this.currentAnimation === key
            }));
    }

    // Play random animation from available ones
    playRandomAnimation() {
        const available = this.getAvailableAnimations();
        const otherAnimations = available.filter(anim => anim.id !== this.currentAnimation);

        if (otherAnimations.length > 0) {
            const randomAnim = otherAnimations[Math.floor(Math.random() * otherAnimations.length)];
            this.setAnimation(randomAnim.id);

            // Return to idle after animation duration
            if (randomAnim.id !== 'idle') {
                setTimeout(() => {
                    this.setAnimation('idle');
                }, randomAnim.duration);
            }
        }
    }

    // Unlock animation
    unlockAnimation(animationName) {
        if (this.availableAnimations[animationName]) {
            this.availableAnimations[animationName].unlocked = true;
            console.log(`🎉 Pluto: Animation "${animationName}" unlocked!`);
            return true;
        }
        return false;
    }

    // Special celebration animation
    celebrate() {
        console.log('🪐 Pluto: Celebrating! 🎉');
        this.setMood('happy');
        this.setAnimation('excited');

        // Return to idle after celebration
        setTimeout(() => {
            this.setAnimation('idle');
        }, 3000);
    }

    // Show Pluto
    show() {
        if (this.element) {
            this.element.style.display = 'block';
            this.isVisible = true;
            console.log('🪐 Pluto: Shown');

            // Dispatch show event
            window.dispatchEvent(new CustomEvent('plutoShown'));
        }
    }

    // Hide Pluto
    hide() {
        if (this.element) {
            this.element.style.display = 'none';
            this.isVisible = false;
            console.log('🪐 Pluto: Hidden');

            // Dispatch hide event
            window.dispatchEvent(new CustomEvent('plutoHidden'));
        }
    }

    // Mount Pluto to its container
    mount() {
        if (this.element && this.container) {
            this.container.appendChild(this.element);
            console.log('🪐 Pluto: Mounted to container');
        }
    }

    // Unmount Pluto from its container
    unmount() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
            console.log('🪐 Pluto: Unmounted from container');
        }
    }

    // Destroy the Pluto instance
    destroy() {
        this.unmount();
        this.element = null;
        this.container = null;
        console.log('🪐 Pluto: Destroyed');

        // Dispatch destroy event
        window.dispatchEvent(new CustomEvent('plutoDestroyed'));
    }

    // Get current state
    getState() {
        return {
            skin: this.skin,
            mood: this.mood,
            animation: this.currentAnimation,
            visible: this.isVisible,
            storyMode: this.storyMode,
            mounted: !!(this.element && this.element.parentNode)
        };
    }

    // Set position (for positioning in specific scenes)
    setPosition(x, y) {
        if (this.element) {
            this.element.style.left = `${x}px`;
            this.element.style.top = `${y}px`;
            this.element.style.transform = 'none'; // Remove center transform
            console.log(`🪐 Pluto: Position set to (${x}, ${y})`);
        }
    }

    // Reset to center position
    resetPosition() {
        if (this.element) {
            this.element.style.left = '50%';
            this.element.style.top = '50%';
            this.element.style.transform = 'translate(-50%, -50%)';
            console.log('🪐 Pluto: Position reset to center');
        }
    }

    // Animate to position
    animateToPosition(x, y, duration = 1000) {
        if (this.element) {
            this.element.style.transition = `left ${duration}ms ease, top ${duration}ms ease`;
            this.setPosition(x, y);

            // Remove transition after animation
            setTimeout(() => {
                if (this.element) {
                    this.element.style.transition = '';
                }
            }, duration);

            console.log(`🪐 Pluto: Animating to position (${x}, ${y}) over ${duration}ms`);
        }
    }

    // Check if capability is available
    hasCapability(type, id) {
        return this.storyMode || this.progression.isUnlocked(type, id);
    }

    // Get available options based on unlocks
    getAvailableOptions() {
        return {
            skins: this.storyMode ? ['default', 'golden', 'cyborg', 'rainbow'] : this.progression.getUnlockedItems('skin'),
            moods: this.storyMode ? ['neutral', 'happy', 'sad', 'angry'] : this.progression.getUnlockedItems('mood'),
            animations: this.storyMode ? ['idle', 'excited'] : this.progression.getUnlockedItems('animation')
        };
    }

    // Enable/disable story mode (bypasses unlock restrictions)
    setStoryMode(enabled) {
        this.storyMode = enabled;
        console.log(`🪐 Pluto: Story mode ${enabled ? 'enabled' : 'disabled'}`);
    }

    // Check if in story mode
    isStoryMode() {
        return this.storyMode;
    }
}

// Also attach to window for compatibility
if (typeof window !== 'undefined') {
    window.Pluto = Pluto;
} 
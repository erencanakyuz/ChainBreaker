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
        this.loadedSkins = new Set(); // Track loaded skin CSS files

        // Story mode bypasses unlock restrictions
        this.storyMode = options.storyMode || false;

        // 📱 RESPONSIVE SYSTEM INTEGRATION
        this.responsiveSystem = {
            deviceType: this.getDeviceType(),
            constants: this.getResponsiveConstants()
        };

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
            // Preload all available skins
            const skinsToPreload = this.progression.getUnlockedItems('skin');
            await this.preloadSkinCSS(skinsToPreload);

            // Create and initialize the new Pluto element
            await this._createPlutoElement();
            await this.applySkin(this.skin);
            this.setAnimation('idle');
            this.setMood('neutral');

            // Apply responsive settings
            this.applyResponsiveSettings();

            // Listen for window resize to update responsive settings
            window.addEventListener('resize', () => {
                this.updateResponsiveSettings();
                // Reposition based on current context
                if (this.element) {
                    const context = this.element.dataset.context;
                    if (context === 'menu') {
                        this.setMenuPosition();
                    } else if (context === 'game') {
                        this.resetPosition();
                    }
                }
            });

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
            // Use template system for cleaner HTML structure
            this.element = await templateManager.createElement('pluto-base-entity', {
                mood: 'neutral',
                animation: 'idle',
                skin: 'default'
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

        plutoEntity.innerHTML = `
            <div class="scene_plutoShadow"></div>
            <div class="t_wrap">
                <div class="scene_pluto">
                    <div class="eyes">
                        <div class="eye eye--left"></div>
                        <div class="eye eye--right"></div>
                    </div>
                    <div class="mouth"></div>
                </div>
            </div>
        `;

        this.element = plutoEntity;

        // Mount to container if provided
        if (this.container) {
            this.mount();
        }

        console.log('🪐 Pluto: New Base Element created using simplified fallback method');
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
        if (!this.element) return;

        // Check if skin is unlocked (unless in story mode)
        if (!this.storyMode && !this.progression.isUnlocked('skin', skinName)) {
            console.warn(`Pluto: Skin "${skinName}" is not unlocked.`);
            return;
        }

        try {
            // Load the CSS file for the skin
            await this.loadSkinCSS(skinName);

            // Update the element's skin attribute
            this.element.dataset.skin = skinName;
            this.skin = skinName;

            // Save the new active skin to progression
            this.progression.setActiveSkin(skinName);

            console.log(`Pluto: Skin applied successfully: ${skinName}`);
        } catch (error) {
            console.error(`Pluto: Failed to apply skin "${skinName}":`, error);
        }
    }

    // Preload multiple skin CSS files for better performance
    async preloadSkinCSS(skinNames) {
        console.log('Pluto: Preloading skin CSS files...');
        const loadPromises = skinNames.map(skinName =>
            this.loadSkinCSS(skinName).catch(error =>
                console.warn(`Failed to preload skin: ${skinName}`, error)
            )
        );

        await Promise.allSettled(loadPromises);
        console.log('Pluto: Skin CSS preloading completed');
    }

    // Dynamically load CSS for a skin, preventing duplicates
    async loadSkinCSS(skinName) {
        // Don't load if it's already loaded
        if (this.loadedSkins.has(skinName)) {
            console.log(`Pluto: Skin CSS for "${skinName}" already loaded.`);
            return;
        }

        const cssId = `pluto-skin-${skinName}`;
        const cssPath = `css/skins/${skinName}.css`;

        // Defensive check if element somehow already exists from a previous session
        if (document.getElementById(cssId)) {
            this.loadedSkins.add(skinName); // Mark as loaded
            return;
        }

        // Create and append the link tag
        return new Promise((resolve, reject) => {
            const link = document.createElement('link');
            link.id = cssId;
            link.rel = 'stylesheet';
            link.href = cssPath;

            link.onload = () => {
                console.log(`Pluto: Skin CSS loaded: ${cssPath}`);
                this.loadedSkins.add(skinName); // Add to tracker
                resolve();
            };
            link.onerror = () => {
                console.error(`Pluto: Failed to load skin CSS: ${cssPath}`);
                // Don't reject the whole skin application, just warn
                resolve();
            };
            document.head.appendChild(link);
        });
    }

    // Set Pluto's mood
    setMood(moodName) {
        if (!this.element) return;

        this.mood = moodName;
        if (!this.storyMode && !this.progression.isUnlocked('mood', moodName)) {
            console.warn(`🪐 Pluto: Mood "${moodName}" is locked, keeping current mood`);
            return false;
        }

        this.element.dataset.mood = moodName; // Use data-attributes for CSS state

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

        // Return to idle after animation duration
        if (animationName !== 'idle') {
            this.element.addEventListener('animationend', () => {
                this.setAnimation('idle');
            }, { once: true });
        }

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

    // 📱 RESPONSIVE SYSTEM METHODS
    getDeviceType() {
        if (window.innerWidth <= 480) return 'small-mobile';
        if (window.innerWidth <= 768) return 'mobile';
        if (window.innerWidth <= 1024) return 'tablet';
        return 'desktop';
    }

    getResponsiveConstants() {
        const constants = {
            'small-mobile': {
                SCALE: 0.2,
                ANIMATION_SPEED: 0.4,
                EFFECT_INTENSITY: 0.3,
                MAX_SIZE: 30
            },
            'mobile': {
                SCALE: 0.25,
                ANIMATION_SPEED: 0.6,
                EFFECT_INTENSITY: 0.5,
                MAX_SIZE: 45
            },
            'tablet': {
                SCALE: 0.3,
                ANIMATION_SPEED: 0.8,
                EFFECT_INTENSITY: 0.7,
                MAX_SIZE: 60
            },
            'desktop': {
                SCALE: 0.35,
                ANIMATION_SPEED: 1.0,
                EFFECT_INTENSITY: 1.0,
                MAX_SIZE: 100
            }
        };
        return constants[this.getDeviceType()] || constants.desktop;
    }

    applyResponsiveSettings() {
        if (!this.element) return;

        const constants = this.responsiveSystem.constants;

        // Apply scaling
        this.element.style.transform = `scale(${constants.SCALE})`;
        this.element.style.maxWidth = `${constants.MAX_SIZE}px`;
        this.element.style.maxHeight = `${constants.MAX_SIZE}px`;

        // Apply CSS custom properties for animations
        this.element.style.setProperty('--pluto-animation-speed', constants.ANIMATION_SPEED);
        this.element.style.setProperty('--pluto-effect-intensity', constants.EFFECT_INTENSITY);

        // Add device class for CSS targeting
        this.element.classList.add(`pluto-device-${this.responsiveSystem.deviceType}`);

        console.log(`🪐 Pluto: Responsive settings applied for ${this.responsiveSystem.deviceType}`, constants);
    }

    updateResponsiveSettings() {
        this.responsiveSystem.deviceType = this.getDeviceType();
        this.responsiveSystem.constants = this.getResponsiveConstants();
        this.applyResponsiveSettings();
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
            this.element.style.position = 'absolute';
            this.element.style.left = '50%';
            this.element.style.top = '50%';
            this.element.style.transform = 'translate(-50%, -50%)';
            this.element.style.zIndex = '100';
            console.log('🪐 Pluto: Position reset to center');
        }
    }

    // Set position for menu mode (responsive)
    setMenuPosition() {
        if (!this.element) return;

        const deviceType = this.responsiveSystem.deviceType;
        const element = this.element;

        // Base menu positioning
        element.style.position = 'fixed';
        element.style.zIndex = '1000';
        element.style.pointerEvents = 'none';

        // Responsive positioning based on device
        switch (deviceType) {
            case 'small-mobile':
                element.style.left = '20px';
                element.style.top = '60%';
                element.style.transform = 'translateY(-50%)';
                break;
            case 'mobile':
                element.style.left = '40px';
                element.style.top = '55%';
                element.style.transform = 'translateY(-50%)';
                break;
            case 'tablet':
                element.style.left = '60px';
                element.style.top = '50%';
                element.style.transform = 'translateY(-50%)';
                break;
            default: // desktop
                element.style.left = '80px';
                element.style.top = '50%';
                element.style.transform = 'translateY(-50%)';
                break;
        }

        console.log(`🪐 Pluto: Menu position set for ${deviceType}`);
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
        console.log(`🪐 Pluto: Story mode set to ${enabled}`);
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
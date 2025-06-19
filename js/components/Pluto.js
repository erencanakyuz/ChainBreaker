import { playerProgression } from '../core/PlayerProgression.js';

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

        // Create and initialize the Pluto element
        this._createPlutoElement();
        this.applySkin(this.skin);
        this.setAnimation('idle');
        this.setMood('neutral');

        // Listen for global game events
        this._setupEventListeners();

        console.log('Pluto: Component initialized with skin:', this.skin, this.storyMode ? '(Story Mode)' : '(Game Mode)');
    }

    // Create the main Pluto DOM element
    _createPlutoElement() {
        const plutoEntity = document.createElement('div');
        plutoEntity.className = 'pluto-entity'; // Base class from pluto.css

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

        // Assemble the structure
        plutoEntity.appendChild(eyes);
        plutoEntity.appendChild(mouth);

        this.element = plutoEntity;

        // Mount to container if provided
        if (this.container) {
            this.mount();
        }

        return plutoEntity;
    }

    // Setup event listeners for global game events
    _setupEventListeners() {
        // Listen for level completion
        window.addEventListener('levelComplete', (event) => {
            console.log('Pluto: Level completed, showing happy mood');
            this.setMood('happy');
            this.setAnimation('excited');
        });

        // Listen for player hurt/damage
        window.addEventListener('playerHurt', (event) => {
            console.log('Pluto: Player hurt, showing sad mood');
            this.setMood('sad');
        });

        // Listen for game start
        window.addEventListener('gameStart', (event) => {
            console.log('Pluto: Game started, showing excited mood');
            this.setMood('happy');
            this.setAnimation('excited');
        });

        // Listen for game over
        window.addEventListener('gameOver', (event) => {
            console.log('Pluto: Game over, showing sad mood');
            this.setMood('sad');
            this.setAnimation('idle');
        });

        // Listen for achievement unlocks
        window.addEventListener('itemUnlocked', (event) => {
            const { type, id } = event.detail;
            console.log(`Pluto: New ${type} unlocked: ${id}, celebrating!`);
            this.celebrate();
        });

        // Listen for skin changes from other components
        window.addEventListener('skinChanged', (event) => {
            const { skinName } = event.detail;
            if (skinName !== this.skin) {
                console.log(`Pluto: Skin changed to ${skinName}`);
                this.applySkin(skinName);
            }
        });

        // Listen for progression reset
        window.addEventListener('progressionReset', (event) => {
            console.log('Pluto: Progression reset, reverting to default skin');
            this.applySkin('default');
        });
    }

    // Apply a skin to Pluto
    applySkin(skinName) {
        if (!this.storyMode && !this.progression.isUnlocked('skin', skinName)) {
            console.warn(`Pluto: Skin "${skinName}" is not unlocked, using current skin`);
            return false;
        }

        // Reset and apply new skin class
        this.element.className = 'pluto-entity';
        if (skinName !== 'default') {
            this.element.classList.add(`skin--${skinName}`);
        }

        this.skin = skinName;
        console.log(`Pluto: Applied skin "${skinName}"${this.storyMode ? ' (Story Mode)' : ''}`);

        // Dispatch skin applied event
        window.dispatchEvent(new CustomEvent('plutoSkinApplied', {
            detail: { skinName }
        }));

        return true;
    }

    // Set Pluto's mood
    setMood(moodName) {
        if (!this.storyMode && !this.progression.isUnlocked('mood', moodName)) {
            console.warn(`Pluto: Mood "${moodName}" is locked, keeping current mood`);
            return false;
        }

        this.element.dataset.mood = moodName; // Use data-attributes for CSS state
        this.mood = moodName;

        console.log(`Pluto: Mood changed to "${moodName}"${this.storyMode ? ' (Story Mode)' : ''}`);

        // Dispatch mood change event
        window.dispatchEvent(new CustomEvent('plutoMoodChanged', {
            detail: { mood: moodName }
        }));

        return true;
    }

    // Set Pluto's animation
    setAnimation(animationName) {
        if (!this.storyMode && !this.progression.isUnlocked('animation', animationName)) {
            console.warn(`Pluto: Animation "${animationName}" is locked, keeping current animation`);
            return false;
        }

        this.element.dataset.animation = animationName;
        this.currentAnimation = animationName;

        console.log(`Pluto: Animation changed to "${animationName}"${this.storyMode ? ' (Story Mode)' : ''}`);

        // Dispatch animation change event
        window.dispatchEvent(new CustomEvent('plutoAnimationChanged', {
            detail: { animation: animationName }
        }));

        return true;
    }

    // Special celebration animation for achievements
    celebrate() {
        const originalAnimation = this.currentAnimation;
        const originalMood = this.mood;

        // Show excited state
        this.setMood('happy');
        this.setAnimation('excited');

        // Return to previous state after celebration
        setTimeout(() => {
            this.setMood(originalMood);
            this.setAnimation(originalAnimation);
        }, 3000);
    }

    // Show Pluto
    show() {
        if (this.element) {
            this.element.style.display = 'block';
            this.element.style.opacity = '1';
            this.isVisible = true;

            console.log('Pluto: Shown');

            window.dispatchEvent(new CustomEvent('plutoVisibilityChanged', {
                detail: { visible: true }
            }));
        }
    }

    // Hide Pluto
    hide() {
        if (this.element) {
            this.element.style.opacity = '0';
            setTimeout(() => {
                if (this.element) {
                    this.element.style.display = 'none';
                }
            }, 300); // Wait for opacity transition
            this.isVisible = false;

            console.log('Pluto: Hidden');

            window.dispatchEvent(new CustomEvent('plutoVisibilityChanged', {
                detail: { visible: false }
            }));
        }
    }

    // Mount Pluto to the container
    mount() {
        if (this.container && this.element && !this.container.contains(this.element)) {
            this.container.appendChild(this.element);
            console.log('Pluto: Mounted to container');
        }
    }

    // Unmount Pluto from the container
    unmount() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
            console.log('Pluto: Unmounted from container');
        }
    }

    // Destroy the Pluto component
    destroy() {
        // Remove event listeners
        // Note: Since we're using window.addEventListener, we'd need to store references to remove them
        // For now, we'll just remove the element

        this.unmount();
        this.element = null;
        this.container = null;

        console.log('Pluto: Component destroyed');

        window.dispatchEvent(new CustomEvent('plutoDestroyed'));
    }

    // Get current state
    getState() {
        return {
            skin: this.skin,
            mood: this.mood,
            animation: this.currentAnimation,
            visible: this.isVisible,
            unlocked: {
                skins: this.progression.getUnlockedItems('skin'),
                moods: this.progression.getUnlockedItems('mood'),
                animations: this.progression.getUnlockedItems('animation')
            }
        };
    }

    // Update Pluto's position (for advanced positioning)
    setPosition(x, y) {
        if (this.element) {
            this.element.style.left = `${x}px`;
            this.element.style.top = `${y}px`;
            this.element.style.transform = 'none'; // Override the default centering
        }
    }

    // Reset position to center
    resetPosition() {
        if (this.element) {
            this.element.style.left = '50%';
            this.element.style.top = '50%';
            this.element.style.transform = 'translate(-50%, -50%)';
        }
    }

    // Animate to a specific position (with smooth transition)
    animateToPosition(x, y, duration = 1000) {
        if (this.element) {
            this.element.style.transition = `left ${duration}ms ease-in-out, top ${duration}ms ease-in-out`;
            this.setPosition(x, y);

            // Remove transition after animation completes
            setTimeout(() => {
                if (this.element) {
                    this.element.style.transition = '';
                }
            }, duration);
        }
    }

    // Utility method to check if Pluto has a specific capability
    hasCapability(type, id) {
        return this.progression.isUnlocked(type, id);
    }

    // Get available options for customization
    getAvailableOptions() {
        return {
            skins: this.progression.getUnlockedItems('skin'),
            moods: this.progression.getUnlockedItems('mood'),
            animations: this.progression.getUnlockedItems('animation')
        };
    }

    // Enable/disable story mode (bypasses unlock restrictions)
    setStoryMode(enabled) {
        this.storyMode = enabled;
        console.log(`Pluto: Story mode ${enabled ? 'enabled' : 'disabled'}`);
    }

    // Check if in story mode
    isStoryMode() {
        return this.storyMode;
    }
} 
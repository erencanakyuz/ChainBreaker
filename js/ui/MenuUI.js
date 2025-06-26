// 🪐 UNIFIED PLUTO SYSTEM - Using GameManager's Pluto
class MenuUI {
    constructor() {
        this.animationInterval = null;
        this.gameManager = null;
        this.pluto = null;
        this._initializeUnifiedPluto();
    }

    async _initializeUnifiedPluto() {
        // Wait for GameManager to be available
        await this._waitForGameManager();

        if (this.gameManager && this.gameManager.pluto) {
            this.pluto = this.gameManager.pluto;
            await this.pluto.initialized;

            // Configure for menu context
            this._setupMenuPluto();

            console.log('🪐 MenuUI: Using unified Pluto from GameManager');
        }
    }

    async _waitForGameManager() {
        return new Promise((resolve) => {
            const checkGameManager = () => {
                if (window.gameManager && window.gameManager.pluto) {
                    this.gameManager = window.gameManager;
                    resolve();
                } else {
                    setTimeout(checkGameManager, 100);
                }
            };
            checkGameManager();
        });
    }

    _setupMenuPluto() {
        if (!this.pluto || !this.pluto.element) return;

        // Set menu context
        this.pluto.element.dataset.context = 'menu';

        // Use Pluto's built-in menu positioning
        this.pluto.setMenuPosition();

        // Set initial state
        this.pluto.setAnimation('idle');
        this.pluto.setMood('neutral');

        // Start animation cycle
        this.startAnimationCycle();

        // Make sure it's visible
        this.pluto.show();

        console.log('🪐 MenuUI: Unified Pluto configured for menu');
    }

    startAnimationCycle() {
        // Clear any existing timer to prevent duplicates
        if (this.animationInterval) {
            clearInterval(this.animationInterval);
        }

        // Play a random animation every 5-8 seconds (responsive timing)
        const getRandomInterval = () => {
            const deviceType = this.pluto?.responsiveSystem?.deviceType || 'desktop';
            const baseInterval = deviceType === 'small-mobile' ? 8000 :
                deviceType === 'mobile' ? 7000 : 6000;
            return Math.random() * 3000 + baseInterval;
        };

        const animate = () => {
            if (this.pluto) {
                this.pluto.playRandomAnimation();
            }
            this.animationInterval = setTimeout(animate, getRandomInterval());
        };

        // Start first animation after a short delay
        this.animationInterval = setTimeout(animate, 2000);
    }

    destroy() {
        // Stop the animation cycle when the UI is destroyed
        if (this.animationInterval) {
            clearTimeout(this.animationInterval);
            this.animationInterval = null;
        }

        // Don't destroy the Pluto itself since it's managed by GameManager
        // Just clean up our references
        this.pluto = null;
        this.gameManager = null;

        console.log('🪐 MenuUI: Cleaned up references to unified Pluto');
    }
}

// Initialize the Menu UI when the script is loaded in the menu
if (window.location.pathname.endsWith('menu.html')) {
    document.addEventListener('DOMContentLoaded', () => {
        window.menuUI = new MenuUI();
    });
} 
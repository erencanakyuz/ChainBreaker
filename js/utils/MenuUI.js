import { Pluto } from '../components/Pluto.js';

class MenuUI {
    constructor() {
        this.plutoContainer = null;
        this.pluto = null;
        this.animationInterval = null;
        this._createPluto();
    }

    _createPluto() {
        this.plutoContainer = document.createElement('div');
        this.plutoContainer.id = 'menu-pluto-container';
        document.body.appendChild(this.plutoContainer);

        this.pluto = new Pluto(this.plutoContainer, { storyMode: false });
        this.pluto.initialized.then(() => {
            if (this.pluto.element) {
                this.pluto.element.dataset.context = 'menu';

                // Set initial animation
                this.pluto.setAnimation('idle');

                // Start cycling through random animations
                this.startAnimationCycle();

                // Position Pluto for the menu
                this.pluto.element.style.cssText = `
                  position: absolute;
                  left: 80px;
                  top: 50%;
                  transform: translateY(-50%);
                  z-index: 1000;
                  pointer-events: none;
                  width: 100px;
                  height: 100px;
                `;
            }
        });
    }

    startAnimationCycle() {
        // Clear any existing timer to prevent duplicates
        if (this.animationInterval) {
            clearInterval(this.animationInterval);
        }

        // Play a random animation every 5-8 seconds
        this.animationInterval = setInterval(() => {
            if (this.pluto) {
                this.pluto.playRandomAnimation();
            }
        }, Math.random() * 3000 + 5000);
    }

    destroy() {
        // Stop the animation cycle when the UI is destroyed
        if (this.animationInterval) {
            clearInterval(this.animationInterval);
        }

        if (this.pluto) {
            this.pluto.destroy();
        }
        if (this.plutoContainer && this.plutoContainer.parentNode) {
            this.plutoContainer.parentNode.removeChild(this.plutoContainer);
        }
    }
}

// Initialize the Menu UI when the script is loaded in the menu
if (window.location.pathname.endsWith('menu.html')) {
    document.addEventListener('DOMContentLoaded', () => {
        window.menuUI = new MenuUI();
    });
}

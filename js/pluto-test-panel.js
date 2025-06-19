/* ==================================================
   🪐 PLUTO TEST PANEL - CONTROLLER MODULE
   Updated for new component-based architecture
   ================================================== */

// Global test panel state (avoid redeclaration conflicts)
window.currentPlutoAnimation = window.currentPlutoAnimation || 'idle';
window.currentPlutoMood = window.currentPlutoMood || 'neutral';
window.currentPlutoSpeech = window.currentPlutoSpeech || 'silent';
window.currentPlutoFeature = window.currentPlutoFeature || 'none';

/**
 * PlutoTestPanelController - Manages the test panel interface
 * Updated to work with the new GameManager and Pluto component system
 */
class PlutoTestPanelController {
    constructor() {
        this.isLoaded = false;
        this.isCollapsed = false;

        // Initialize when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }

        // Wait for GameManager to be ready
        this.waitForGameManager();
    }

    /**
     * Wait for GameManager to be available
     */
    waitForGameManager() {
        if (window.gameManager && window.gameManager.pluto) {
            console.log('🎮 GameManager and Pluto ready for test panel');
            return;
        }

        // Listen for GameManager ready event
        window.addEventListener('gameManagerReady', () => {
            console.log('🎮 GameManager ready event received by test panel');
        });

        // Also check periodically (fallback)
        const checkInterval = setInterval(() => {
            if (window.gameManager && window.gameManager.pluto) {
                console.log('🎮 GameManager and Pluto detected by test panel');
                clearInterval(checkInterval);
            }
        }, 500);
    }

    /**
     * Get Pluto instance from GameManager
     */
    getPluto() {
        return window.gameManager?.pluto || null;
    }

    /**
     * Check if Pluto is available
     */
    isPlutoReady() {
        return !!(window.gameManager?.pluto);
    }

    /**
     * Initialize the test panel
     */
    async init() {
        await this.loadTestPanel();
        this.setupEventListeners();
        this.updateStatusDisplay();
        this.isLoaded = true;
        console.log('🧪 Pluto Test Panel loaded!');
    }

    /**
     * Load test panel HTML structure
     */
    async loadTestPanel() {
        try {
            const response = await fetch('html/pluto-test-panel.html');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const panelHTML = await response.text();

            // Check if panel already exists
            const existingPanel = document.getElementById('pluto-test-panel');
            if (existingPanel) {
                existingPanel.remove();
            }

            // Create container and insert HTML
            const container = document.createElement('div');
            container.innerHTML = panelHTML;
            document.body.appendChild(container.firstElementChild);

            console.log('✅ Test panel HTML loaded');
        } catch (error) {
            console.error('❌ Failed to load test panel HTML:', error);
            this.createFallbackPanel();
        }
    }

    /**
     * Create fallback panel if HTML loading fails
     */
    createFallbackPanel() {
        const panel = document.createElement('div');
        panel.id = 'pluto-test-panel';
        panel.className = 'test-panel';
        panel.innerHTML = `
      <div class="panel-header">
        <h3>🪐 Pluto Test Lab (Component Mode)</h3>
        <button id="toggle-panel" class="toggle-btn">━</button>
      </div>
      <div class="panel-content">
        <div class="test-section">
          <h4>Mood Tests</h4>
          <div class="button-grid">
            <button onclick="window.testPlutoMood('happy')" class="test-btn">😄 Happy</button>
            <button onclick="window.testPlutoMood('sad')" class="test-btn">😢 Sad</button>
            <button onclick="window.testPlutoMood('angry')" class="test-btn">😠 Angry</button>
            <button onclick="window.testPlutoMood('neutral')" class="test-btn">😐 Neutral</button>
          </div>
        </div>
        <div class="test-section">
          <h4>Animation Tests</h4>
          <div class="button-grid">
            <button onclick="window.testPlutoAnimation('excited')" class="test-btn">✨ Excited</button>
            <button onclick="window.testPlutoAnimation('orbit')" class="test-btn">🌍 Orbit</button>
            <button onclick="window.testPlutoAnimation('fly-around')" class="test-btn">🚀 Fly Around</button>
            <button onclick="window.testPlutoAnimation('idle')" class="test-btn">⏸️ Idle</button>
          </div>
        </div>
        <div class="test-section">
          <h4>Skin Tests</h4>
          <div class="button-grid">
            <button onclick="window.testPlutoSkin('default')" class="test-btn">🪐 Default</button>
            <button onclick="window.testPlutoSkin('golden')" class="test-btn">✨ Golden</button>
            <button onclick="window.testPlutoSkin('cyborg')" class="test-btn">🤖 Cyborg</button>
          </div>
        </div>
        <div class="test-section">
          <h4>System Tests</h4>
          <div class="button-grid">
            <button onclick="window.testLevelComplete(1)" class="test-btn">🏆 Complete Level 1</button>
            <button onclick="window.testLevelComplete(2)" class="test-btn">🏆 Complete Level 2</button>
            <button onclick="window.resetPlutoToDefault()" class="test-btn stop">🔄 Reset</button>
          </div>
        </div>
      </div>
    `;
        document.body.appendChild(panel);
        console.log('✅ Fallback test panel created');
    }

    /**
     * Setup event listeners for panel interactions
     */
    setupEventListeners() {
        const toggleBtn = document.getElementById('toggle-panel');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => this.togglePanel());
        }

        // Setup keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
    }

    /**
     * Toggle panel collapsed state
     */
    togglePanel() {
        const panel = document.getElementById('pluto-test-panel');
        const toggleBtn = document.getElementById('toggle-panel');

        if (panel && toggleBtn) {
            this.isCollapsed = !this.isCollapsed;
            panel.classList.toggle('collapsed', this.isCollapsed);
            toggleBtn.textContent = this.isCollapsed ? '☰' : '━';
        }
    }

    /**
     * Handle keyboard shortcuts for quick testing
     * @param {KeyboardEvent} e - Keyboard event
     */
    handleKeyboardShortcuts(e) {
        // Only if Ctrl/Cmd + Shift are pressed
        if ((e.ctrlKey || e.metaKey) && e.shiftKey) {
            switch (e.key.toLowerCase()) {
                case 'p': // Toggle panel
                    e.preventDefault();
                    this.togglePanel();
                    break;
                case 'h': // Happy
                    e.preventDefault();
                    window.testPlutoMood('happy');
                    break;
                case 'e': // Excited
                    e.preventDefault();
                    window.testPlutoAnimation('excited');
                    break;
                case 'o': // Orbit
                    e.preventDefault();
                    window.testPlutoAnimation('orbit');
                    break;
                case 'x': // Reset
                    e.preventDefault();
                    window.resetPlutoToDefault();
                    break;
            }
        }
    }

    /**
     * Update status display
     */
    updateStatusDisplay() {
        const animationSpan = document.getElementById('current-animation');
        const moodSpan = document.getElementById('current-mood');
        const speechSpan = document.getElementById('current-speech');
        const featureSpan = document.getElementById('current-feature');

        if (animationSpan) animationSpan.textContent = window.currentPlutoAnimation;
        if (moodSpan) moodSpan.textContent = window.currentPlutoMood;
        if (speechSpan) speechSpan.textContent = window.currentPlutoSpeech;
        if (featureSpan) featureSpan.textContent = window.currentPlutoFeature;
    }

    /**
     * Show/hide the test panel
     * @param {boolean} visible - Whether to show the panel
     */
    setVisible(visible) {
        const panel = document.getElementById('pluto-test-panel');
        if (panel) {
            panel.style.display = visible ? 'block' : 'none';
        }
    }

    /**
     * Check if panel is loaded
     */
    isReady() {
        return this.isLoaded;
    }

    /**
     * Show animation indicator
     * @param {string} text - Indicator text
     */
    showAnimationIndicator(text) {
        // Remove existing indicator
        const existingIndicator = document.querySelector('.animation-indicator');
        if (existingIndicator) {
            existingIndicator.remove();
        }

        // Create new indicator
        const indicator = document.createElement('div');
        indicator.className = 'animation-indicator';
        indicator.textContent = text;
        indicator.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(45deg, #4ecdc4, #44a08d);
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            font-family: "Press Start 2P", monospace;
            font-size: 10px;
            z-index: 10000;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        document.body.appendChild(indicator);

        // Show with animation
        setTimeout(() => {
            indicator.style.opacity = '1';
        }, 10);

        // Auto-hide after delay
        setTimeout(() => {
            indicator.style.opacity = '0';
            setTimeout(() => {
                if (indicator.parentNode) {
                    indicator.parentNode.removeChild(indicator);
                }
            }, 300);
        }, 2000);
    }
}

// Global instance
const PlutoTestPanel = new PlutoTestPanelController();

/* ==================================================
   NEW COMPONENT-BASED TEST FUNCTIONS
   Updated to work with GameManager and Pluto component
   ================================================== */

/**
 * Test Pluto mood using the new component system
 * @param {string} moodType - Mood to test
 */
function testPlutoMood(moodType) {
    const pluto = window.gameManager?.pluto;
    if (!pluto) {
        console.warn('🧪 Pluto not available for mood test');
        PlutoTestPanel.showAnimationIndicator('⚠️ Pluto not ready');
        return;
    }

    console.log(`🧪 Testing Pluto mood: ${moodType}`);
    const success = pluto.setMood(moodType);

    if (success) {
        window.currentPlutoMood = moodType;
        PlutoTestPanel.showAnimationIndicator(`Mood: ${moodType}`);
        PlutoTestPanel.updateStatusDisplay();
    } else {
        PlutoTestPanel.showAnimationIndicator(`❌ Mood ${moodType} locked`);
    }
}

/**
 * Test Pluto animation using the new component system
 * @param {string} animationType - Animation to test
 */
function testPlutoAnimation(animationType) {
    const pluto = window.gameManager?.pluto;
    if (!pluto) {
        console.warn('🧪 Pluto not available for animation test');
        PlutoTestPanel.showAnimationIndicator('⚠️ Pluto not ready');
        return;
    }

    console.log(`🧪 Testing Pluto animation: ${animationType}`);
    const success = pluto.setAnimation(animationType);

    if (success) {
        window.currentPlutoAnimation = animationType;
        PlutoTestPanel.showAnimationIndicator(`Animation: ${animationType}`);
        PlutoTestPanel.updateStatusDisplay();
    } else {
        PlutoTestPanel.showAnimationIndicator(`❌ Animation ${animationType} locked`);
    }
}

/**
 * Test Pluto skin using the new component system
 * @param {string} skinType - Skin to test
 */
function testPlutoSkin(skinType) {
    const pluto = window.gameManager?.pluto;
    if (!pluto) {
        console.warn('🧪 Pluto not available for skin test');
        PlutoTestPanel.showAnimationIndicator('⚠️ Pluto not ready');
        return;
    }

    console.log(`🧪 Testing Pluto skin: ${skinType}`);
    const success = pluto.applySkin(skinType);

    if (success) {
        PlutoTestPanel.showAnimationIndicator(`Skin: ${skinType}`);
    } else {
        PlutoTestPanel.showAnimationIndicator(`❌ Skin ${skinType} locked`);
    }
}

/**
 * Test level completion using the GameManager
 * @param {number} levelId - Level to complete
 */
function testLevelComplete(levelId) {
    const gameManager = window.gameManager;
    if (!gameManager) {
        console.warn('🧪 GameManager not available for level test');
        PlutoTestPanel.showAnimationIndicator('⚠️ GameManager not ready');
        return;
    }

    console.log(`🧪 Testing level completion: ${levelId}`);
    gameManager.completeLevel(levelId);
    PlutoTestPanel.showAnimationIndicator(`🏆 Level ${levelId} completed!`);
}

/**
 * Reset Pluto to default state
 */
function resetPlutoToDefault() {
    const pluto = window.gameManager?.pluto;
    if (!pluto) {
        console.warn('🧪 Pluto not available for reset');
        PlutoTestPanel.showAnimationIndicator('⚠️ Pluto not ready');
        return;
    }

    console.log('🧪 Resetting Pluto to default state');

    // Reset to default values
    pluto.applySkin('default');
    pluto.setMood('neutral');
    pluto.setAnimation('idle');
    pluto.show();
    pluto.resetPosition();

    // Update status
    window.currentPlutoAnimation = 'idle';
    window.currentPlutoMood = 'neutral';
    window.currentPlutoSpeech = 'silent';
    window.currentPlutoFeature = 'none';

    PlutoTestPanel.showAnimationIndicator('🔄 Reset to default');
    PlutoTestPanel.updateStatusDisplay();
}

/**
 * Show progression debug info
 */
function showProgressionDebug() {
    const progression = window.gameManager?.progression || window.playerProgression;
    if (!progression) {
        console.warn('🧪 PlayerProgression not available');
        return;
    }

    const stats = progression.getStats();
    console.log('🧪 Progression Debug:', stats);

    const pluto = window.gameManager?.pluto;
    if (pluto) {
        console.log('🧪 Pluto State:', pluto.getState());
    }
}

/* ==================================================
   UTILITY FUNCTIONS
   For test panel status updates and indicators
   ================================================== */

/**
 * Update test panel status display
 * @param {string} type - Status type (animation, mood, speech, feature)
 * @param {string} value - Status value
 */
function updateStatus(type, value) {
    switch (type) {
        case 'animation':
            window.currentPlutoAnimation = value;
            break;
        case 'mood':
            window.currentPlutoMood = value;
            break;
        case 'speech':
            window.currentPlutoSpeech = value;
            break;
        case 'feature':
            window.currentPlutoFeature = value;
            break;
    }

    if (PlutoTestPanel.isReady()) {
        PlutoTestPanel.updateStatusDisplay();
    }
}

/**
 * Show animation indicator
 * @param {string} text - Indicator text
 */
function showAnimationIndicator(text) {
    if (PlutoTestPanel.isReady()) {
        PlutoTestPanel.showAnimationIndicator(text);
    }
}

/**
 * Toggle test panel visibility
 */
function toggleTestPanel() {
    PlutoTestPanel.togglePanel();
}

/**
 * Show test panel
 */
function showTestPanel() {
    PlutoTestPanel.setVisible(true);
}

/**
 * Hide test panel
 */
function hideTestPanel() {
    PlutoTestPanel.setVisible(false);
}

/* ==================================================
   EXPORTS & GLOBAL ATTACHMENTS
   ================================================== */

// Attach to window for global access (maintaining backwards compatibility)
if (typeof window !== 'undefined') {
    window.PlutoTestPanelController = PlutoTestPanelController;
    window.PlutoTestPanel = PlutoTestPanel;

    // New component-based test functions
    window.testPlutoMood = testPlutoMood;
    window.testPlutoAnimation = testPlutoAnimation;
    window.testPlutoSkin = testPlutoSkin;
    window.testLevelComplete = testLevelComplete;
    window.resetPlutoToDefault = resetPlutoToDefault;
    window.showProgressionDebug = showProgressionDebug;

    // Utility functions
    window.updateStatus = updateStatus;
    window.showAnimationIndicator = showAnimationIndicator;
    window.toggleTestPanel = toggleTestPanel;
    window.showTestPanel = showTestPanel;
    window.hideTestPanel = hideTestPanel;
}

console.log('🧪 Pluto Test Panel Controller loaded! (Component Mode)'); 
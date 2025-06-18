/* ==================================================
   🪐 PLUTO TEST PANEL - CONTROLLER MODULE
   Extracted from index.html for better organization
   ================================================== */

// Global test panel state (avoid redeclaration conflicts)
window.currentPlutoAnimation = window.currentPlutoAnimation || 'idle';
window.currentPlutoMood = window.currentPlutoMood || 'neutral';
window.currentPlutoSpeech = window.currentPlutoSpeech || 'silent';
window.currentPlutoFeature = window.currentPlutoFeature || 'none';

/**
 * PlutoTestPanelController - Manages the test panel interface
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
        <h3>🪐 Pluto Test Lab (Fallback)</h3>
        <button id="toggle-panel" class="toggle-btn">━</button>
      </div>
      <div class="panel-content">
        <div class="test-section">
          <h4>Basic Controls</h4>
          <div class="button-grid">
            <button onclick="testPlutoAnimation('excited')" class="test-btn">😄 Excited</button>
            <button onclick="testPlutoSpeech('greeting')" class="test-btn">👋 Greeting</button>
            <button onclick="stopPlutoAnimation()" class="test-btn stop">⏹️ Stop</button>
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
                    if (typeof testPlutoMood === 'function') testPlutoMood('happy');
                    break;
                case 'e': // Excited
                    e.preventDefault();
                    if (typeof testPlutoAnimation === 'function') testPlutoAnimation('excited');
                    break;
                case 's': // Speech
                    e.preventDefault();
                    if (typeof testPlutoSpeech === 'function') testPlutoSpeech('greeting');
                    break;
                case 'x': // Stop
                    e.preventDefault();
                    if (typeof stopPlutoAnimation === 'function') stopPlutoAnimation();
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
     * Add custom test button
     * @param {string} section - Section to add to ('basic', 'advanced', etc.)
     * @param {string} label - Button label
     * @param {Function} callback - Click callback
     */
    addCustomButton(section, label, callback) {
        const sectionElement = document.querySelector(`.test-section h4:contains("${section}")`);
        if (sectionElement) {
            const buttonGrid = sectionElement.parentElement.querySelector('.button-grid');
            if (buttonGrid) {
                const button = document.createElement('button');
                button.className = 'test-btn';
                button.textContent = label;
                button.addEventListener('click', callback);
                buttonGrid.appendChild(button);
            }
        }
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
        document.body.appendChild(indicator);

        // Show with animation
        setTimeout(() => {
            indicator.classList.add('show');
        }, 10);

        // Auto-hide after delay
        setTimeout(() => {
            indicator.classList.remove('show');
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
   FEATURE IMPLEMENTATIONS
   Advanced feature test functions
   ================================================== */

let plutoAutoRoam = false;
let plutoRingReact = false;
let plutoWeatherMode = false;
let plutoPartyMode = false;
let plutoMeditationMode = false;

/**
 * Test advanced Pluto features
 * @param {string} featureType - Feature type to test
 */
function testPlutoFeature(featureType) {
    console.log(`Testing Pluto feature: ${featureType}`);
    updateStatus('feature', featureType);

    switch (featureType) {
        case 'roam':
            toggleAutoRoam();
            break;
        case 'react':
            toggleRingReact();
            break;
        case 'weather':
            toggleWeatherMode();
            break;
        case 'party':
            togglePartyMode();
            break;
        case 'meditation':
            toggleMeditationMode();
            break;
        case 'reset':
            resetPlutoToDefault();
            break;
    }
}

function toggleAutoRoam() {
    plutoAutoRoam = !plutoAutoRoam;
    if (typeof showPlutoSpeech === 'function') {
        showPlutoSpeech(plutoAutoRoam ? "Özgürce dolaşacağım! 🚶‍♂️✨" : "Merkeze dönüyorum! 🏠");
    }
}

function toggleRingReact() {
    plutoRingReact = !plutoRingReact;
    if (typeof showPlutoSpeech === 'function') {
        showPlutoSpeech(plutoRingReact ? "Halkalara tepki vereceğim! ⚡" : "Normal moda döndüm! 😌");
    }
}

function toggleWeatherMode() {
    plutoWeatherMode = !plutoWeatherMode;
    if (typeof showPlutoSpeech === 'function') {
        showPlutoSpeech(plutoWeatherMode ? "Hava durumu modunda! 🌦️" : "Normal hava! ☀️");
    }
}

function togglePartyMode() {
    plutoPartyMode = !plutoPartyMode;
    if (typeof showPlutoSpeech === 'function') {
        showPlutoSpeech(plutoPartyMode ? "PARTİ ZAMANI! 🎊🎉" : "Parti bitti! 😴");
    }
}

function toggleMeditationMode() {
    plutoMeditationMode = !plutoMeditationMode;
    if (typeof showPlutoSpeech === 'function') {
        showPlutoSpeech(plutoMeditationMode ? "Meditasyon modunda... 🧘‍♂️" : "Meditasyon tamamlandı! ✨");
    }
}

function resetPlutoToDefault() {
    // Reset all states
    plutoAutoRoam = false;
    plutoRingReact = false;
    plutoWeatherMode = false;
    plutoPartyMode = false;
    plutoMeditationMode = false;

    // Reset animations and moods
    if (typeof stopPlutoAnimation === 'function') {
        stopPlutoAnimation();
    }

    // Update status
    updateStatus('animation', 'idle');
    updateStatus('mood', 'neutral');
    updateStatus('speech', 'silent');
    updateStatus('feature', 'none');

    if (typeof showPlutoSpeech === 'function') {
        showPlutoSpeech("Varsayılan ayarlara döndüm! 🔄");
    }
}

/* ==================================================
   EXPORTS
   ================================================== */

// Export for module systems (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        PlutoTestPanelController,
        PlutoTestPanel,
        updateStatus,
        showAnimationIndicator,
        toggleTestPanel,
        showTestPanel,
        hideTestPanel,
        testPlutoFeature
    };
}

// Also attach to window for global access
if (typeof window !== 'undefined') {
    window.PlutoTestPanelController = PlutoTestPanelController;
    window.PlutoTestPanel = PlutoTestPanel;
    window.updateStatus = updateStatus;
    window.showAnimationIndicator = showAnimationIndicator;
    window.toggleTestPanel = toggleTestPanel;
    window.showTestPanel = showTestPanel;
    window.hideTestPanel = hideTestPanel;
    window.testPlutoFeature = testPlutoFeature;
}

console.log('🧪 Pluto Test Panel Controller loaded!'); 
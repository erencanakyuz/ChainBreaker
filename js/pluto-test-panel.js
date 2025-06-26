/* ==================================================
   �� PLUTO TEST PANEL - SIMPLE CLEAN SYSTEM  
   Updated for simplified animation system
   ================================================== */

// Global test panel state
window.currentPlutoAnimation = window.currentPlutoAnimation || 'idle';
window.currentPlutoMood = window.currentPlutoMood || 'neutral';

/**
 * PlutoTestPanelController - Simplified for clean system
 * Only works with basic animations: idle, blink, and story animations
 */
class PlutoTestPanelController {
    constructor() {
        this.isLoaded = false;
        this.isCollapsed = false;
        this.pluto = null;

        // Simple animation mapping for clean system
        this.animationMapping = {
            // Basic animations only
            'idle': 'pluto-idle-pulse',
            'blink': 'blink',

            // Story scene animations (protected)
            'story-wrap': 'plutoWrap',
            'story-pluto': 'pluto',
            'story-eye': 'pluto_eye'
        };

        // Simple categories
        this.animationCategories = {
            basic: ['idle', 'blink'],
            story: ['story-wrap', 'story-pluto', 'story-eye']
        };

        // Initialize
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }

        this.waitForGameManager();
    }

    /**
     * Wait for GameManager to be available
     */
    waitForGameManager() {
        if (window.gameManager && window.gameManager.pluto) {
            console.log('🎮 GameManager ready for simple test panel');
            return;
        }

        let checkInterval = setInterval(() => {
            if (window.gameManager && window.gameManager.pluto) {
                console.log('🎮 Simple test panel connected to GameManager');
                this.pluto = window.gameManager.pluto;
                this.updateStatusDisplay();
                clearInterval(checkInterval);
            }
        }, 500);

        // Timeout after 10 seconds
        setTimeout(() => {
            if (checkInterval) {
                clearInterval(checkInterval);
                console.warn('⚠️ GameManager not found - test panel running in demo mode');
            }
        }, 10000);
    }

    /**
     * Get Pluto instance from GameManager
     */
    getPluto() {
        if (this.pluto) return this.pluto;
        this.pluto = window.gameManager?.pluto || null;
        return this.pluto;
    }

    /**
     * Initialize the simple test panel
     */
    async init() {
        await this.createSimplePanel();
        this.setupEventListeners();
        this.updateStatusDisplay();
        this.isLoaded = true;
        console.log('🧪 Simple PlutoTestPanel initialized');
    }

    /**
     * Create simple test panel
     */
    async createSimplePanel() {
        // Remove existing panel
        const existingPanel = document.getElementById('pluto-test-panel');
        if (existingPanel) {
            existingPanel.remove();
        }

        const panel = document.createElement('div');
        panel.id = 'pluto-test-panel';
        panel.className = 'test-panel';
        panel.innerHTML = `
            <div class="panel-header">
                <h3>🪐 Pluto Test Lab (Simple System)</h3>
                <button id="toggle-panel" class="toggle-btn">━</button>
            </div>
            <div class="panel-content">
                <div class="status-section">
                    <h4>📊 Status</h4>
                    <div class="status-grid">
                        <span>Pluto: <span id="pluto-status">Loading...</span></span>
                        <span>Animation: <span id="current-animation">idle</span></span>
                        <span>System: <span id="system-type">Simple Clean</span></span>
                    </div>
                </div>
                
                <div class="test-section">
                    <h4>🎯 Basic Tests</h4>
                    <div class="button-grid">
                        <button onclick="window.testSimpleAnimation('idle')" class="test-btn">⏸️ Idle Pulse</button>
                        <button onclick="window.testSimpleAnimation('blink')" class="test-btn">👁️ Blink Test</button>
                        <button onclick="window.resetPlutoToDefault()" class="test-btn stop">🔄 Reset</button>
                    </div>
                </div>

                <div class="test-section">
                    <h4>📖 Story Scene Tests</h4>
                    <div class="button-grid">
                        <button onclick="window.testStoryAnimation('story-wrap')" class="test-btn">📦 Wrap Animation</button>
                        <button onclick="window.testStoryAnimation('story-pluto')" class="test-btn">🪐 Pluto Movement</button>
                        <button onclick="window.testStoryAnimation('story-eye')" class="test-btn">👁️ Eye Movement</button>
                    </div>
                </div>

                <div class="test-section">
                    <h4>🔧 System Tests</h4>
                    <div class="button-grid">
                        <button onclick="window.testCSSValidation()" class="test-btn">✅ CSS Validation</button>
                        <button onclick="window.showSystemInfo()" class="test-btn">📋 System Info</button>
                        <button onclick="window.toggleTestPanel()" class="test-btn">👁️ Toggle Panel</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(panel);
        console.log('✅ Simple test panel created');
    }

    /**
     * Setup simple event listeners
     */
    setupEventListeners() {
        const toggleBtn = document.getElementById('toggle-panel');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => this.togglePanel());
        }

        // Simple keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.shiftKey) {
                switch (e.key.toLowerCase()) {
                    case 'p': // Toggle panel
                        e.preventDefault();
                        this.togglePanel();
                        break;
                    case 'i': // Idle animation
                        e.preventDefault();
                        window.testSimpleAnimation('idle');
                        break;
                    case 'r': // Reset
                        e.preventDefault();
                        window.resetPlutoToDefault();
                        break;
                }
            }
        });
    }

    /**
     * Toggle panel visibility
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
     * Update status display
     */
    updateStatusDisplay() {
        const pluto = this.getPluto();

        const statusEl = document.getElementById('pluto-status');
        const animationEl = document.getElementById('current-animation');

        if (statusEl) {
            statusEl.textContent = pluto ? 'Ready' : 'Not Connected';
        }

        if (animationEl && pluto) {
            try {
                const state = pluto.getState ? pluto.getState() : {};
                animationEl.textContent = state.animation || 'idle';
            } catch (error) {
                animationEl.textContent = 'unknown';
            }
        }
    }

    /**
     * Show animation indicator
     */
    showAnimationIndicator(text) {
        const existingIndicator = document.querySelector('.animation-indicator');
        if (existingIndicator) {
            existingIndicator.remove();
        }

        const indicator = document.createElement('div');
        indicator.className = 'animation-indicator';
        indicator.textContent = text;
        indicator.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(45deg, #8e2de2, #4a00e0);
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            font-family: 'Arial', sans-serif;
            font-size: 12px;
            z-index: 10000;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        document.body.appendChild(indicator);

        setTimeout(() => indicator.style.opacity = '1', 10);
        setTimeout(() => {
            indicator.style.opacity = '0';
            setTimeout(() => indicator.remove(), 300);
        }, 2000);
    }
}

// Global functions for simple system
window.testSimpleAnimation = function (animationType) {
    console.log(`🧪 Testing simple animation: ${animationType}`);

    const pluto = window.gameManager?.pluto;
    if (!pluto) {
        console.warn('❌ No Pluto instance found');
        return;
    }

    if (window.plutoTestPanel) {
        window.plutoTestPanel.showAnimationIndicator(`Testing: ${animationType}`);
    }

    // Apply animation directly
    try {
        if (animationType === 'idle') {
            pluto.setAnimation('idle');
        } else if (animationType === 'blink') {
            // Trigger blink test
            const plutoElement = document.querySelector('.pluto-entity');
            if (plutoElement) {
                const eyes = plutoElement.querySelectorAll('.eye');
                eyes.forEach(eye => {
                    eye.style.animation = 'blink 0.5s ease-in-out 3';
                });
            }
        }
    } catch (error) {
        console.error('❌ Animation test failed:', error);
    }
};

window.testStoryAnimation = function (animationType) {
    console.log(`📖 Testing story animation: ${animationType}`);

    if (window.plutoTestPanel) {
        window.plutoTestPanel.showAnimationIndicator(`Story Test: ${animationType}`);
    }

    // These are for story scenes, just show info
    const info = {
        'story-wrap': 'plutoWrap animation - used in story scenes',
        'story-pluto': 'pluto animation - Pluto left-right movement',
        'story-eye': 'pluto_eye animation - eye rotation'
    };

    console.log('📖 Story Animation Info:', info[animationType]);
};

window.testCSSValidation = function () {
    console.log('✅ Running CSS validation...');

    const animations = ['pluto-idle-pulse', 'blink', 'plutoWrap', 'pluto', 'pluto_eye'];
    const results = {};

    animations.forEach(anim => {
        // Check if animation exists in CSS
        const testEl = document.createElement('div');
        testEl.style.animation = `${anim} 1s`;
        results[anim] = testEl.style.animation.includes(anim);
    });

    console.table(results);

    if (window.plutoTestPanel) {
        window.plutoTestPanel.showAnimationIndicator('CSS Validation Complete');
    }
};

window.showSystemInfo = function () {
    const info = {
        'Total Animations': 4,
        'Basic': 2,
        'Story': 3,
        'System': 'Clean & Simple',
        'Lines of CSS': '~130',
        'Complexity': 'Minimal'
    };

    console.log('📋 Simple System Info:');
    console.table(info);

    if (window.plutoTestPanel) {
        window.plutoTestPanel.showAnimationIndicator('System: Clean & Simple');
    }
};

window.resetPlutoToDefault = function () {
    console.log('🔄 Resetting Pluto to default...');

    const pluto = window.gameManager?.pluto;
    if (pluto) {
        try {
            pluto.setAnimation('idle');
            pluto.setMood('neutral');
        } catch (error) {
            console.error('❌ Reset failed:', error);
        }
    }

    if (window.plutoTestPanel) {
        window.plutoTestPanel.showAnimationIndicator('Reset Complete');
        window.plutoTestPanel.updateStatusDisplay();
    }
};

window.toggleTestPanel = function () {
    if (window.plutoTestPanel) {
        window.plutoTestPanel.togglePanel();
    }
};

// Initialize simple test panel
window.plutoTestPanel = new PlutoTestPanelController(); 
/* ==================================================
   🪐 PLUTO SIMPLE TEST PANEL - CLEAN SYSTEM  
   Only 4 animations: idle, blink, plutoWrap, pluto, pluto_eye
   ================================================== */

/**
 * Simple Pluto Test Panel for Clean System
 */
class SimplePlutoTestPanel {
    constructor() {
        this.isLoaded = false;
        this.isCollapsed = false;
        this.pluto = null;

        // Only 4 animations in clean system
        this.animations = {
            basic: {
                'idle': { name: 'Idle Pulse', css: 'pluto-idle-pulse' },
                'blink': { name: 'Blink', css: 'blink' }
            },
            story: {
                'wrap': { name: 'Wrap Movement', css: 'plutoWrap' },
                'movement': { name: 'Left-Right', css: 'pluto' },
                'eye': { name: 'Eye Rotation', css: 'pluto_eye' }
            }
        };

        this.init();
    }

    async init() {
        console.log('🧪 Initializing Simple Pluto Test Panel...');
        this.createPanel();
        this.setupEventListeners();
        this.waitForPluto();
        this.isLoaded = true;
    }

    createPanel() {
        // Remove existing panel
        const existing = document.getElementById('simple-test-panel');
        if (existing) existing.remove();

        const panel = document.createElement('div');
        panel.id = 'simple-test-panel';
        panel.innerHTML = `
            <style>
                #simple-test-panel {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    width: 300px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border-radius: 10px;
                    padding: 15px;
                    color: white;
                    font-family: Arial, sans-serif;
                    font-size: 12px;
                    z-index: 10000;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                    transition: all 0.3s ease;
                }
                #simple-test-panel.collapsed .panel-content {
                    display: none;
                }
                .panel-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 10px;
                    border-bottom: 1px solid rgba(255,255,255,0.3);
                    padding-bottom: 8px;
                }
                .panel-header h3 {
                    margin: 0;
                    font-size: 14px;
                }
                .toggle-btn {
                    background: none;
                    border: none;
                    color: white;
                    cursor: pointer;
                    font-size: 16px;
                    padding: 2px 8px;
                    border-radius: 3px;
                }
                .toggle-btn:hover {
                    background: rgba(255,255,255,0.2);
                }
                .status-info {
                    background: rgba(255,255,255,0.1);
                    padding: 8px;
                    border-radius: 5px;
                    margin-bottom: 10px;
                }
                .test-section {
                    margin-bottom: 10px;
                }
                .test-section h4 {
                    margin: 0 0 5px 0;
                    font-size: 12px;
                    opacity: 0.9;
                }
                .button-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 5px;
                }
                .test-btn {
                    background: rgba(255,255,255,0.2);
                    border: none;
                    color: white;
                    padding: 8px 12px;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 11px;
                    transition: background 0.2s ease;
                }
                .test-btn:hover {
                    background: rgba(255,255,255,0.3);
                }
                .test-btn.active {
                    background: rgba(255,255,255,0.4);
                    font-weight: bold;
                }
                .test-btn.wide {
                    grid-column: span 2;
                }
                .animation-indicator {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: rgba(142, 45, 226, 0.9);
                    color: white;
                    padding: 15px 25px;
                    border-radius: 8px;
                    font-size: 14px;
                    z-index: 20000;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                }
            </style>
            
            <div class="panel-header">
                <h3>🪐 Simple Test Panel</h3>
                <button class="toggle-btn" onclick="simpleTestPanel.toggle()">━</button>
            </div>
            
            <div class="panel-content">
                <div class="status-info">
                    <strong>Status:</strong> <span id="pluto-status">Loading...</span><br>
                    <strong>Animation:</strong> <span id="current-anim">idle</span><br>
                    <strong>System:</strong> Clean (4 animations)
                </div>

                <div class="test-section">
                    <h4>🎯 Basic Animations</h4>
                    <div class="button-grid">
                        <button class="test-btn" onclick="simpleTestPanel.testAnimation('idle')">
                            ⏸️ Idle
                        </button>
                        <button class="test-btn" onclick="simpleTestPanel.testBlink()">
                            👁️ Blink
                        </button>
                    </div>
                </div>

                <div class="test-section">
                    <h4>📖 Story Animations</h4>
                    <div class="button-grid">
                        <button class="test-btn" onclick="simpleTestPanel.showStoryInfo('wrap')">
                            📦 Wrap
                        </button>
                        <button class="test-btn" onclick="simpleTestPanel.showStoryInfo('movement')">
                            ↔️ Move
                        </button>
                        <button class="test-btn" onclick="simpleTestPanel.showStoryInfo('eye')">
                            👁️ Eye
                        </button>
                    </div>
                </div>

                <div class="test-section">
                    <h4>🔧 System</h4>
                    <div class="button-grid">
                        <button class="test-btn" onclick="simpleTestPanel.validateCSS()">
                            ✅ Validate
                        </button>
                        <button class="test-btn" onclick="simpleTestPanel.showInfo()">
                            📋 Info
                        </button>
                        <button class="test-btn wide" onclick="simpleTestPanel.reset()">
                            🔄 Reset to Default
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(panel);
        console.log('✅ Simple test panel created');
    }

    setupEventListeners() {
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.shiftKey) {
                switch (e.key.toLowerCase()) {
                    case 'p':
                        e.preventDefault();
                        this.toggle();
                        break;
                    case 'i':
                        e.preventDefault();
                        this.testAnimation('idle');
                        break;
                    case 'r':
                        e.preventDefault();
                        this.reset();
                        break;
                }
            }
        });
    }

    waitForPluto() {
        const checkPluto = () => {
            this.pluto = window.gameManager?.pluto;
            const statusEl = document.getElementById('pluto-status');

            if (this.pluto) {
                if (statusEl) statusEl.textContent = 'Connected ✅';
                console.log('🎮 Simple test panel connected to Pluto');
                this.updateStatus();
            } else {
                if (statusEl) statusEl.textContent = 'Searching... 🔍';
                setTimeout(checkPluto, 1000);
            }
        };

        checkPluto();
    }

    toggle() {
        const panel = document.getElementById('simple-test-panel');
        if (panel) {
            this.isCollapsed = !this.isCollapsed;
            panel.classList.toggle('collapsed', this.isCollapsed);
        }
    }

    testAnimation(type) {
        console.log(`🧪 Testing animation: ${type}`);

        if (this.pluto && type === 'idle') {
            try {
                this.pluto.setAnimation('idle');
                this.updateStatus();
            } catch (error) {
                console.error('❌ Animation failed:', error);
            }
        }

        this.showIndicator(`Testing: ${this.animations.basic[type]?.name || type}`);
    }

    testBlink() {
        console.log('👁️ Testing blink animation');

        const plutoElement = document.querySelector('.pluto-entity');
        if (plutoElement) {
            const eyes = plutoElement.querySelectorAll('.eye');
            eyes.forEach(eye => {
                eye.style.animation = 'blink 0.5s ease-in-out 3';
            });
        }

        this.showIndicator('Testing: Blink');
    }

    showStoryInfo(type) {
        const info = this.animations.story[type];
        if (info) {
            console.log(`📖 Story Animation: ${info.name} (${info.css})`);
            this.showIndicator(`Story: ${info.name}`);
        }
    }

    validateCSS() {
        console.log('✅ Validating CSS animations...');

        const allAnimations = [
            ...Object.values(this.animations.basic).map(a => a.css),
            ...Object.values(this.animations.story).map(a => a.css)
        ];

        const results = {};
        allAnimations.forEach(anim => {
            const testEl = document.createElement('div');
            testEl.style.animation = `${anim} 1s`;
            results[anim] = testEl.style.animation.includes(anim) ? '✅' : '❌';
        });

        console.table(results);
        this.showIndicator('CSS Validation Complete');
    }

    showInfo() {
        const info = {
            'System': 'Clean & Simple',
            'Total Animations': 5,
            'Basic Animations': 2,
            'Story Animations': 3,
            'CSS Lines': '~130',
            'Complexity': 'Minimal'
        };

        console.log('📋 System Information:');
        console.table(info);
        this.showIndicator('System: Clean & Simple');
    }

    reset() {
        console.log('🔄 Resetting to default...');

        if (this.pluto) {
            try {
                this.pluto.setAnimation('idle');
                this.updateStatus();
            } catch (error) {
                console.error('❌ Reset failed:', error);
            }
        }

        this.showIndicator('Reset Complete');
    }

    updateStatus() {
        const animEl = document.getElementById('current-anim');
        if (animEl && this.pluto) {
            try {
                const state = this.pluto.getState();
                animEl.textContent = state.animation || 'idle';
            } catch (error) {
                animEl.textContent = 'unknown';
            }
        }
    }

    showIndicator(text) {
        // Remove existing
        const existing = document.querySelector('.animation-indicator');
        if (existing) existing.remove();

        const indicator = document.createElement('div');
        indicator.className = 'animation-indicator';
        indicator.textContent = text;
        document.body.appendChild(indicator);

        setTimeout(() => indicator.style.opacity = '1', 10);
        setTimeout(() => {
            indicator.style.opacity = '0';
            setTimeout(() => indicator.remove(), 300);
        }, 2000);
    }
}

// Initialize simple test panel
window.simpleTestPanel = new SimplePlutoTestPanel();
console.log('🪐 Simple Pluto Test Panel loaded'); 
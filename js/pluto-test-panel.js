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

        // Current state tracking
        this.currentContext = 'menu'; // 'menu' or 'game'
        this.currentSkin = 'default';
        this.currentMood = 'neutral';
        this.currentAnimation = 'idle';

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
            // Update status when GameManager is ready
            setTimeout(() => {
                this.updateStatusDisplay();
                this.updateActiveButtons();
            }, 500);
        });

        // Also check periodically (fallback)
        const checkInterval = setInterval(() => {
            if (window.gameManager && window.gameManager.pluto) {
                console.log('🎮 GameManager and Pluto detected by test panel');
                this.updateStatusDisplay();
                this.updateActiveButtons();
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
     * Initialize the test panel system
     */
    async init() {
        // Load test panel template
        await this.loadTestPanel();

        // Setup event listeners
        this.setupEventListeners();

        // Update initial status
        this.updateStatusDisplay();
        this.updateActiveButtons();

        // Listen for GameManager ready event
        window.addEventListener('gameManagerReady', () => {
            console.log('🧪 PlutoTestPanel: GameManager ready, updating status');
            this.updateStatusDisplay();
            this.updateActiveButtons();
        });

        // Listen for Pluto state changes
        window.addEventListener('plutoStateChanged', () => {
            this.updateStatusDisplay();
            this.updateActiveButtons();
        });

        window.addEventListener('plutoAnimationChanged', () => {
            this.updateStatusDisplay();
            this.updateActiveButtons();
        });

        window.addEventListener('itemUnlocked', () => {
            this.updateStatusDisplay();
            this.updateActiveButtons();
        });

        this.isLoaded = true;
        console.log('🧪 PlutoTestPanel: New Base System initialization complete');
    }

    /**
     * Load test panel HTML structure
     */
    async loadTestPanel() {
        try {
            // Try loading with template manager first if available
            if (window.templateManager) {
                const panelElement = await window.templateManager.createElement('test-panel');

                // Check if panel already exists
                const existingPanel = document.getElementById('pluto-test-panel');
                if (existingPanel) {
                    existingPanel.remove();
                }

                document.body.appendChild(panelElement);
                console.log('✅ Test panel loaded via TemplateManager');
                return;
            }

            // If template manager failed, use fallback
            throw new Error('TemplateManager not available');
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
        const pluto = this.getPluto();
        if (!this.isPlutoReady()) {
            const statusElement = document.getElementById('pluto-status');
            if (statusElement) {
                statusElement.innerHTML = '<div style="color: #e74c3c;">Pluto: Not Ready</div>';
            }
            return;
        }

        const statusElement = document.getElementById('pluto-status');
        if (statusElement && pluto) {
            const context = pluto.element?.dataset.context || 'menu';
            const position = context === 'menu' ? 'left side' : 'center';

            statusElement.innerHTML = `
                <div style="color: #2ecc71;">✅ Ready (New Base System)</div>
                <div>Context: ${context.toUpperCase()}</div>
                <div>Position: ${position}</div>
                <div>Visible: ${pluto.isVisible ? 'Yes' : 'No'}</div>
            `;
        }

        // Update individual status elements and sync current state
        if (pluto) {
            this.currentSkin = pluto.skin || 'default';
            this.currentMood = pluto.mood || 'neutral';
            this.currentAnimation = pluto.currentAnimation || 'idle';
            this.currentContext = pluto.element?.dataset.context || 'menu';

            this.updateStatusElement('current-context', this.currentContext);
            this.updateStatusElement('current-skin', this.currentSkin);
            this.updateStatusElement('current-mood', this.currentMood);
            this.updateStatusElement('current-animation', this.currentAnimation);
            this.updateStatusElement('current-position', this.currentContext === 'menu' ? 'left side' : 'center');
        }

        console.log('📊 Status display updated for new base system');
    }

    /**
     * Get display name for current Pluto type
     */
    getPlutoTypeName() {
        const names = {
            'modern': 'Modern',
            'story': 'Story',
            'scene': 'Scene'
        };
        return names[this.currentPlutoType] || 'Unknown';
    }

    /**
     * Get currently active Pluto instance
     */
    getCurrentActivePluto() {
        switch (this.currentPlutoType) {
            case 'modern':
                return this.getPluto();
            case 'story':
                return this.storyPluto;
            case 'scene':
                return this.scenePlutos.get(this.currentScene);
            default:
                return null;
        }
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

    /**
     * Switch between different Pluto types
     * @param {string} type - 'modern', 'story', or 'scene'
     */
    switchPlutoType(type) {
        console.log(`🔄 Switching to ${type} Pluto...`);
        this.currentPlutoType = type;

        // Update UI buttons
        ['modern', 'story', 'scene'].forEach(t => {
            const btn = document.getElementById(`${t}-pluto-btn`);
            if (btn) {
                btn.classList.toggle('active', t === type);
            }
        });

        // Show/hide scene selector
        const sceneSelector = document.getElementById('scene-selector');
        if (sceneSelector) {
            sceneSelector.style.display = type === 'scene' ? 'block' : 'none';
        }

        // Switch Pluto instance
        switch (type) {
            case 'modern':
                this.switchToModernPluto();
                break;
            case 'story':
                this.switchToStoryPluto();
                break;
            case 'scene':
                this.switchToScenePluto(this.currentScene);
                break;
        }

        this.updateStatusDisplay();
    }

    /**
     * Switch to modern component-based Pluto
     */
    switchToModernPluto() {
        // Hide other Plutos
        this.hideAllPlutos();

        // Show modern Pluto
        const pluto = this.getPluto();
        if (pluto) {
            pluto.show();
            console.log('✅ Modern Pluto activated');
        }

        this.updateStatusElement('current-pluto-type', 'Modern');
        this.updateStatusElement('current-scene', '-');
    }

    /**
     * Switch to story-mode Pluto
     */
    switchToStoryPluto() {
        this.hideAllPlutos();

        if (!this.storyPluto) {
            this.createStoryPluto();
        }

        if (this.storyPluto) {
            this.storyPluto.show();
            console.log('✅ Story Pluto activated');
        }

        this.updateStatusElement('current-pluto-type', 'Story');
        this.updateStatusElement('current-scene', '-');
    }

    /**
     * Switch to scene-specific Pluto
     * @param {number} sceneNumber - Scene number (1-5)
     */
    switchToScenePluto(sceneNumber) {
        this.hideAllPlutos();
        this.currentScene = sceneNumber;

        let scenePluto = this.scenePlutos.get(sceneNumber);
        if (!scenePluto) {
            scenePluto = this.createScenePluto(sceneNumber);
            this.scenePlutos.set(sceneNumber, scenePluto);
        }

        if (scenePluto) {
            this.showScenePluto(scenePluto, sceneNumber);
            console.log(`✅ Scene ${sceneNumber} Pluto activated`);
        }

        this.updateStatusElement('current-pluto-type', 'Scene');
        this.updateStatusElement('current-scene', sceneNumber.toString());
    }

    /**
     * Hide all Pluto instances
     */
    hideAllPlutos() {
        // Hide modern Pluto
        const modernPluto = this.getPluto();
        if (modernPluto) {
            modernPluto.hide();
        }

        // Hide story Pluto
        if (this.storyPluto) {
            this.storyPluto.hide();
        }

        // Hide scene Plutos
        document.querySelectorAll('.scene-pluto-container').forEach(el => {
            el.style.display = 'none';
        });
    }

    /**
     * Create story mode Pluto
     */
    createStoryPluto() {
        try {
            // Create container for story Pluto
            let container = document.getElementById('story-pluto-container');
            if (!container) {
                container = document.createElement('div');
                container.id = 'story-pluto-container';
                container.style.cssText = `
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                    z-index: 1001;
                `;
                document.body.appendChild(container);
            }

            // Create Pluto instance with story mode
            this.storyPluto = new Pluto(container, { storyMode: true });
            console.log('✅ Story Pluto created');
        } catch (error) {
            console.error('❌ Failed to create story Pluto:', error);
        }
    }

    /**
     * Create scene-specific Pluto
     * @param {number} sceneNumber - Scene number
     */
    createScenePluto(sceneNumber) {
        try {
            // Create container for scene Pluto
            const container = document.createElement('div');
            container.className = 'scene-pluto-container';
            container.id = `scene-${sceneNumber}-pluto-container`;
            container.style.cssText = `
                position: absolute;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: 1002;
                display: none;
            `;
            document.body.appendChild(container);

            // Create CSS-based scene Pluto (old style)
            const scenePluto = this.createCSSScenePluto(container, sceneNumber);

            console.log(`✅ Scene ${sceneNumber} Pluto created`);
            return scenePluto;
        } catch (error) {
            console.error(`❌ Failed to create scene ${sceneNumber} Pluto:`, error);
            return null;
        }
    }

    /**
     * Create CSS-based scene Pluto (old style from story.html)
     * @param {HTMLElement} container - Container element
     * @param {number} sceneNumber - Scene number
     */
    createCSSScenePluto(container, sceneNumber) {
        // Create scene structure like in story.html
        const sceneDiv = document.createElement('div');
        sceneDiv.className = 'scene';
        sceneDiv.style.cssText = `
            position: absolute;
            left: 0;
            right: 0;
            margin: auto;
            top: 50%;
            transform: translateY(-50%);
            perspective: 2600px;
            width: 500px;
            height: 500px;
        `;

        // Create titan shadow
        const titanShadow = document.createElement('div');
        titanShadow.className = 'scene_titanShadow';

        // Create t_wrap
        const tWrap = document.createElement('div');
        tWrap.className = 't_wrap';

        // Create main titan (Pluto)
        const sceneTitan = document.createElement('div');
        sceneTitan.className = 'scene_titan';

        // Create eyes
        const eyes = document.createElement('div');
        eyes.className = 'eyes';

        const eyeLeft = document.createElement('div');
        eyeLeft.className = 'eye eye--left';

        const eyeRight = document.createElement('div');
        eyeRight.className = 'eye eye--right';

        eyes.appendChild(eyeLeft);
        eyes.appendChild(eyeRight);

        // Create mouth (for some scenes)
        const mouth = document.createElement('div');
        mouth.className = 'mouth';

        // Assemble structure
        sceneTitan.appendChild(eyes);
        sceneTitan.appendChild(mouth);
        tWrap.appendChild(sceneTitan);
        sceneDiv.appendChild(titanShadow);
        sceneDiv.appendChild(tWrap);
        container.appendChild(sceneDiv);

        // Load scene-specific CSS
        this.loadSceneCSS(sceneNumber);

        return {
            container: container,
            scene: sceneDiv,
            titan: sceneTitan,
            eyes: eyes,
            mouth: mouth,
            show: () => { container.style.display = 'block'; },
            hide: () => { container.style.display = 'none'; }
        };
    }

    /**
     * Load scene-specific CSS
     * @param {number} sceneNumber - Scene number
     */
    loadSceneCSS(sceneNumber) {
        const sceneNames = {
            1: 'space',
            2: 'lighthouse',
            3: 'factory',
            4: 'journey',
            5: 'final'
        };

        const sceneName = sceneNames[sceneNumber];
        if (!sceneName) return;

        const cssId = `scene-${sceneName}-css`;
        if (document.getElementById(cssId)) return; // Already loaded

        const link = document.createElement('link');
        link.id = cssId;
        link.rel = 'stylesheet';
        link.href = `css/story/scene-${sceneName}.css`;
        document.head.appendChild(link);

        console.log(`✅ Scene ${sceneName} CSS loaded`);
    }

    /**
     * Show scene Pluto with scene-specific styling
     * @param {Object} scenePluto - Scene Pluto object
     * @param {number} sceneNumber - Scene number
     */
    showScenePluto(scenePluto, sceneNumber) {
        if (!scenePluto) return;

        scenePluto.show();

        // Apply scene-specific class
        const sceneNames = {
            1: 'scene-space',
            2: 'scene-lighthouse',
            3: 'scene-factory',
            4: 'scene-journey',
            5: 'scene-final'
        };

        const sceneName = sceneNames[sceneNumber];
        if (sceneName) {
            scenePluto.container.className += ` ${sceneName}`;
        }
    }

    /**
     * Switch to specific scene
     * @param {number} sceneNumber - Scene number (1-5)
     */
    switchScene(sceneNumber) {
        if (this.currentPlutoType !== 'scene') {
            this.switchPlutoType('scene');
        }
        this.switchToScenePluto(sceneNumber);
    }

    /**
     * Update status display element
     * @param {string} elementId - Element ID
     * @param {string} value - New value
     */
    updateStatusElement(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = value;
        }
    }

    /**
     * Test Pluto mood with new base system
     * @param {string} mood - Mood to test
     */
    testPlutoMood(mood) {
        const pluto = this.getPluto();
        if (!pluto) {
            console.warn('🧪 Pluto not available for mood test');
            this.showAnimationIndicator('⚠️ Pluto not ready');
            return false;
        }

        console.log(`🧪 Testing Pluto mood: ${mood}`);
        const success = pluto.setMood(mood);

        if (success) {
            this.currentMood = mood;
            this.updateStatusDisplay();
            this.updateActiveButtons();
            this.showAnimationIndicator(`Mood: ${mood.toUpperCase()}`);
        } else {
            this.showAnimationIndicator(`❌ Mood ${mood} failed`);
        }

        return success;
    }

    /**
     * Test Pluto animation with new base system
     * @param {string} animation - Animation to test
     */
    testPlutoAnimation(animation) {
        const pluto = this.getPluto();
        if (!pluto) {
            console.warn('🧪 Pluto not available for animation test');
            this.showAnimationIndicator('⚠️ Pluto not ready');
            return false;
        }

        console.log(`🧪 Testing Pluto animation: ${animation}`);
        const success = pluto.setAnimation(animation);

        if (success) {
            this.currentAnimation = animation;
            this.updateStatusDisplay();
            this.updateActiveButtons();
            this.showAnimationIndicator(`Animation: ${animation.toUpperCase()}`);
        } else {
            this.showAnimationIndicator(`❌ Animation ${animation} locked or failed`);
        }

        return success;
    }

    /**
     * Test Pluto skin with new base system
     * @param {string} skin - Skin to test
     */
    testPlutoSkin(skin) {
        const pluto = this.getPluto();
        if (!pluto) {
            console.warn('🧪 Pluto not available for skin test');
            this.showAnimationIndicator('⚠️ Pluto not ready');
            return false;
        }

        console.log(`🧪 Testing Pluto skin: ${skin}`);
        const success = pluto.applySkin(skin);

        if (success) {
            this.currentSkin = skin;
            this.updateStatusDisplay();
            this.updateActiveButtons();
            this.showAnimationIndicator(`Skin: ${skin.toUpperCase()}`);
        } else {
            this.showAnimationIndicator(`❌ Skin ${skin} locked or failed`);
        }

        return success;
    }

    /**
     * Test level completion
     * @param {number} level - Level to complete
     */
    testLevel(level) {
        return testLevelComplete(level);
    }

    /**
     * Show progression debug
     */
    progressionDebug() {
        return showProgressionDebug();
    }

    /**
     * Show reward notification
     */
    showRewardNotification() {
        if (window.testRewardNotification) {
            return window.testRewardNotification();
        }
    }

    /**
     * Show error display
     */
    showErrorDisplay() {
        if (window.testErrorDisplay) {
            return window.testErrorDisplay();
        }
    }

    /**
     * Clear template cache
     */
    clearTemplateCache() {
        if (window.templateManager) {
            window.templateManager.clearCache();
            console.log('🗑️ Template cache cleared!');
            this.showAnimationIndicator('🗑️ Cache cleared');
        }
    }

    /**
     * Update animation buttons based on available animations
     */
    updateAnimationButtons() {
        const pluto = this.getPluto();
        if (!pluto || !pluto.getAvailableAnimations) return;

        const animationGrid = document.querySelector('#pluto-test-panel .test-section:nth-child(3) .button-grid');
        if (!animationGrid) return;

        const availableAnimations = pluto.getAvailableAnimations();

        // Clear existing buttons
        animationGrid.innerHTML = '';

        // Create buttons for each available animation
        availableAnimations.forEach(anim => {
            const button = document.createElement('button');
            button.className = 'test-btn';
            button.onclick = () => this.testPlutoAnimation(anim.id);

            // Add emoji based on animation type
            let emoji = '⚡';
            if (anim.id.includes('orbit') || anim.id.includes('fly')) emoji = '🌍';
            else if (anim.id.includes('dance') || anim.id.includes('spiral')) emoji = '🌀';
            else if (anim.id.includes('cute') || anim.id.includes('wiggle')) emoji = '💖';
            else if (anim.id.includes('power') || anim.id.includes('burst')) emoji = '💥';
            else if (anim.id.includes('victory')) emoji = '🏆';
            else if (anim.id.includes('shake')) emoji = '😰';
            else if (anim.id.includes('float')) emoji = '☁️';
            else if (anim.id.includes('pulse')) emoji = '💫';
            else if (anim.id.includes('bounce')) emoji = '🏀';

            button.innerHTML = `${emoji} ${anim.name}`;

            // Style active animation
            if (anim.isActive) {
                button.style.background = 'linear-gradient(45deg, #4ecdc4, #44a08d)';
                button.style.color = '#fff';
            }

            // Style locked animations
            if (!anim.unlocked && !window.gameManager?.pluto?.storyMode) {
                button.style.opacity = '0.5';
                button.innerHTML += ' 🔒';
            }

            animationGrid.appendChild(button);
        });
    }

    /**
     * Add animation quick test menu
     */
    addAnimationQuickMenu() {
        const quickMenu = document.createElement('div');
        quickMenu.id = 'animation-quick-menu';
        quickMenu.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.8);
            padding: 10px;
            border-radius: 10px;
            display: none;
            z-index: 10001;
        `;

        quickMenu.innerHTML = `
            <div style="color: #fff; margin-bottom: 10px; font-size: 12px;">🎮 Quick Animation Test</div>
            <button onclick="plutoTestPanel.playRandomAnimation()" style="
                background: linear-gradient(45deg, #667eea, #764ba2);
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 5px;
                cursor: pointer;
                font-size: 11px;
                margin: 2px;
            ">🎲 Random Animation</button>
            <button onclick="plutoTestPanel.unlockAllAnimations()" style="
                background: linear-gradient(45deg, #f093fb, #f5576c);
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 5px;
                cursor: pointer;
                font-size: 11px;
                margin: 2px;
            ">🔓 Unlock All</button>
        `;

        document.body.appendChild(quickMenu);
    }

    /**
     * Play random animation
     */
    playRandomAnimation() {
        const pluto = this.getPluto();
        if (pluto && pluto.playRandomAnimation) {
            pluto.playRandomAnimation();
            this.showAnimationIndicator('🎲 Random Animation!');
            this.updateStatusDisplay();
            this.updateActiveButtons();
        }
    }

    /**
     * Unlock all animations for testing
     */
    unlockAllAnimations() {
        const pluto = this.getPluto();
        if (!pluto || !pluto.availableAnimations) return;

        Object.keys(pluto.availableAnimations).forEach(animId => {
            pluto.unlockAnimation(animId);
        });

        this.showAnimationIndicator('🔓 All Animations Unlocked!');
        this.updateAnimationButtons();
    }

    /**
     * Switch between menu and game contexts
     * @param {string} context - 'menu' or 'game'
     */
    switchContext(context) {
        console.log(`🔄 Switching to ${context} context...`);
        this.currentContext = context;

        const pluto = this.getPluto();
        if (pluto && pluto.element) {
            // Update Pluto's context
            pluto.element.dataset.context = context;

            // Update position based on context
            if (context === 'menu') {
                // Move to left side for menu
                pluto.element.style.left = '80px';
                pluto.element.style.top = '50%';
                pluto.element.style.transform = 'translateY(-50%)';
            } else if (context === 'game') {
                // Move to center for game
                pluto.element.style.left = '50%';
                pluto.element.style.top = '50%';
                pluto.element.style.transform = 'translate(-50%, -50%)';
            }

            // Reset to idle animation for new context
            pluto.setAnimation('idle');
            this.currentAnimation = 'idle';
        }

        // Update UI
        this.updateContextButtons();
        this.updateAnimationSections();
        this.updateStatusDisplay();
        this.updateActiveButtons();

        this.showAnimationIndicator(`Context: ${context.toUpperCase()}`);
    }

    /**
     * Update context buttons visual state
     */
    updateContextButtons() {
        const menuBtn = document.getElementById('menu-context-btn');
        const gameBtn = document.getElementById('game-context-btn');

        if (menuBtn && gameBtn) {
            menuBtn.classList.toggle('active', this.currentContext === 'menu');
            gameBtn.classList.toggle('active', this.currentContext === 'game');
        }
    }

    /**
     * Show/hide animation sections based on context
     */
    updateAnimationSections() {
        const menuAnimations = document.querySelector('.menu-animations');
        const gameAnimations = document.querySelector('.game-animations');

        if (menuAnimations && gameAnimations) {
            if (this.currentContext === 'menu') {
                menuAnimations.style.display = 'block';
                gameAnimations.style.display = 'none';
            } else {
                menuAnimations.style.display = 'none';
                gameAnimations.style.display = 'block';
            }
        }
    }

    /**
     * Update all active button states
     */
    updateActiveButtons() {
        // Update context buttons
        this.updateContextButtons();

        // Update skin buttons
        document.querySelectorAll('.skin-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.skin === this.currentSkin);
        });

        // Update mood buttons
        document.querySelectorAll('.mood-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mood === this.currentMood);
        });

        // Update animation buttons
        document.querySelectorAll('.anim-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.animation === this.currentAnimation);
        });
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
        if (window.plutoTestPanel) {
            window.plutoTestPanel.showAnimationIndicator('⚠️ Pluto not ready');
        }
        return;
    }

    console.log('🧪 Resetting Pluto to default state (New Base System)');

    // Reset to default values
    pluto.applySkin('default');
    pluto.setMood('neutral');
    pluto.setAnimation('idle');
    pluto.show();

    // Reset context to menu
    if (pluto.element) {
        pluto.element.dataset.context = 'menu';
        // Reset position to menu position
        pluto.element.style.left = '80px';
        pluto.element.style.top = '50%';
        pluto.element.style.transform = 'translateY(-50%)';
    }

    // Update test panel state
    if (window.plutoTestPanel) {
        window.plutoTestPanel.currentSkin = 'default';
        window.plutoTestPanel.currentMood = 'neutral';
        window.plutoTestPanel.currentAnimation = 'idle';
        window.plutoTestPanel.currentContext = 'menu';

        window.plutoTestPanel.updateStatusDisplay();
        window.plutoTestPanel.updateActiveButtons();
        window.plutoTestPanel.updateAnimationSections();
        window.plutoTestPanel.showAnimationIndicator('🔄 Reset to Menu Default');
    }
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

    // Template test functions
    window.testRewardNotification = async function () {
        if (window.gameManager && window.gameManager.showRewardNotification) {
            const testReward = {
                type: 'skin',
                name: 'Test Golden Skin',
                description: 'Bu bir template testi! ✨'
            };
            await window.gameManager.showRewardNotification(testReward);
            console.log('🎉 Template reward notification test completed!');
        } else {
            console.warn('❌ GameManager not available for reward test');
        }
    };

    window.testErrorDisplay = async function () {
        if (window.templateManager) {
            try {
                const errorElement = await window.templateManager.createElement('error-display', {
                    errorTitle: 'Test Error',
                    errorMessage: 'Bu bir template test hatası!',
                    errorDetails: 'Template sistemi başarıyla çalışıyor.'
                });

                document.body.appendChild(errorElement);

                // 3 saniye sonra kaldır
                setTimeout(() => {
                    if (errorElement.parentNode) {
                        errorElement.parentNode.removeChild(errorElement);
                    }
                }, 3000);

                console.log('⚠️ Template error display test completed!');
            } catch (error) {
                console.error('❌ Error template test failed:', error);
            }
        } else {
            console.warn('❌ TemplateManager not available');
        }
    };

    window.showTemplateStats = function () {
        if (window.templateManager) {
            const stats = window.templateManager.getCacheStats();
            console.log('📈 Template Cache Stats:', stats);
            alert(`Template Cache:\n\nSize: ${stats.cacheSize}\nCached: ${stats.cachedTemplates.join(', ')}`);
        } else {
            console.warn('❌ TemplateManager not available');
        }
    };

    window.clearTemplateCache = function () {
        if (window.templateManager) {
            window.templateManager.clearCache();
            console.log('🗑️ Template cache cleared!');
            alert('Template cache temizlendi! 🗑️');
        } else {
            console.warn('❌ TemplateManager not available');
        }
    };

    // New base system instance
    window.plutoTestPanel = new PlutoTestPanelController();

    // Direct method calls to avoid recursion
    window.testPlutoMoodWrapper = window.testPlutoMood;
    window.testPlutoAnimationWrapper = window.testPlutoAnimation;
    window.testPlutoSkinWrapper = window.testPlutoSkin;

    // Override with new wrapper functions
    window.testPlutoMood = (mood) => window.plutoTestPanel.testPlutoMood(mood);
    window.testPlutoAnimation = (anim) => window.plutoTestPanel.testPlutoAnimation(anim);
    window.testPlutoSkin = (skin) => window.plutoTestPanel.testPlutoSkin(skin);
    window.testLevel = (level) => window.plutoTestPanel.testLevel(level);
    window.progressionDebug = () => window.plutoTestPanel.progressionDebug();
    window.showRewardNotification = () => window.plutoTestPanel.showRewardNotification();
    window.showErrorDisplay = () => window.plutoTestPanel.showErrorDisplay();
    window.clearTemplateCache = () => window.plutoTestPanel.clearTemplateCache();
}

console.log('🧪 Pluto Test Panel Controller loaded! (Clean New Base System - Database Organized)'); 
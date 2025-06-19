// File: js/core/GameManager.js

import { Pluto } from '../components/Pluto.js';
import { playerProgression } from './PlayerProgression.js';
import { templateManager } from './TemplateManager.js';

export class GameManager {
    constructor() {
        this.gameState = 'LOADING'; // LOADING, MENU, PLAYING, STORY, PAUSED
        this.pluto = null;
        this.levelRewards = null; // Will hold data from JSON
        this.gameContainer = null;
        this.phaserGame = null;
        this.currentLevel = 1;
        this.activeListeners = []; // To manage event listeners and prevent duplicates

        // Initialize performance tracking
        this.performanceMetrics = {
            startTime: Date.now(),
            levelsCompleted: 0,
            totalScore: 0
        };

        console.log('GameManager: Initialized');
    }

    // Main initialization method
    async initialize() {
        console.log('GameManager: Starting initialization...');

        try {
            // Update state
            this.gameState = 'LOADING';

            // Load external game data
            await this.loadGameData();

            // Initialize DOM elements
            this.setupGameContainer();

            // Setup global event listeners
            this.setupEventListeners();

            // Preload skin CSS files for better performance
            await this.preloadAvailableSkins();

            // Preload commonly used templates
            await this.preloadTemplates();

            // Initialize Phaser game (if needed)
            await this.initializePhaserGame();

            // Transition to menu state
            this.setState('MENU');

            console.log('GameManager: Initialization complete');

            // Dispatch initialization complete event
            window.dispatchEvent(new CustomEvent('gameManagerReady'));

        } catch (error) {
            console.error('GameManager: Initialization failed', error);
            this.handleInitializationError(error);
        }
    }

    // A reusable fetch utility with timeout and retry logic
    async fetchWithTimeout(url, options = {}, retries = 3, timeout = 5000) {
        for (let i = 0; i < retries; i++) {
            try {
                const controller = new AbortController();
                const id = setTimeout(() => controller.abort(), timeout);

                const response = await fetch(url, {
                    ...options,
                    signal: controller.signal
                });

                clearTimeout(id);

                if (!response.ok) {
                    throw new Error(`Request failed with status ${response.status}`);
                }
                return response;

            } catch (error) {
                if (error.name === 'AbortError') {
                    console.error(`GameManager: fetch timed out for ${url} (attempt ${i + 1})`);
                } else {
                    console.error(`GameManager: fetch failed for ${url}:`, error.message, `(attempt ${i + 1})`);
                }
                if (i === retries - 1) throw new Error(`Failed to fetch ${url} after ${retries} attempts.`);
            }
        }
    }

    // Load external game data files
    async loadGameData() {
        console.log('GameManager: Loading game data...');

        try {
            // Load level rewards data with timeout
            const rewardsResponse = await this.fetchWithTimeout('data/level-rewards.json');
            this.levelRewards = await rewardsResponse.json();
            console.log('GameManager: Level rewards loaded', this.levelRewards);

            // Load Pluto speeches with timeout (optional)
            try {
                const speechResponse = await this.fetchWithTimeout('data/pluto-speeches.json');
                this.plutoSpeeches = await speechResponse.json();
                console.log('GameManager: Pluto speeches loaded');
            } catch (speechError) {
                console.warn('GameManager: Failed to load Pluto speeches, will proceed without them.', speechError.message);
            }

        } catch (error) {
            console.error('GameManager: Failed to load critical game data. Using defaults.', error.message);
            // Initialize with empty data to allow the game to continue
            this.levelRewards = {};
            this.plutoSpeeches = {};
        }
    }

    // Setup the main game container
    setupGameContainer() {
        this.gameContainer = document.getElementById('game-container');
        if (!this.gameContainer) {
            console.error('GameManager: game-container element not found');
            throw new Error('Required DOM element not found');
        }

        console.log('GameManager: Game container ready');
    }

    // Initialize Pluto component
    async initializePluto() {
        try {
            this.pluto = new Pluto(this.gameContainer);

            // Wait for async initialization to complete
            await this.pluto.initialized;

            console.log('GameManager: Pluto initialized successfully');

            // Dispatch Pluto ready event
            window.dispatchEvent(new CustomEvent('plutoReady', {
                detail: { pluto: this.pluto }
            }));

        } catch (error) {
            console.error('GameManager: Failed to initialize Pluto', error);
            throw error;
        }
    }

    // Initialize the Phaser game instance
    async initializePhaserGame() {
        if (this.phaserGame) {
            console.warn('GameManager: Phaser game already initialized.');
            return;
        }

        console.log('GameManager: Initializing Phaser game...');

        // Wait for Phaser to be available on the window
        await new Promise(resolve => {
            const interval = setInterval(() => {
                if (window.Phaser) {
                    clearInterval(interval);
                    resolve();
                }
            }, 100);
        });

        const config = {
            type: window.Phaser.AUTO,
            width: window.innerWidth,
            height: window.innerHeight,
            parent: 'phaser-game',
            scene: [], // Scenes will be added dynamically
            scale: {
                mode: window.Phaser.Scale.RESIZE,
                autoCenter: window.Phaser.Scale.CENTER_BOTH
            },
            backgroundColor: '#000000',
            dom: {
                createContainer: true
            }
        };

        this.phaserGame = new window.Phaser.Game(config);
        window.phaserGame = this.phaserGame; // For global access if needed

        console.log('GameManager: Phaser game instance created.');

        // You can add scenes dynamically here if needed, e.g.,
        // this.phaserGame.scene.add('BootScene', BootScene);
        // this.phaserGame.scene.start('BootScene');
    }

    // Managed event listener to prevent duplicates
    _managedEventListener(target, type, listener) {
        // First, remove any existing listener of the same type to avoid duplicates
        this.cleanupEventListeners(type);

        const newListener = { target, type, listener };
        this.activeListeners.push(newListener);
        target.addEventListener(type, listener);
    }

    // Setup global event listeners
    setupEventListeners() {
        // Clean up existing listeners before adding new ones to prevent accumulation
        this.cleanupEventListeners();

        // Listen for level completion events
        this._managedEventListener(window, 'levelComplete', (event) => {
            this.handleLevelComplete(event.detail);
        });

        // Listen for game state changes
        this._managedEventListener(window, 'gameStateChange', (event) => {
            this.handleGameStateChange(event.detail);
        });

        // Listen for player progression events
        this._managedEventListener(window, 'itemUnlocked', (event) => {
            this.handleItemUnlocked(event.detail);
        });

        // Listen for score updates
        this._managedEventListener(window, 'scoreUpdated', (event) => {
            this.handleScoreUpdate(event.detail);
        });

        // Listen for Phaser game events (if Phaser is used)
        this._managedEventListener(window, 'phaserGameReady', (event) => {
            this.handlePhaserGameReady(event.detail);
        });

        // Listen for menu interactions
        this._managedEventListener(window, 'menuAction', (event) => {
            this.handleMenuAction(event.detail);
        });

        // Global error handling
        this._managedEventListener(window, 'error', (event) => {
            this.handleGlobalError(event);
        });

        console.log('GameManager: Event listeners setup complete');
    }

    // Cleanup specific or all event listeners
    cleanupEventListeners(type = null) {
        if (!this.activeListeners.length) return;

        const listenersToKeep = [];
        this.activeListeners.forEach(listener => {
            if (!type || listener.type === type) {
                listener.target.removeEventListener(listener.type, listener.listener);
            } else {
                listenersToKeep.push(listener);
            }
        });

        this.activeListeners = listenersToKeep;
    }

    // Handle level completion
    handleLevelComplete(details) {
        const { levelId, score, achievements } = details || {};
        console.log(`GameManager: Level ${levelId} completed with score ${score}`);

        // Update performance metrics
        this.performanceMetrics.levelsCompleted++;
        this.performanceMetrics.totalScore += score || 0;

        // Update player progression
        playerProgression.updateLevelProgress(levelId);
        if (score) {
            playerProgression.addScore(score);
        }

        // Check for level rewards
        const reward = this.levelRewards[levelId];
        if (reward) {
            console.log(`GameManager: Level ${levelId} has reward:`, reward);
            const unlocked = playerProgression.unlock(reward.type, reward.id);

            if (unlocked) {
                // Show reward notification
                this.showRewardNotification(reward);

                // Make Pluto celebrate
                if (this.pluto) {
                    this.pluto.celebrate();
                }
            }
        }

        // Advance to next level
        this.currentLevel = Math.max(this.currentLevel, (levelId || 0) + 1);

        // Dispatch level complete handled event
        window.dispatchEvent(new CustomEvent('levelCompleteHandled', {
            detail: { levelId, reward, nextLevel: this.currentLevel }
        }));
    }

    // Example function called when a level is completed
    completeLevel(levelId) {
        console.log(`GameManager: Level ${levelId} completed! Checking for rewards.`);

        const reward = this.levelRewards[levelId];
        if (reward) {
            playerProgression.unlock(reward.type, reward.id);
        }

        // Dispatch a global event for other systems to listen to
        window.dispatchEvent(new CustomEvent('levelComplete', { detail: { levelId } }));
    }

    // Handle game state changes
    handleGameStateChange(details) {
        const { newState, previousState } = details;
        this.setState(newState, previousState);
    }

    // Handle item unlocks
    handleItemUnlocked(details) {
        const { type, id } = details;
        console.log(`GameManager: Item unlocked - ${type}: ${id}`);

        // Additional logic for specific unlock types
        switch (type) {
            case 'skin':
                // Could trigger special effects or notifications
                break;
            case 'animation':
                // Could showcase the new animation
                break;
            case 'mood':
                // Could demonstrate the new mood
                break;
        }
    }

    // Handle score updates
    handleScoreUpdate(details) {
        const { totalScore, addedPoints } = details;
        this.performanceMetrics.totalScore = totalScore;

        // Could trigger score-based rewards or achievements
        this.checkScoreBasedRewards(totalScore);
    }

    // Handle Phaser game ready
    handlePhaserGameReady(details) {
        this.phaserGame = details.game;
        console.log('GameManager: Phaser game connected');
    }

    // Handle menu actions
    handleMenuAction(details) {
        const { action, data } = details;

        switch (action) {
            case 'startGame':
                this.startGame();
                break;
            case 'openStory':
                this.openStory();
                break;
            case 'openSettings':
                this.openSettings();
                break;
            case 'resetProgress':
                this.resetProgress();
                break;
            default:
                console.log(`GameManager: Unknown menu action: ${action}`, data);
        }
    }

    // Handle global errors
    handleGlobalError(event) {
        console.error('GameManager: Global error caught', event.error);
        // Could implement error reporting or recovery logic
    }

    // Set game state
    setState(newState, previousState = null) {
        if (this.gameState === newState) return;

        console.log(`GameManager: State changing from ${this.gameState} to ${newState}`);
        const oldState = this.gameState;
        this.gameState = newState;

        // Perform actions based on new state
        switch (newState) {
            case 'MENU':
                this.showMenu();
                break;
            case 'PLAYING':
                this.startGameplay();
                break;
            case 'STORY':
                this.startStoryMode();
                break;
            case 'PAUSED':
                // Handle pause logic
                break;
        }

        // Dispatch state change event
        window.dispatchEvent(new CustomEvent('gameStateChanged', {
            detail: { from: oldState, to: newState }
        }));
    }

    // Game flow methods
    startGame() {
        this.setState('PLAYING', this.gameState);
    }

    openStory() {
        window.location.href = 'index.html';
    }

    openSettings() {
        console.log('GameManager: Opening settings...');
        // Could open settings modal or page
    }

    resetProgress() {
        console.log('GameManager: Resetting progress...');
        playerProgression.reset();
        this.currentLevel = 1;

        // Reset Pluto to default state
        if (this.pluto) {
            this.pluto.applySkin('default');
            this.pluto.setMood('neutral');
            this.pluto.setAnimation('idle');
        }
    }

    // UI state methods
    hideAllUI() {
        // Example: hide menu, settings, etc.
    }

    showMenu() {
        // Logic to display the main menu
        console.log("GameManager: Showing main menu.");
    }

    async startGameplay() {
        if (!this.pluto) {
            await this.initializePluto();
        }
        this.hideAllUI();
        // Additional logic to start the game
        console.log("GameManager: Starting gameplay.");
    }

    startStoryMode() {
        this.hideAllUI();
        // Logic to start story mode
        console.log("GameManager: Starting story mode.");
    }

    pauseGame() {
        if (this.gameState !== 'PLAYING') return;
        // Logic to pause the game
        console.log("GameManager: Pausing game.");
    }

    // Utility methods
    /**
     * Dynamically load skin CSS file on demand
     * @param {string} skinName - Name of the skin to load
     * @returns {Promise<void>}
     */
    async loadSkinCSS(skinName) {
        const skinId = `skin-css-${skinName}`;

        // Don't reload if it's already in the DOM
        if (document.getElementById(skinId)) {
            console.log(`GameManager: Skin CSS already loaded: ${skinName}`);
            return;
        }

        try {
            // Create a new link element
            const link = document.createElement('link');
            link.id = skinId;
            link.rel = 'stylesheet';
            link.href = `css/skins/${skinName}.css`;

            // Append to head and wait for it to load
            document.head.appendChild(link);

            await new Promise((resolve, reject) => {
                link.onload = () => {
                    console.log(`GameManager: Skin CSS loaded successfully: ${skinName}`);
                    resolve();
                };
                link.onerror = () => {
                    console.warn(`GameManager: Failed to load skin CSS: ${skinName}`);
                    // Remove the failed link element
                    document.head.removeChild(link);
                    reject(new Error(`Failed to load skin CSS: ${skinName}`));
                };
            });
        } catch (error) {
            console.error(`GameManager: Error loading skin CSS for ${skinName}:`, error);
            throw error;
        }
    }

    /**
     * Unload skin CSS file to free up memory
     * @param {string} skinName - Name of the skin to unload
     */
    unloadSkinCSS(skinName) {
        const skinId = `skin-css-${skinName}`;
        const linkElement = document.getElementById(skinId);

        if (linkElement) {
            document.head.removeChild(linkElement);
            console.log(`GameManager: Skin CSS unloaded: ${skinName}`);
        }
    }

    /**
     * Preload multiple skin CSS files for better performance
     * @param {string[]} skinNames - Array of skin names to preload
     */
    async preloadSkinCSS(skinNames) {
        console.log('GameManager: Preloading skin CSS files...');
        const loadPromises = skinNames.map(skinName =>
            this.loadSkinCSS(skinName).catch(error =>
                console.warn(`Failed to preload skin: ${skinName}`, error)
            )
        );

        await Promise.allSettled(loadPromises);
        console.log('GameManager: Skin CSS preloading completed');
    }

    /**
     * Preload available skins based on progression data
     */
    async preloadAvailableSkins() {
        // Get list of known skins from level rewards
        const knownSkins = new Set(['golden', 'cyborg']); // Add more as you create them

        // Also check what's already unlocked
        const unlockedSkins = playerProgression.getUnlockedItems('skin');
        unlockedSkins.forEach(skin => {
            if (skin !== 'default') knownSkins.add(skin);
        });

        // Convert to array and preload
        const skinsToPreload = Array.from(knownSkins);
        if (skinsToPreload.length > 0) {
            await this.preloadSkinCSS(skinsToPreload);
        }
    }

    /**
     * Preload commonly used templates
     */
    async preloadTemplates() {
        await templateManager.preloadTemplates([
            'pluto-entity',
            'reward-notification',
            'error-display',
            'test-panel'
        ]);
    }

    async showRewardNotification(reward) {
        console.log(`GameManager: Showing reward notification for ${reward.name}`);

        try {
            // Use template system for reward notification
            const notification = await templateManager.createElement('reward-notification', {
                rewardType: reward.type.toUpperCase(),
                rewardName: reward.name,
                rewardDescription: reward.description || 'New content available!'
            });

            document.body.appendChild(notification);

            // Auto-remove after 5 seconds
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 5000);
        } catch (error) {
            console.error('GameManager: Failed to show reward notification using template, falling back:', error);
            this._showRewardNotificationFallback(reward);
        }
    }

    // Fallback method for reward notifications
    _showRewardNotificationFallback(reward) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(45deg, #4ecdc4, #44a08d);
            color: white;
            padding: 20px;
            border-radius: 10px;
            font-family: "Press Start 2P", monospace;
            font-size: 12px;
            z-index: 10000;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            animation: slideInRight 0.5s ease-out;
        `;

        notification.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 5px;">🎉 UNLOCKED!</div>
            <div>${reward.name}</div>
            <div style="font-size: 10px; opacity: 0.9; margin-top: 5px;">${reward.description}</div>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
    }

    checkScoreBasedRewards(totalScore) {
        // Could implement score-based unlocks
        const scoreThresholds = {
            1000: { type: 'achievement', id: 'score_1k' },
            5000: { type: 'achievement', id: 'score_5k' },
            10000: { type: 'achievement', id: 'score_10k' }
        };

        // Check and award score-based rewards
        Object.entries(scoreThresholds).forEach(([threshold, reward]) => {
            if (totalScore >= parseInt(threshold)) {
                // Award achievement if not already unlocked
                playerProgression.addAchievementPoints(100);
            }
        });
    }

    handleInitializationError(error) {
        console.error('GameManager: Initialization failed, showing error state');

        // Show error message to user
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #e74c3c;
            color: white;
            padding: 20px;
            border-radius: 10px;
            font-family: "Press Start 2P", monospace;
            text-align: center;
            z-index: 10001;
        `;
        errorDiv.innerHTML = `
            <div>⚠️ INITIALIZATION ERROR</div>
            <div style="font-size: 10px; margin-top: 10px;">Please refresh the page</div>
        `;

        document.body.appendChild(errorDiv);
    }

    // Get current game status
    getStatus() {
        return {
            state: this.gameState,
            currentLevel: this.currentLevel,
            performance: { ...this.performanceMetrics },
            plutoReady: !!this.pluto,
            dataLoaded: !!this.levelRewards
        };
    }

    // Cleanup method
    destroy() {
        this.cleanupEventListeners();
        if (this.phaserGame) {
            this.phaserGame.destroy(true);
        }
        console.log('GameManager: Instance destroyed');
    }
}

// Also attach to window for compatibility
if (typeof window !== 'undefined') {
    window.GameManager = GameManager;
} 
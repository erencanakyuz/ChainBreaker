// File: js/core/GameManager.js

import { Pluto } from '../components/Pluto.js';
import { playerProgression } from './PlayerProgression.js';

export class GameManager {
    constructor() {
        this.gameState = 'LOADING'; // LOADING, MENU, PLAYING, STORY, PAUSED
        this.pluto = null;
        this.levelRewards = null; // Will hold data from JSON
        this.gameContainer = null;
        this.phaserGame = null;
        this.currentLevel = 1;

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

            // Initialize Pluto
            this.initializePluto();

            // Setup global event listeners
            this.setupEventListeners();

            // Initialize Phaser game (if needed)
            // await this.initializePhaserGame();

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

    // Load external game data files
    async loadGameData() {
        console.log('GameManager: Loading game data...');

        try {
            // Load level rewards data
            const rewardsResponse = await fetch('data/level-rewards.json');
            if (!rewardsResponse.ok) {
                throw new Error(`Failed to load level rewards: ${rewardsResponse.status}`);
            }
            this.levelRewards = await rewardsResponse.json();
            console.log('GameManager: Level rewards loaded', this.levelRewards);

            // Load Pluto speeches (optional for future use)
            try {
                const speechResponse = await fetch('data/pluto-speeches.json');
                if (speechResponse.ok) {
                    this.plutoSpeeches = await speechResponse.json();
                    console.log('GameManager: Pluto speeches loaded');
                } else {
                    console.warn('GameManager: Pluto speeches not available');
                }
            } catch (speechError) {
                console.warn('GameManager: Failed to load Pluto speeches', speechError);
            }

        } catch (error) {
            console.error('GameManager: Failed to load game data', error);
            // Initialize with empty data to continue
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
    initializePluto() {
        try {
            this.pluto = new Pluto(this.gameContainer);
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

    // Setup global event listeners
    setupEventListeners() {
        // Listen for level completion events
        window.addEventListener('levelComplete', (event) => {
            this.handleLevelComplete(event.detail);
        });

        // Listen for game state changes
        window.addEventListener('gameStateChange', (event) => {
            this.handleGameStateChange(event.detail);
        });

        // Listen for player progression events
        window.addEventListener('itemUnlocked', (event) => {
            this.handleItemUnlocked(event.detail);
        });

        // Listen for score updates
        window.addEventListener('scoreUpdated', (event) => {
            this.handleScoreUpdate(event.detail);
        });

        // Listen for Phaser game events (if Phaser is used)
        window.addEventListener('phaserGameReady', (event) => {
            this.handlePhaserGameReady(event.detail);
        });

        // Listen for menu interactions
        window.addEventListener('menuAction', (event) => {
            this.handleMenuAction(event.detail);
        });

        // Global error handling
        window.addEventListener('error', (event) => {
            this.handleGlobalError(event);
        });

        console.log('GameManager: Event listeners setup complete');
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
        const oldState = previousState || this.gameState;
        this.gameState = newState;

        console.log(`GameManager: State changed from ${oldState} to ${newState}`);

        // Handle state-specific logic
        switch (newState) {
            case 'LOADING':
                this.hideAllUI();
                break;
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
                this.pauseGame();
                break;
        }

        // Dispatch state change event
        window.dispatchEvent(new CustomEvent('gameStateChanged', {
            detail: { newState, previousState: oldState }
        }));
    }

    // Game flow methods
    startGame() {
        console.log('GameManager: Starting game...');
        this.setState('PLAYING');

        // Show Pluto if hidden
        if (this.pluto) {
            this.pluto.show();
            this.pluto.setMood('happy');
            this.pluto.setAnimation('excited');
        }

        // Dispatch game start event
        window.dispatchEvent(new CustomEvent('gameStart', {
            detail: { level: this.currentLevel }
        }));
    }

    openStory() {
        console.log('GameManager: Opening story mode...');
        this.setState('STORY');

        // Navigate to story page or show story UI
        window.location.href = 'story.html';
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
        // Hide loading screen, menu, etc.
    }

    showMenu() {
        // Show main menu
        const loading = document.getElementById('loading');
        if (loading) {
            loading.style.display = 'none';
        }
    }

    startGameplay() {
        // Initialize gameplay UI and logic
    }

    startStoryMode() {
        // Initialize story mode
    }

    pauseGame() {
        // Pause current game
    }

    // Utility methods
    showRewardNotification(reward) {
        console.log(`GameManager: Showing reward notification for ${reward.name}`);

        // Create notification element (simplified)
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

        // Remove after 5 seconds
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
        console.log('GameManager: Destroying...');

        if (this.pluto) {
            this.pluto.destroy();
            this.pluto = null;
        }

        // Clean up other resources
        this.gameContainer = null;
        this.phaserGame = null;
        this.levelRewards = null;

        console.log('GameManager: Destroyed');
    }
} 
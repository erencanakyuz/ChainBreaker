// File: js/main.js
// Main entry point for ChainBreaker Pro

import { GameManager } from './core/GameManager.js';

// Global application state
let gameManager = null;

// Application initialization
async function initializeApplication() {
    console.log('🚀 ChainBreaker Pro: Starting application...');

    try {
        // Create GameManager instance
        gameManager = new GameManager();

        // Initialize the game manager
        await gameManager.initialize();

        // Make it accessible for debugging if needed
        window.gameManager = gameManager;
        window.chainBreaker = {
            version: '3.0.0',
            gameManager: gameManager,
            // Expose useful debugging methods
            debug: {
                getState: () => gameManager.getStatus(),
                completeLevel: (level) => gameManager.completeLevel(level),
                resetProgress: () => gameManager.handleMenuAction({ action: 'resetProgress' }),
                showPlutoState: () => gameManager.pluto ? gameManager.pluto.getState() : null
            }
        };

        console.log('✅ ChainBreaker Pro: Application initialized successfully');
        console.log('🎮 Debug tools available via window.chainBreaker.debug');

        // Dispatch application ready event
        window.dispatchEvent(new CustomEvent('applicationReady', {
            detail: {
                gameManager,
                version: '3.0.0',
                timestamp: Date.now()
            }
        }));

    } catch (error) {
        console.error('❌ ChainBreaker Pro: Application initialization failed', error);

        // Show fallback error UI
        showApplicationError(error);
    }
}

// Error handling for application failures
function showApplicationError(error) {
    // Remove loading screen
    const loading = document.getElementById('loading');
    if (loading) {
        loading.style.display = 'none';
    }

    // Create error display
    const errorContainer = document.createElement('div');
    errorContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        color: white;
        font-family: "Press Start 2P", monospace;
        text-align: center;
        z-index: 10000;
    `;

    errorContainer.innerHTML = `
        <div style="font-size: 24px; margin-bottom: 20px;">⚠️</div>
        <div style="font-size: 16px; margin-bottom: 10px;">INITIALIZATION ERROR</div>
        <div style="font-size: 12px; margin-bottom: 20px; max-width: 600px; line-height: 1.5;">
            The application failed to start properly. This might be due to:
        </div>
        <div style="font-size: 10px; margin-bottom: 20px; text-align: left; max-width: 400px;">
            • Network connectivity issues<br/>
            • Missing game data files<br/>
            • Browser compatibility problems<br/>
            • JavaScript execution errors
        </div>
        <button id="retry-button" style="
            background: #e74c3c;
            border: none;
            color: white;
            padding: 10px 20px;
            font-family: 'Press Start 2P', monospace;
            font-size: 10px;
            cursor: pointer;
            border-radius: 5px;
            margin: 5px;
        ">RETRY</button>
        <button id="reload-button" style="
            background: #3498db;
            border: none;
            color: white;
            padding: 10px 20px;
            font-family: 'Press Start 2P', monospace;
            font-size: 10px;
            cursor: pointer;
            border-radius: 5px;
            margin: 5px;
        ">RELOAD PAGE</button>
        <div style="font-size: 8px; margin-top: 20px; opacity: 0.7;">
            Error: ${error.message || 'Unknown error'}
        </div>
    `;

    document.body.appendChild(errorContainer);

    // Add button event listeners
    document.getElementById('retry-button').addEventListener('click', () => {
        errorContainer.remove();
        initializeApplication();
    });

    document.getElementById('reload-button').addEventListener('click', () => {
        window.location.reload();
    });
}

// Setup global event listeners for application lifecycle
function setupGlobalEventListeners() {
    // Handle page visibility changes
    document.addEventListener('visibilitychange', () => {
        if (gameManager) {
            if (document.hidden) {
                // Page is hidden - could pause game
                console.log('🔇 Page hidden - game could be paused');
            } else {
                // Page is visible - could resume game
                console.log('🔊 Page visible - game could be resumed');
            }
        }
    });

    // Handle page unload
    window.addEventListener('beforeunload', () => {
        if (gameManager) {
            console.log('🛑 Application shutting down...');
            // Could save game state or cleanup
        }
    });

    // Handle global keyboard shortcuts (for debugging)
    window.addEventListener('keydown', (event) => {
        // Only in development/debug mode
        if (window.chainBreaker && event.ctrlKey) {
            switch (event.key) {
                case '1':
                    event.preventDefault();
                    gameManager?.completeLevel(1);
                    console.log('🎮 Debug: Completed level 1');
                    break;
                case '2':
                    event.preventDefault();
                    gameManager?.completeLevel(2);
                    console.log('🎮 Debug: Completed level 2');
                    break;
                case 'r':
                    event.preventDefault();
                    gameManager?.handleMenuAction({ action: 'resetProgress' });
                    console.log('🎮 Debug: Progress reset');
                    break;
            }
        }
    });
}

// Wait for DOM to be ready before initializing
function waitForDOMReady() {
    return new Promise((resolve) => {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', resolve);
        } else {
            resolve();
        }
    });
}

// Main application startup sequence
async function startup() {
    console.log('⏳ ChainBreaker Pro: Waiting for DOM...');

    // Wait for DOM to be ready
    await waitForDOMReady();
    console.log('✅ ChainBreaker Pro: DOM ready');

    // Setup global event listeners
    setupGlobalEventListeners();
    console.log('✅ ChainBreaker Pro: Global event listeners setup');

    // Initialize the main application
    await initializeApplication();
}

// Start the application when the window loads
window.addEventListener('load', startup);

// Export for potential external access
export { gameManager, initializeApplication }; 
// story.js - Manages scene transitions and dynamic CSS loading for story.html
// Updated to use the new Pluto component system

import { Pluto } from '../components/Pluto.js';
import { playerProgression } from '../core/PlayerProgression.js';

document.addEventListener('DOMContentLoaded', () => {
    const story = new StoryManager();
    story.init();
});

class StoryManager {
    constructor() {
        this.currentScene = 1;
        this.totalScenes = 5;
        this.loadedCSS = new Set();

        // DOM Elements
        this.scenes = document.querySelectorAll('.story-scene');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.startGameBtn = document.getElementById('startGameBtn');

        // New Pluto component system
        this.pluto = null;
        this.progression = null;

        // Scene-specific Pluto configurations
        this.sceneConfigs = {
            1: { // Space Scene - Introduction
                mood: 'neutral',
                animation: 'idle',
                skin: 'default',
                position: { x: 150, y: 100 },
                message: "Welcome to my cosmic journey! 🌌"
            },
            2: { // Lighthouse Scene - Guidance
                mood: 'happy',
                animation: 'excited',
                skin: 'default',
                position: { x: 200, y: 150 },
                message: "The lighthouse guides lost travelers like me! ⚡"
            },
            3: { // Factory Scene - Transformation
                mood: 'angry',
                animation: 'spiral-dance',
                skin: 'cyborg',
                position: { x: 100, y: 200 },
                message: "Time for some serious cosmic work! 🔧"
            },
            4: { // Journey Scene - Adventure
                mood: 'excited',
                animation: 'fly-around',
                skin: 'golden',
                position: { x: 250, y: 100 },
                message: "Flying through the stars is amazing! ✨"
            },
            5: { // Final Scene - Completion
                mood: 'happy',
                animation: 'orbit-mode',
                skin: 'rainbow',
                position: { x: 200, y: 150 },
                message: "My journey is complete! Ready for new adventures! 🏆"
            }
        };
    }

    async init() {
        if (!this.scenes.length || !this.prevBtn || !this.nextBtn || !this.startGameBtn) {
            console.error('Story elements not found. Make sure story.html has the correct structure.');
            return;
        }

        // Initialize progression system for the story mode
        this.progression = playerProgression;

        // Create Pluto instance for story mode
        await this.createPlutoForStory();

        this.addEventListeners();
        this.showScene(1); // Show the first scene initially
        this.generateStars(); // Generate stars for the space scene
    }

    /**
 * Create and configure Pluto for story mode
 */
    async createPlutoForStory() {
        try {
            // Create a container for Pluto in story mode if it doesn't exist
            let plutoContainer = document.getElementById('story-pluto-container');
            if (!plutoContainer) {
                plutoContainer = document.createElement('div');
                plutoContainer.id = 'story-pluto-container';
                plutoContainer.style.cssText = `
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                    z-index: 100;
                `;
                document.body.appendChild(plutoContainer);
            }

            // Create Pluto instance with the container in story mode
            this.pluto = new Pluto(plutoContainer, { storyMode: true });
            this.pluto.show();

            console.log('🪐 Pluto created for story mode!');
        } catch (error) {
            console.error('❌ Failed to create Pluto for story:', error);
        }
    }

    /**
     * Configure Pluto for the current scene
     */
    configureScenePluto(sceneNumber) {
        if (!this.pluto) return;

        const config = this.sceneConfigs[sceneNumber];
        if (!config) return;

        try {
            // Apply scene-specific Pluto configuration
            this.pluto.applySkin(config.skin);
            this.pluto.setMood(config.mood);
            this.pluto.setAnimation(config.animation);

            // Position Pluto for the scene
            if (config.position) {
                this.pluto.setPosition(config.position.x, config.position.y);
            }

            // Add a delay before showing the message to let animations settle
            setTimeout(() => {
                if (config.message) {
                    this.showSceneMessage(config.message);
                }
            }, 1000);

            console.log(`🪐 Configured Pluto for scene ${sceneNumber}:`, config);
        } catch (error) {
            console.error(`❌ Failed to configure Pluto for scene ${sceneNumber}:`, error);
        }
    }

    /**
     * Show a message for the current scene
     */
    showSceneMessage(message) {
        // Create or update scene message display
        let messageContainer = document.getElementById('scene-message');
        if (!messageContainer) {
            messageContainer = document.createElement('div');
            messageContainer.id = 'scene-message';
            messageContainer.style.cssText = `
                position: fixed;
                bottom: 80px;
                left: 50%;
                transform: translateX(-50%);
                background: linear-gradient(45deg, #4ecdc4, #44a08d);
                color: white;
                padding: 15px 25px;
                border-radius: 10px;
                font-family: "Press Start 2P", monospace;
                font-size: 10px;
                text-align: center;
                max-width: 90%;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
                z-index: 1000;
                opacity: 0;
                transition: opacity 0.5s ease;
            `;
            document.body.appendChild(messageContainer);
        }

        messageContainer.textContent = message;
        messageContainer.style.opacity = '1';

        // Auto-hide after 4 seconds
        setTimeout(() => {
            messageContainer.style.opacity = '0';
        }, 4000);
    }

    addEventListeners() {
        this.prevBtn.addEventListener('click', () => this.previousScene());
        this.nextBtn.addEventListener('click', () => this.nextScene());
        this.startGameBtn.addEventListener('click', () => this.startGame());

        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight' || e.key === ' ') {
                if (this.nextBtn.style.display !== 'none') this.nextScene();
            } else if (e.key === 'ArrowLeft') {
                if (!this.prevBtn.disabled) this.previousScene();
            } else if (e.key === 'Enter' && this.currentScene === this.totalScenes) {
                this.startGame();
            }
        });
    }

    async showScene(sceneNumber) {
        if (sceneNumber < 1 || sceneNumber > this.totalScenes) {
            return;
        }
        this.currentScene = sceneNumber;

        // Load CSS for the current scene
        await this.loadSceneCSS(sceneNumber);

        // Hide all scenes
        this.scenes.forEach(scene => scene.classList.remove('active'));

        // Show the target scene
        const sceneElement = document.getElementById(`scene-${sceneNumber}`);
        if (sceneElement) {
            sceneElement.classList.add('active');
        }

        // Generate stars for scenes that need them
        this.generateStarsForScene(sceneNumber);

        // Configure Pluto for this scene
        this.configureScenePluto(sceneNumber);

        this.updateControls();

        // Trigger scene transition event for potential listeners
        window.dispatchEvent(new CustomEvent('storySceneChanged', {
            detail: {
                sceneNumber,
                sceneConfig: this.sceneConfigs[sceneNumber]
            }
        }));

        console.log(`📖 Showing scene ${sceneNumber}`);
    }

    updateControls() {
        this.prevBtn.disabled = this.currentScene === 1;
        this.nextBtn.style.display = this.currentScene === this.totalScenes ? 'none' : 'inline-block';
        this.startGameBtn.style.display = this.currentScene === this.totalScenes ? 'inline-block' : 'none';
    }

    async nextScene() {
        if (this.currentScene < this.totalScenes) {
            // Add transition animation for Pluto
            if (this.pluto) {
                this.pluto.setAnimation('excited');
                setTimeout(() => {
                    this.showScene(this.currentScene + 1);
                }, 500);
            } else {
                await this.showScene(this.currentScene + 1);
            }
        }
    }

    async previousScene() {
        if (this.currentScene > 1) {
            // Add transition animation for Pluto
            if (this.pluto) {
                this.pluto.setAnimation('spiral-dance');
                setTimeout(() => {
                    this.showScene(this.currentScene - 1);
                }, 500);
            } else {
                await this.showScene(this.currentScene - 1);
            }
        }
    }

    startGame() {
        // Show completion celebration before transitioning
        if (this.pluto) {
            this.pluto.setAnimation('excited');
            this.pluto.setMood('happy');
            this.showSceneMessage('Time to start the real adventure! 🚀');

            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        } else {
            window.location.href = 'index.html';
        }
    }

    async loadSceneCSS(sceneNumber) {
        const sceneMap = {
            1: 'css/story/scene-space.css',
            2: 'css/story/scene-lighthouse.css',
            3: 'css/story/scene-factory.css',
            4: 'css/story/scene-journey.css',
            5: 'css/story/scene-final.css'
        };

        // Scene 5 reuses scene 1's CSS for stars, so we handle that.
        const cssFile = sceneMap[sceneNumber];
        const cssId = `story-scene-${sceneNumber}-css`;

        if (cssFile) {
            try {
                await this.loadCSS(cssFile, cssId);

                // Preload CSS for the next scene for a smoother transition
                const nextSceneNumber = this.currentScene + 1;
                if (nextSceneNumber <= this.totalScenes) {
                    const nextCssFile = sceneMap[nextSceneNumber];
                    const nextCssId = `story-scene-${nextSceneNumber}-css`;
                    this.preloadCSS(nextCssFile, nextCssId);
                }
            } catch (error) {
                console.error(`Failed to load CSS for scene ${sceneNumber}:`, error);
            }
        }
    }

    loadCSS(url, id) {
        return new Promise((resolve, reject) => {
            if (this.loadedCSS.has(url) || document.getElementById(id)) {
                // If this exact URL has been loaded (even under a different ID, like for scene 4),
                // or if an element with this ID already exists, resolve immediately.
                if (!this.loadedCSS.has(url)) {
                    this.loadedCSS.add(url);
                }
                resolve();
                return;
            }

            const link = document.createElement('link');
            link.id = id;
            link.rel = 'stylesheet';
            link.href = url;
            link.onload = () => {
                this.loadedCSS.add(url);
                console.log(`✅ Loaded CSS: ${url}`);
                resolve();
            };
            link.onerror = (err) => {
                console.error(`❌ Failed to load CSS: ${url}`, err);
                reject(new Error(`Failed to load CSS: ${url}`));
            };
            document.head.appendChild(link);
        });
    }

    preloadCSS(url, id) {
        // Use requestIdleCallback for smarter preloading without affecting performance
        if ('requestIdleCallback' in window) {
            requestIdleCallback(() => {
                this.loadCSS(url, id).catch(err => console.warn(`Preload failed for ${url}`));
            });
        } else {
            // Fallback for older browsers
            setTimeout(() => {
                this.loadCSS(url, id).catch(err => console.warn(`Preload failed for ${url}`));
            }, 300);
        }
    }

    generateStars() {
        // Generate stars for Scene 1 (Space scene)
        this.generateStarsForScene(1);

        // Initialize enhanced effects
        this.initializeEnhancedEffects();
    }

    generateStarsForScene(sceneNumber) {
        // Scenes that need stars: 1 (space), 4 (journey), 5 (final)
        const scenesWithStars = [1, 4, 5];

        if (!scenesWithStars.includes(sceneNumber)) {
            return;
        }

        const starsContainer = document.querySelector(`#scene-${sceneNumber} .stars`);
        if (!starsContainer) return;

        // Don't regenerate if stars already exist
        if (starsContainer.children.length > 0) return;

        let starHTML = '';
        const starCount = sceneNumber === 4 ? 150 : 100; // More stars for journey scene

        for (let i = 0; i < starCount; i++) {
            const left = Math.random() * 100;
            const top = Math.random() * 100;
            const size = Math.random() * 3 + 1;
            const animationDelay = Math.random() * 3;

            starHTML += `<div class="star" style="
                left: ${left}%;
                top: ${top}%;
                width: ${size}px;
                height: ${size}px;
                animation-delay: ${animationDelay}s;
            "></div>`;
        }
        starsContainer.innerHTML = starHTML;

        console.log(`✨ Generated ${starCount} stars for scene ${sceneNumber}!`);
    }

    initializeEnhancedEffects() {
        // Add dynamic CSS variables for responsive sizing
        const root = document.documentElement;
        root.style.setProperty('--titan-size', '100px');
        root.style.setProperty('--saturn-size', '200px');
        root.style.setProperty('--saturn-ring-size', '400px');
        root.style.setProperty('--saturn-ring-width', '300px');

        console.log('✨ Enhanced space scene effects initialized!');
    }

    /**
     * Cleanup method for when leaving the story
     */
    cleanup() {
        if (this.pluto) {
            this.pluto.hide();
            this.pluto.unmount();
        }

        // Remove scene message if it exists
        const messageContainer = document.getElementById('scene-message');
        if (messageContainer) {
            messageContainer.remove();
        }

        // Remove Pluto container
        const plutoContainer = document.getElementById('story-pluto-container');
        if (plutoContainer) {
            plutoContainer.remove();
        }
    }
}

// Attach to window for debugging
if (typeof window !== 'undefined') {
    window.StoryManager = StoryManager;
} 
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
        this.messageContainer = document.getElementById('scene-message-container');

        // New Pluto component system
        this.pluto = null;
        this.progression = null;

        // Random message system
        this.randomMessageTimer = null;

        // Scene-specific Pluto configurations
        this.sceneConfigs = {
            1: { // Space Scene - Introduction
                mood: 'neutral',
                animation: 'idle',
                skin: 'default',
                position: { x: 150, y: 100 },
                message: "Welcome to my cosmic journey! 🌌",
                messageType: "space"
            },
            2: { // Lighthouse Scene - Guidance
                mood: 'happy',
                animation: 'excited',
                skin: 'default',
                position: { x: 200, y: 150 },
                message: "The lighthouse guides lost travelers like me! ⚡",
                messageType: "lighthouse"
            },
            3: { // Factory Scene - Transformation
                mood: 'angry',
                animation: 'spiral-dance',
                skin: 'cyborg',
                position: { x: 100, y: 200 },
                message: "Time for some serious cosmic work! 🔧",
                messageType: "default"
            },
            4: { // Journey Scene - Adventure
                mood: 'excited',
                animation: 'fly-around',
                skin: 'golden',
                position: { x: 250, y: 100 },
                message: "Flying through the stars is amazing! ✨",
                messageType: "journey"
            },
            5: { // Final Scene - Completion
                mood: 'happy',
                animation: 'orbit-mode',
                skin: 'rainbow',
                position: { x: 200, y: 150 },
                message: "My journey is complete! Ready for new adventures! 🏆",
                messageType: "journey"
            }
        };
    }

    async init() {
        if (!this.scenes.length || !this.prevBtn || !this.nextBtn || !this.startGameBtn) {
            console.error('Story elements not found. Make sure story.html has the correct structure.');
            return;
        }

        // Preload all scene CSS non-blockingly
        this.preloadAllSceneCSS();

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
                    this.showSceneMessage(config.message, config.messageType);
                }
            }, 1000);

            // Start random messages for this scene
            this.startRandomMessages();

            console.log(`🪐 Configured Pluto for scene ${sceneNumber}:`, config);
        } catch (error) {
            console.error(`❌ Failed to configure Pluto for scene ${sceneNumber}:`, error);
        }
    }

    /**
     * Show a pop-up message in top-left corner
     */
    showSceneMessage(message, type = 'default') {
        if (!this.messageContainer) return;

        // Clear any existing message
        this.messageContainer.classList.remove('show', 'lighthouse', 'space', 'journey');

        // Set message content
        this.messageContainer.textContent = message;

        // Add type-specific styling
        if (type !== 'default') {
            this.messageContainer.classList.add(type);
        }

        // Show with animation
        setTimeout(() => {
            this.messageContainer.classList.add('show');
        }, 100);

        // Auto-hide after 5 seconds with smooth animation
        setTimeout(() => {
            this.messageContainer.classList.remove('show');
        }, 5000);
    }

    /**
     * Show random pop-up messages during scenes
     */
    showRandomMessage() {
        const messages = [
            { text: "The lighthouse guides lost travelers like me! ⚡", type: "lighthouse" },
            { text: "Saturn's rings hold ancient secrets! 🪐", type: "space" },
            { text: "My cosmic journey continues! ✨", type: "journey" },
            { text: "Breaking chains, one ring at a time! 💎", type: "default" },
            { text: "The universe whispers its mysteries! 🌌", type: "space" },
            { text: "Every star tells a story! ⭐", type: "journey" },
            { text: "Factory of dreams and metal! 🔧", type: "default" },
            { text: "Flying through infinity! 🚀", type: "space" },
            { text: "The beacon calls to wanderers! 💫", type: "lighthouse" }
        ];

        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        this.showSceneMessage(randomMessage.text, randomMessage.type);
    }

    /**
     * Start showing random messages at intervals
     */
    startRandomMessages() {
        // Clear any existing timer
        this.stopRandomMessages();

        // Show random messages every 8-15 seconds
        const showMessage = () => {
            this.showRandomMessage();

            // Schedule next message
            const nextDelay = Math.random() * 7000 + 8000; // 8-15 seconds
            this.randomMessageTimer = setTimeout(showMessage, nextDelay);
        };

        // Start first message after 3 seconds
        this.randomMessageTimer = setTimeout(showMessage, 3000);
    }

    /**
     * Stop random messages
     */
    stopRandomMessages() {
        if (this.randomMessageTimer) {
            clearTimeout(this.randomMessageTimer);
            this.randomMessageTimer = null;
        }
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
                window.location.href = 'menu.html';
            }, 2000);
        } else {
            window.location.href = 'menu.html';
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
            await this.loadCSS(cssFile, cssId);
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
        if (this.loadedCSS.has(url) || document.querySelector(`link[href="${url}"]`)) {
            return; // Already loaded or preloaded
        }

        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'style';
        link.href = url;
        link.id = `${id}-preload`; // Unique ID for preload link

        document.head.appendChild(link);
        console.log(`🚀 Preloading CSS: ${url}`);
    }

    preloadAllSceneCSS() {
        const sceneMap = {
            1: 'css/story/scene-space.css',
            2: 'css/story/scene-lighthouse.css',
            3: 'css/story/scene-factory.css',
            4: 'css/story/scene-journey.css',
            5: 'css/story/scene-final.css'
        };

        console.log('🚀 Preloading all scene CSS...');
        for (let i = 1; i <= this.totalScenes; i++) {
            const cssFile = sceneMap[i];
            if (cssFile) {
                this.preloadCSS(cssFile, `story-scene-${i}-css`);
            }
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

        const fragment = document.createDocumentFragment();
        const starCount = sceneNumber === 4 ? 150 : 100; // More stars for journey scene

        for (let i = 0; i < starCount; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            star.style.left = `${Math.random() * 100}%`;
            star.style.top = `${Math.random() * 100}%`;
            const size = Math.random() * 3 + 1;
            star.style.width = `${size}px`;
            star.style.height = `${size}px`;
            star.style.animationDelay = `${Math.random() * 3}s`;
            fragment.appendChild(star);
        }
        starsContainer.appendChild(fragment);

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
        // Stop random messages
        this.stopRandomMessages();

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
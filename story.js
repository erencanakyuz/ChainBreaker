// story.js - Manages scene transitions and dynamic CSS loading for story.html

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
    }

    init() {
        if (!this.scenes.length || !this.prevBtn || !this.nextBtn || !this.startGameBtn) {
            console.error('Story elements not found. Make sure story.html has the correct structure.');
            return;
        }

        this.addEventListeners();
        this.showScene(1); // Show the first scene initially
        this.generateStars(); // Generate stars for the space scene
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

        this.updateControls();
    }

    updateControls() {
        this.prevBtn.disabled = this.currentScene === 1;
        this.nextBtn.style.display = this.currentScene === this.totalScenes ? 'none' : 'inline-block';
        this.startGameBtn.style.display = this.currentScene === this.totalScenes ? 'inline-block' : 'none';
    }

    async nextScene() {
        if (this.currentScene < this.totalScenes) {
            await this.showScene(this.currentScene + 1);
        }
    }

    async previousScene() {
        if (this.currentScene > 1) {
            await this.showScene(this.currentScene - 1);
        }
    }

    startGame() {
        window.location.href = 'index.html';
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
} 
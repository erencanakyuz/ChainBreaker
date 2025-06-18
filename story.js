// story.js - Manages scene transitions and dynamic CSS loading for story.html

document.addEventListener('DOMContentLoaded', () => {
    const story = new StoryManager();
    story.init();
});

class StoryManager {
    constructor() {
        this.currentScene = 1;
        this.totalScenes = 4;
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
            4: 'css/story/scene-final.css' // scene-final uses space css, but we can define it
        };

        // Scene 4 reuses scene 1's CSS, so we handle that.
        const cssFile = sceneNumber === 4 ? sceneMap[1] : sceneMap[sceneNumber];
        const cssId = `story-scene-${sceneNumber}-css`;

        if (cssFile) {
            try {
                await this.loadCSS(cssFile, cssId);

                // Preload CSS for the next scene for a smoother transition
                const nextSceneNumber = this.currentScene + 1;
                if (nextSceneNumber <= this.totalScenes) {
                    const nextCssFile = nextSceneNumber === 4 ? sceneMap[1] : sceneMap[nextSceneNumber];
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
        const starsContainer = document.querySelector('#scene-1 .stars');
        if (!starsContainer) return;

        let starHTML = '';
        for (let i = 0; i < 100; i++) {
            starHTML += '<div class="star"></div>';
        }
        starsContainer.innerHTML = starHTML;
    }
} 
// ChainBreaker Pro - Story System
class StorySystem {
    constructor() {
        this.currentScene = 1;
        this.totalScenes = 4;
        this.storyActive = false;
        this.storyContainer = null;
    }

    init() {
        // Load story HTML and CSS
        this.loadStoryResources();
    }

    async loadStoryResources() {
        try {
            // Create story container
            this.storyContainer = document.createElement('div');
            this.storyContainer.id = 'story-system';
            this.storyContainer.innerHTML = await this.loadStoryHTML();
            document.body.appendChild(this.storyContainer);

            // Load story CSS
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'story.css';
            document.head.appendChild(link);

            console.log('Story system loaded successfully');
        } catch (error) {
            console.error('Failed to load story resources:', error);
        }
    }

    async loadStoryHTML() {
        return `
        <div class="story-container" style="display: none;">
            <!-- Scene 1: Space - Saturn and Pluto (Titan) -->
            <div class="story-scene scene-space active" id="scene-1">
                <div class="scene">
                    <div class="scene_titanShadow"></div>
                    <div class="t_wrap">
                        <div class="scene_titan">
                            <div class="eyes">
                                <div class="eye eye--left"></div>
                                <div class="eye eye--right"></div>
                            </div>
                        </div>
                    </div>
                    <div class="scene_saturn">
                        <div class="scene_saturn__shadow"></div>
                        <div class="scene_saturn__shadowRing"></div>
                        <div class="scene_saturn__face">
                            <div class="face_clip">
                                <div class="eye eye--left"></div>
                                <div class="eye eye--right"></div>
                                <div class="mouth"></div>
                            </div>
                        </div>
                        <div class="scene_saturn__sparks">
                            ${this.generateSparks(20)}
                        </div>
                        <div class="scene_saturn__ring">
                            <div class="small">
                                ${this.generateSmallParts(40)}
                            </div>
                            <div class="layer">
                                ${this.generateLayerParts(50)}
                            </div>
                            <div class="layer">
                                ${this.generateLayerParts(50)}
                            </div>
                            <div class="layer">
                                ${this.generateLayerParts(50)}
                            </div>
                        </div>
                    </div>
                </div>
                <div class="story-text">
                    Uzayın derinliklerinde, Saturnus'un muhteşem halkaları tüm gezegenin kıskançlığına neden oluyordu... 
                    Pluton, artık gezegen sayılmadığı için daha da öfkeliydi ve bu güzel halkalara sahip olmayı çok istiyordu.
                </div>
            </div>

            <!-- Scene 2: Lighthouse - Signal to Earth -->
            <div class="story-scene scene-lighthouse" id="scene-2">
                <div class="background">
                    <div class="stars">
                        ${this.generateStars(60)}
                    </div>
                    <div class="moon"></div>
                    <div class="mountains">
                        <div class="mountain"></div>
                        <div class="mountain"></div>
                        <div class="mountain"></div>
                        <div class="mountain"></div>
                    </div>
                    <div class="sea">
                        ${this.generateWaves(30)}
                        <div class="boat">
                            <div class="sail"></div>
                            <div class="sail"></div>
                            <div class="base"></div>
                        </div>
                    </div>
                </div>
                <div class="lighthouse-group">
                    <div class="land"></div>
                    <div class="lighthouse-holder">
                        <div class="shadow"></div>
                        <div class="lighthouse"></div>
                        <div class="top">
                            <div class="light-container">
                                <div class="light"></div>
                            </div>
                            <div class="rail"></div>
                            <div class="middle"></div>
                            <div class="roof">
                                <div class="roof-light"></div>
                            </div>
                            <div class="glow"></div>
                        </div>
                        <div class="windows">
                            <div class="window"></div>
                            <div class="window"></div>
                            <div class="window"></div>
                            <div class="window"></div>
                        </div>
                        <div class="door">
                            <div class="stairs"></div>
                        </div>
                    </div>
                </div>
                <div class="story-text">
                    Pluton, insanlara gizli bir mesaj gönderdi. Dünyadaki deniz feneri üzerinden, 
                    ona güzel halkalar yapmaları için yalvardı. "Saturnus gibi ben de halkalara sahip olmak istiyorum!" dedi.
                </div>
            </div>

            <!-- Scene 3: Factory - Ring Production -->
            <div class="story-scene scene-factory" id="scene-3">
                <div class="hover">
                    <svg class="illustration" width="438" height="548" viewBox="0 0 438 548">
                        <defs>
                            <radialGradient cx="50%" cy="50%" r="60%" id="factory-gradient">
                                <stop stop-color="#AB3424" offset="0%"/>
                                <stop stop-color="#E14B25" offset="89%"/>
                            </radialGradient>
                        </defs>
                        <g fill="none" fill-rule="evenodd">
                            <!-- Factory Building Structure -->
                            <rect x="50" y="200" width="300" height="200" fill="url(#factory-gradient)" rx="10"/>
                            <rect x="80" y="150" width="240" height="60" fill="#666" rx="5"/>
                            
                            <!-- Chimneys -->
                            <rect x="120" y="100" width="30" height="80" fill="#444"/>
                            <rect x="180" y="80" width="35" height="100" fill="#444"/>
                            <rect x="240" y="90" width="30" height="90" fill="#444"/>
                            
                            <!-- Smoke -->
                            <circle cx="135" cy="80" r="15" fill="rgba(255,255,255,0.3)" opacity="0.8">
                                <animate attributeName="cy" values="80;40;80" dur="3s" repeatCount="indefinite"/>
                                <animate attributeName="opacity" values="0.8;0.2;0.8" dur="3s" repeatCount="indefinite"/>
                            </circle>
                            <circle cx="197" cy="60" r="18" fill="rgba(255,255,255,0.3)" opacity="0.6">
                                <animate attributeName="cy" values="60;20;60" dur="4s" repeatCount="indefinite"/>
                                <animate attributeName="opacity" values="0.6;0.1;0.6" dur="4s" repeatCount="indefinite"/>
                            </circle>
                            
                            <!-- Windows with lights -->
                            <rect x="90" y="230" width="25" height="30" fill="#FFD700" rx="3">
                                <animate attributeName="fill" values="#FFD700;#FFA500;#FFD700" dur="2s" repeatCount="indefinite"/>
                            </rect>
                            <rect x="140" y="230" width="25" height="30" fill="#FFD700" rx="3">
                                <animate attributeName="fill" values="#FFA500;#FFD700;#FFA500" dur="2.5s" repeatCount="indefinite"/>
                            </rect>
                            
                            <!-- Ring Production Area -->
                            <rect x="250" y="220" width="80" height="80" fill="#333" rx="5"/>
                            <text x="290" y="245" fill="#FFF" font-size="8" text-anchor="middle">RING</text>
                            <text x="290" y="255" fill="#FFF" font-size="8" text-anchor="middle">FACTORY</text>
                            
                            <!-- Animated Rings being produced -->
                            <circle cx="290" cy="270" r="8" fill="none" stroke="#00f7ff" stroke-width="2" opacity="0">
                                <animate attributeName="r" values="0;8;15;0" dur="3s" repeatCount="indefinite"/>
                                <animate attributeName="opacity" values="0;1;0.5;0" dur="3s" repeatCount="indefinite"/>
                            </circle>
                            <circle cx="290" cy="270" r="12" fill="none" stroke="#08ffff" stroke-width="1.5" opacity="0">
                                <animate attributeName="r" values="0;12;20;0" dur="4s" repeatCount="indefinite" begin="1s"/>
                                <animate attributeName="opacity" values="0;0.8;0.3;0" dur="4s" repeatCount="indefinite" begin="1s"/>
                            </circle>
                        </g>
                    </svg>
                </div>
                <div class="story-text">
                    İnsanlar Pluton'un isteğini duydu ve hemen harekete geçti! Deniz kenarında dev bir halka üretim tesisi kurdular. 
                    Fabrika durmaksızın çalışıyor, Pluton için muhteşem halkalar üretiyordu. Artık o da Saturnus gibi güzel olacaktı!
                </div>
            </div>

            <!-- Scene 4: Final - Game Connection -->
            <div class="story-scene scene-space" id="scene-4">
                <div class="scene">
                    <div class="scene_titanShadow"></div>
                    <div class="t_wrap">
                        <div class="scene_titan">
                            <div class="eyes">
                                <div class="eye eye--left"></div>
                                <div class="eye eye--right"></div>
                            </div>
                        </div>
                    </div>
                    <div class="scene_saturn">
                        <div class="scene_saturn__shadow"></div>
                        <div class="scene_saturn__shadowRing"></div>
                        <div class="scene_saturn__face">
                            <div class="face_clip">
                                <div class="eye eye--left"></div>
                                <div class="eye eye--right"></div>
                                <div class="mouth"></div>
                            </div>
                        </div>
                        <div class="scene_saturn__sparks">
                            ${this.generateSparks(20)}
                        </div>
                        <div class="scene_saturn__ring">
                            <div class="small">
                                ${this.generateSmallParts(40)}
                            </div>
                            <div class="layer">
                                ${this.generateLayerParts(50)}
                            </div>
                            <div class="layer">
                                ${this.generateLayerParts(50)}
                            </div>
                            <div class="layer">
                                ${this.generateLayerParts(50)}
                            </div>
                        </div>
                    </div>
                </div>
                <div class="story-text">
                    Fakat halkalar çok güçlüydü ve Pluton'a ulaşırken parçalanmaya başladı! 
                    Şimdi sen bu halka parçalarını yok etmeli ve Pluton'un halkalarını kurtarmalısın! 
                    ChainBreaker olarak bu görev sana düştü!
                </div>
            </div>

            <!-- Story Controls -->
            <div class="story-controls">
                <button id="prevBtn" onclick="storySystem.previousScene()">◀ Önceki</button>
                <button id="nextBtn" onclick="storySystem.nextScene()">Sonraki ▶</button>
                <button id="startGameBtn" onclick="storySystem.startGame()" style="display: none;">Oyunu Başlat</button>
            </div>
        </div>
        `;
    }

    generateSparks(count) {
        let sparks = '';
        for (let i = 0; i < count; i++) {
            sparks += '<div class="spark"></div>';
        }
        return sparks;
    }

    generateSmallParts(count) {
        let parts = '';
        for (let i = 0; i < count; i++) {
            parts += '<div class="small_part"></div>';
        }
        return parts;
    }

    generateLayerParts(count) {
        let parts = '';
        for (let i = 0; i < count; i++) {
            parts += '<div class="layer_part"></div>';
        }
        return parts;
    }

    generateStars(count) {
        let stars = '';
        for (let i = 0; i < count; i++) {
            stars += '<div class="star"></div>';
        }
        return stars;
    }

    generateWaves(count) {
        let waves = '';
        for (let i = 0; i < count; i++) {
            waves += '<div class="wave"></div>';
        }
        return waves;
    }

    show() {
        if (this.storyContainer) {
            const container = this.storyContainer.querySelector('.story-container');
            if (container) {
                container.style.display = 'block';
                this.storyActive = true;
                this.showScene(1);
                this.setupKeyboardControls();
            }
        }
    }

    hide() {
        if (this.storyContainer) {
            const container = this.storyContainer.querySelector('.story-container');
            if (container) {
                container.style.display = 'none';
                this.storyActive = false;
            }
        }
    }

    showScene(sceneNumber) {
        this.currentScene = sceneNumber;

        // Hide all scenes
        const scenes = this.storyContainer.querySelectorAll('.story-scene');
        scenes.forEach(scene => scene.classList.remove('active'));

        // Show current scene
        const currentSceneElement = this.storyContainer.querySelector(`#scene-${sceneNumber}`);
        if (currentSceneElement) {
            currentSceneElement.classList.add('active');
        }

        // Update controls
        const prevBtn = this.storyContainer.querySelector('#prevBtn');
        const nextBtn = this.storyContainer.querySelector('#nextBtn');
        const startGameBtn = this.storyContainer.querySelector('#startGameBtn');

        if (prevBtn) prevBtn.disabled = sceneNumber === 1;
        if (nextBtn) nextBtn.style.display = sceneNumber === this.totalScenes ? 'none' : 'inline-block';
        if (startGameBtn) startGameBtn.style.display = sceneNumber === this.totalScenes ? 'inline-block' : 'none';
    }

    nextScene() {
        if (this.currentScene < this.totalScenes) {
            this.showScene(this.currentScene + 1);
        }
    }

    previousScene() {
        if (this.currentScene > 1) {
            this.showScene(this.currentScene - 1);
        }
    }

    startGame() {
        this.hide();

        // Start the main game
        if (typeof window.game !== 'undefined' && window.game.scene) {
            // Phaser game exists, switch to game scene
            window.game.scene.start('GameScene');
        } else if (typeof window.startMainGame === 'function') {
            window.startMainGame();
        } else {
            // Fallback - just hide story and show game content
            console.log('Story completed, starting game...');
            // You can add more specific game start logic here
        }
    }

    setupKeyboardControls() {
        if (this.keyboardSetup) return;

        document.addEventListener('keydown', (e) => {
            if (!this.storyActive) return;

            if (e.key === 'ArrowRight' || e.key === ' ') {
                e.preventDefault();
                this.nextScene();
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                this.previousScene();
            } else if (e.key === 'Enter' && this.currentScene === this.totalScenes) {
                e.preventDefault();
                this.startGame();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                this.startGame(); // Skip story
            }
        });

        this.keyboardSetup = true;
    }
}

// Create global story system instance
const storySystem = new StorySystem();

// Auto-initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    storySystem.init();
}); 
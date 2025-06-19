Of course. I will now act as the senior developer and generate a response to the prompt you've crafted, incorporating the additional enhancements we discussed.

This plan integrates a central `GameManager`, uses ES6 modules for clean script loading, and introduces a data-driven approach for level rewards. It provides a comprehensive, step-by-step roadmap to elevate your game's architecture.

---

# ChainBreaker: Architectural Refactoring Plan

**Prepared for:** The ChainBreaker Development Team
**Authored by:** Senior Software Architect

### 1. Architectural Summary

The "ChainBreaker" codebase shows significant creative effort, particularly in its rich CSS animations and distinct story scenes. The current structure has served it well during initial development. To prepare for future growth—including the new unlockables system—we will now refactor towards a more robust, component-based architecture.

This plan outlines a migration to a modular, event-driven application. The key changes are:

1.  **The Pluto Component:** We will refactor Pluto into a reusable, self-contained component. All its core logic (animation, moods, speech) will be encapsulated in a single `Pluto.js` class. Its visual appearance will be defined by a base CSS file, with swappable "skin" classes for cosmetic changes and scene-specific CSS for story-driven overrides.

2.  **The Player Progression System:** A new `PlayerProgression.js` class will manage all unlockable data (skins, animations, etc.) using `localStorage`. This decouples player achievements from the game logic, making the system easy to manage and expand.

3.  **The GameManager:** A central `GameManager.js` will act as the brain of the application. It will manage the overall game state (`MENU`, `PLAYING`, `STORY`), orchestrate the initialization of all other systems, and serve as the primary event bus, facilitating clean communication between modules via native `CustomEvent`s.

This refactoring will produce a more stable, maintainable, and extensible codebase, paving the way for exciting new features.

### 2. Revised Directory Structure

This new structure organizes files by feature and responsibility, creating a clean and scalable project layout.

```
└── ./
    └── ChainBreaker/
        ├── css/
        │   ├── components/
        │   │   ├── animations.css      # (Consolidated) Shared @keyframes.
        │   │   └── pluto.css           # (New) Base styles for the Pluto component.
        │   ├── story/
        │   │   └── ...                 # Scene-specific overrides remain here.
        │   ├── skins/                  # (New) For Pluto's cosmetic skins.
        │   │   ├── default.css
        │   │   ├── golden.css
        │   │   └── cyborg.css
        │   ├── main.css                # (Formerly styles.css) Core app layout.
        │   └── test-panel.css          # (Formerly pluto-test-panel.css)
        ├── data/                       # (New) For game data.
        │   ├── level-rewards.json
        │   └── pluto-speeches.json
        ├── html/
        │   ├── pluto-test-panel.html
        │   └── unlock-screen.html      # (New) Placeholder for the unlock screen.
        ├── js/
        │   ├── components/
        │   │   └── Pluto.js            # (New) The reusable Pluto class.
        │   ├── core/                   # (New) For core game systems.
        │   │   ├── GameManager.js      # (New) Main game state and logic manager.
        │   │   └── PlayerProgression.js# (New) Manages unlocks and saved data.
        │   ├── scenes/
        │   │   ├── Story.js            # (Formerly story.js)
        │   │   └── ...                 # Phaser scenes would go here.
        │   └── main.js                 # (New) Main entry point, initializes the game.
        ├── index.html
        └── story.html
```
*(Note: Old `pluto-*.js` files will be removed after their logic is migrated.)*

### 3. Key File Refactoring (Code Snippets)

#### A. The Reusable Pluto Component (`js/components/Pluto.js`)

This class encapsulates all Pluto logic and interacts with other systems via dependency injection and events.

```javascript
// File: js/components/Pluto.js

import { playerProgression } from '../core/PlayerProgression.js';

export class Pluto {
    constructor(container) {
        this.container = container;
        this.progression = playerProgression; // Use the singleton instance
        
        this.element = this._createPlutoElement();
        this.skin = this.progression.getActiveSkin(); // Get saved skin
        
        this.mood = 'neutral';
        this.currentAnimation = 'idle';

        this.applySkin(this.skin);
        this.setAnimation('idle');
        
        // Listen for global game events
        window.addEventListener('levelComplete', () => this.setMood('happy'));
        window.addEventListener('playerHurt', () => this.setMood('sad'));
    }

    _createPlutoElement() {
        const plutoEntity = document.createElement('div');
        plutoEntity.className = 'pluto-entity'; // Base class from pluto.css
        // ... innerHTML for eyes, mouth, etc. ...
        this.container.appendChild(plutoEntity);
        return plutoEntity;
    }

    applySkin(skinName) {
        if (!this.progression.isUnlocked('skin', skinName)) {
            console.warn(`Skin "${skinName}" is not unlocked.`);
            return;
        }
        // Reset and apply new skin class
        this.element.className = 'pluto-entity'; 
        this.element.classList.add(`skin--${skinName}`);
        this.skin = skinName;
    }

    setMood(moodName) {
        if (!this.progression.isUnlocked('mood', moodName)) {
            console.warn(`Mood "${moodName}" is locked.`);
            return;
        }
        this.element.dataset.mood = moodName; // Use data-attributes for CSS state
        console.log(`Pluto mood changed to: ${moodName}`);
    }

    setAnimation(animationName) {
        this.element.dataset.animation = animationName;
    }
    
    mount() {
        this.container.appendChild(this.element);
    }
}
```

#### B. The Player Progression System (`js/core/PlayerProgression.js`)

This singleton class manages all unlockable data using `localStorage`.

```javascript
// File: js/core/PlayerProgression.js

class PlayerProgression {
    // ... (constructor, load, save methods as defined in the prompt) ...
    constructor() {
        this.data = {
            activeSkin: 'default',
            unlockedSkins: ['default'],
            unlockedAnimations: ['idle', 'excited'],
            unlockedMoods: ['neutral', 'happy', 'sad']
        };
        this.load();
    }
    
    isUnlocked(type, id) { /* ... as defined before ... */ }
    unlock(type, id) { /* ... as defined before ... */ }
    
    setActiveSkin(skinName) {
        if (this.isUnlocked('skin', skinName)) {
            this.data.activeSkin = skinName;
            this.save();
        }
    }
    
    getActiveSkin() {
        return this.data.activeSkin || 'default';
    }
}

// Export a single instance to ensure all parts of the app use the same data
export const playerProgression = new PlayerProgression();
```

#### C. A Pluto Skin File (`css/skins/cyborg.css`)

This demonstrates how a skin file only overrides visual properties.

```css
/* File: css/skins/cyborg.css */

/* Cyborg Pluto Skin - Overrides base visuals from pluto.css */
.pluto-entity.skin--cyborg {
    background: linear-gradient(135deg, #7F8C8D, #34495E);
    box-shadow: 0 0 0 4px #95A5A6 inset, -20px -15px 40px #2C3E50 inset;
}

.pluto-entity.skin--cyborg .eye {
    background: #E74C3C; /* Glowing red eye */
    box-shadow: 0 0 15px #C0392B;
    border-radius: 2px; /* Make it square-ish */
}
```

#### D. The Central Game Manager (`js/core/GameManager.js`)

This class orchestrates the game, tying all the systems together.

```javascript
// File: js/core/GameManager.js

import { Pluto } from '../components/Pluto.js';
import { playerProgression } from './PlayerProgression.js';

export class GameManager {
    constructor() {
        this.pluto = null;
        this.levelRewards = null; // Will hold data from JSON
    }

    async initialize() {
        // Load external game data
        await this.loadGameData();
        
        // Initialize Pluto
        const gameContainer = document.getElementById('game-container');
        this.pluto = new Pluto(gameContainer);
        
        // Start Phaser game or other logic...
        // const phaserGame = new Phaser.Game(config);

        console.log("GameManager Initialized. Pluto is ready.");
    }

    async loadGameData() {
        try {
            const response = await fetch('data/level-rewards.json');
            this.levelRewards = await response.json();
        } catch (e) {
            console.error("Failed to load level rewards data!", e);
        }
    }

    // Example function called when a level is completed
    completeLevel(levelId) {
        console.log(`Level ${levelId} completed! Checking for rewards.`);
        
        const reward = this.levelRewards[levelId];
        if (reward) {
            playerProgression.unlock(reward.type, reward.id);
        }

        // Dispatch a global event for other systems to listen to
        window.dispatchEvent(new CustomEvent('levelComplete', { detail: { levelId } }));
    }
}
```

---

### 4. Step-by-Step Implementation Plan

Follow these steps in order to refactor your game.

**Phase 1: Project Restructuring & CSS Consolidation**

1.  **Backup Your Project:** Before you begin, make a complete copy of your `ChainBreaker` directory.
2.  **Reorganize Folders:** Create the new directory structure outlined above (`js/core`, `js/components`, `css/skins`, `data`).
3.  **Move & Rename Files:**
    *   Move `pluto-test-panel.html` to the `html/` folder.
    *   Move `pluto-test-panel.css` to the `css/` folder.
    *   Rename `styles.css` to `css/main.css`.
    *   Move `story.js` to `js/scenes/Story.js`.
4.  **Consolidate Animations:**
    *   Go through all `.css` files. **Cut** all generic `@keyframes` (like `spin`, `twinkle`, `hover`) and **paste** them into `css/components/animations.css`. Delete the keyframes from their original files.
    *   **Delete** the now-redundant `css/pluto-animations.css`.

**Phase 2: Creating the Core Components (JS & CSS)**

5.  **Create Base Pluto CSS (`css/components/pluto.css`):**
    *   Create this file. Copy the base visual styles for Pluto (formerly `.scene_titan`) from `css/story/scene-space.css`.
    *   Rename the main selector to `.pluto-entity`.
    *   Copy all the `pluto-*` keyframe animations from your old code into this file. Link this new CSS file in `index.html` and `story.html`.
6.  **Create the Progression System (`js/core/PlayerProgression.js`):**
    *   Create this new file and implement the `PlayerProgression` class as shown in the snippet above. It should be a self-contained singleton that exports an instance.
7.  **Create the Pluto Component (`js/components/Pluto.js`):**
    *   Create the file. Implement the `Pluto` class structure.
    *   Begin migrating logic: Start with the `_createPlutoElement` method. Then, move animation logic into `setAnimation` and mood logic into `setMood`.
    *   In `setMood` and `applySkin`, add the `this.progression.isUnlocked()` checks.
8.  **Create Data Files:**
    *   Create `data/pluto-speeches.json` and move the speech database object into it.
    *   Create `data/level-rewards.json`:
        ```json
        {
          "1": { "type": "mood", "id": "sad" },
          "2": { "type": "skin", "id": "golden" },
          "3": { "type": "animation", "id": "fly-around" }
        }
        ```

**Phase 3: Architecting the Application Flow**

9.  **Create the GameManager (`js/core/GameManager.js`):**
    *   Implement the `GameManager` class. It should `import` the `Pluto` class and the `playerProgression` singleton.
10. **Create the Main Entry Point (`js/main.js`):**
    *   This is the new starting point for your application. It will import and initialize the `GameManager`.

    **`js/main.js`:**
    ```javascript
    import { GameManager } from './core/GameManager.js';

    window.addEventListener('load', () => {
        const gameManager = new GameManager();
        gameManager.initialize();

        // Make it accessible for debugging if needed
        window.gameManager = gameManager;
    });
    ```
11. **Update `index.html`:**
    *   Remove all old script tags for `pluto-*.js`.
    *   Remove the hardcoded test panel HTML.
    *   Add a single script tag to load your application:
        ```html
        <script type="module" src="js/main.js"></script>
        ```

**Phase 4: Final Integration and Testing**

12. **Update the Test Panel (`js/pluto-test-panel.js`):**
    *   Modify the test panel's functions. Instead of calling global functions, they should now interact with the global `window.gameManager.pluto` instance (e.g., `window.gameManager.pluto.setMood('happy')`).
13. **Refactor Story Mode (`js/scenes/Story.js`):**
    *   At the start of your `StoryManager`, instantiate a new `Pluto` object for the story.
    *   In your scene-switching logic, use CSS overrides to change Pluto's appearance, and use `pluto.animate()` or `pluto.setMood()` to trigger behaviors specific to that part of the story.
14. **Test Thoroughly:** Use your test panel to verify that all animations, moods, and skins work correctly and that the unlock system prevents access to locked items. Play through the game and story to ensure events are firing and Pluto is reacting as expected.
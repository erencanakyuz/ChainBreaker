// File: js/core/PlayerProgression.js

class PlayerProgression {
    constructor() {
        this.data = {
            activeSkin: 'default',
            unlockedSkins: ['default'],
            unlockedAnimations: ['idle', 'excited'],
            unlockedMoods: ['neutral', 'happy', 'sad'],
            levelProgress: 0,
            totalScore: 0,
            achievementPoints: 0
        };
        this.load();
    }

    // Load progression data from localStorage
    load() {
        try {
            const saved = localStorage.getItem('chainbreaker-progression');
            if (saved) {
                const savedData = JSON.parse(saved);
                // Merge saved data with defaults to handle new properties
                this.data = { ...this.data, ...savedData };
                console.log('PlayerProgression: Loaded saved data', this.data);
            } else {
                console.log('PlayerProgression: No saved data found, using defaults');
            }
        } catch (error) {
            console.error('PlayerProgression: Error loading data', error);
            // Keep defaults on error
        }
    }

    // Save progression data to localStorage
    save() {
        try {
            localStorage.setItem('chainbreaker-progression', JSON.stringify(this.data));
            console.log('PlayerProgression: Data saved successfully');
        } catch (error) {
            console.error('PlayerProgression: Error saving data', error);
        }
    }

    // Check if a specific item is unlocked
    isUnlocked(type, id) {
        switch (type) {
            case 'skin':
                return this.data.unlockedSkins.includes(id);
            case 'animation':
                return this.data.unlockedAnimations.includes(id);
            case 'mood':
                return this.data.unlockedMoods.includes(id);
            default:
                console.warn(`PlayerProgression: Unknown unlock type "${type}"`);
                return false;
        }
    }

    // Unlock a new item
    unlock(type, id) {
        let unlocked = false;

        switch (type) {
            case 'skin':
                if (!this.data.unlockedSkins.includes(id)) {
                    this.data.unlockedSkins.push(id);
                    unlocked = true;
                    console.log(`PlayerProgression: Unlocked skin "${id}"`);
                }
                break;
            case 'animation':
                if (!this.data.unlockedAnimations.includes(id)) {
                    this.data.unlockedAnimations.push(id);
                    unlocked = true;
                    console.log(`PlayerProgression: Unlocked animation "${id}"`);
                }
                break;
            case 'mood':
                if (!this.data.unlockedMoods.includes(id)) {
                    this.data.unlockedMoods.push(id);
                    unlocked = true;
                    console.log(`PlayerProgression: Unlocked mood "${id}"`);
                }
                break;
            default:
                console.warn(`PlayerProgression: Unknown unlock type "${type}"`);
                return false;
        }

        if (unlocked) {
            this.save();
            // Dispatch global unlock event for other systems to listen to
            window.dispatchEvent(new CustomEvent('itemUnlocked', {
                detail: { type, id }
            }));
        }

        return unlocked;
    }

    // Set the active skin
    setActiveSkin(skinName) {
        if (this.isUnlocked('skin', skinName)) {
            this.data.activeSkin = skinName;
            this.save();
            console.log(`PlayerProgression: Active skin set to "${skinName}"`);

            // Dispatch skin change event
            window.dispatchEvent(new CustomEvent('skinChanged', {
                detail: { skinName }
            }));

            return true;
        } else {
            console.warn(`PlayerProgression: Cannot set active skin "${skinName}" - not unlocked`);
            return false;
        }
    }

    // Get the active skin
    getActiveSkin() {
        return this.data.activeSkin || 'default';
    }

    // Get all unlocked items of a specific type
    getUnlockedItems(type) {
        switch (type) {
            case 'skin':
                return [...this.data.unlockedSkins];
            case 'animation':
                return [...this.data.unlockedAnimations];
            case 'mood':
                return [...this.data.unlockedMoods];
            default:
                console.warn(`PlayerProgression: Unknown type "${type}"`);
                return [];
        }
    }

    // Update level progress
    updateLevelProgress(level) {
        if (level > this.data.levelProgress) {
            this.data.levelProgress = level;
            this.save();
            console.log(`PlayerProgression: Level progress updated to ${level}`);

            // Dispatch level progress event
            window.dispatchEvent(new CustomEvent('levelProgressUpdated', {
                detail: { level }
            }));
        }
    }

    // Add to total score
    addScore(points) {
        this.data.totalScore += points;
        this.save();

        // Dispatch score update event
        window.dispatchEvent(new CustomEvent('scoreUpdated', {
            detail: { totalScore: this.data.totalScore, addedPoints: points }
        }));
    }

    // Add achievement points
    addAchievementPoints(points) {
        this.data.achievementPoints += points;
        this.save();

        console.log(`PlayerProgression: Added ${points} achievement points. Total: ${this.data.achievementPoints}`);

        // Dispatch achievement points update event
        window.dispatchEvent(new CustomEvent('achievementPointsUpdated', {
            detail: { total: this.data.achievementPoints, added: points }
        }));
    }

    // Get current statistics
    getStats() {
        return {
            levelProgress: this.data.levelProgress,
            totalScore: this.data.totalScore,
            achievementPoints: this.data.achievementPoints,
            unlockedSkinsCount: this.data.unlockedSkins.length,
            unlockedAnimationsCount: this.data.unlockedAnimations.length,
            unlockedMoodsCount: this.data.unlockedMoods.length
        };
    }

    // Reset all progression (for testing or new game)
    reset() {
        this.data = {
            activeSkin: 'default',
            unlockedSkins: ['default'],
            unlockedAnimations: ['idle', 'excited'],
            unlockedMoods: ['neutral', 'happy', 'sad'],
            levelProgress: 0,
            totalScore: 0,
            achievementPoints: 0
        };
        this.save();
        console.log('PlayerProgression: All data reset to defaults');

        // Dispatch reset event
        window.dispatchEvent(new CustomEvent('progressionReset'));
    }

    // Export data for backup/sharing
    exportData() {
        return JSON.stringify(this.data, null, 2);
    }

    // Import data from backup
    importData(jsonString) {
        try {
            const importedData = JSON.parse(jsonString);
            // Validate the structure
            if (importedData && typeof importedData === 'object') {
                this.data = { ...this.data, ...importedData };
                this.save();
                console.log('PlayerProgression: Data imported successfully');

                // Dispatch import event
                window.dispatchEvent(new CustomEvent('progressionImported'));
                return true;
            }
        } catch (error) {
            console.error('PlayerProgression: Error importing data', error);
        }
        return false;
    }
}

// Export a single instance to ensure all parts of the app use the same data
export const playerProgression = new PlayerProgression(); 
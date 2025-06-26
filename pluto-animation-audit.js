/**
 * 🔍 PLUTO ANIMATION AUDIT SCRIPT
 * Run this in browser console to see the current animation chaos
 */

function auditPlutoAnimations() {
    console.log('🎭 PLUTO ANIMATION SYSTEM AUDIT STARTING...\n');

    const animations = [];
    const duplicates = [];
    const inconsistentNaming = [];

    try {
        // Scan all stylesheets for Pluto animations
        Array.from(document.styleSheets).forEach(sheet => {
            try {
                const rules = Array.from(sheet.cssRules || []);
                rules.forEach(rule => {
                    if (rule.type === CSSRule.KEYFRAMES_RULE) {
                        const name = rule.name;
                        if (name.toLowerCase().includes('pluto')) {
                            const animData = {
                                name: name,
                                file: sheet.href ? sheet.href.split('/').pop() : 'inline',
                                definition: rule.cssText.substring(0, 100) + '...'
                            };

                            animations.push(animData);

                            // Check for duplicates
                            const existing = animations.find(a => a.name === name && a !== animData);
                            if (existing) {
                                duplicates.push(name);
                            }

                            // Check naming consistency
                            if (!isConsistentNaming(name)) {
                                inconsistentNaming.push(name);
                            }
                        }
                    }
                });
            } catch (e) {
                console.warn('Could not access stylesheet:', sheet.href);
            }
        });

        // Generate report
        console.log('📊 AUDIT RESULTS:');
        console.log('================');
        console.log(`Total Pluto Animations Found: ${animations.length}`);
        console.log(`Files Affected: ${[...new Set(animations.map(a => a.file))].length}`);
        console.log(`Duplicate Names: ${duplicates.length}`);
        console.log(`Inconsistent Naming: ${inconsistentNaming.length}`);

        console.log('\n📂 ANIMATIONS BY FILE:');
        const byFile = animations.reduce((acc, anim) => {
            acc[anim.file] = acc[anim.file] || [];
            acc[anim.file].push(anim.name);
            return acc;
        }, {});

        Object.entries(byFile).forEach(([file, anims]) => {
            console.log(`📄 ${file}: ${anims.length} animations`);
            anims.forEach(name => console.log(`   • ${name}`));
        });

        if (duplicates.length > 0) {
            console.log('\n⚠️ DUPLICATE ANIMATIONS:');
            duplicates.forEach(name => console.log(`   ❌ ${name}`));
        }

        if (inconsistentNaming.length > 0) {
            console.log('\n🔤 INCONSISTENT NAMING:');
            inconsistentNaming.forEach(name => console.log(`   ❌ ${name}`));
        }

        // Test current Pluto state
        const plutoElement = document.querySelector('.pluto-base-entity, .pluto-entity');
        if (plutoElement) {
            console.log('\n🪐 CURRENT PLUTO STATE:');
            console.log(`   Context: ${plutoElement.dataset.context || 'unknown'}`);
            console.log(`   Animation: ${plutoElement.dataset.animation || 'unknown'}`);
            console.log(`   Mood: ${plutoElement.dataset.mood || 'unknown'}`);
            console.log(`   Skin: ${plutoElement.dataset.skin || 'unknown'}`);

            const computedStyle = getComputedStyle(plutoElement);
            console.log(`   Current CSS Animation: ${computedStyle.animationName}`);
        }

        console.log('\n🎯 RECOMMENDATIONS:');
        console.log('1. Consolidate all animations into single CSS file');
        console.log('2. Implement consistent naming: [context]-[mood]-[action]');
        console.log('3. Create state machine for animation management');
        console.log('4. Build proper test/debug interface');
        console.log('5. Generate documentation from animation definitions');

        return {
            total: animations.length,
            files: [...new Set(animations.map(a => a.file))].length,
            duplicates: duplicates.length,
            inconsistent: inconsistentNaming.length,
            animations,
            duplicates,
            inconsistentNaming
        };

    } catch (error) {
        console.error('Audit failed:', error);
        return null;
    }
}

function isConsistentNaming(name) {
    // Check if follows pattern: pluto-[context]-[action] or [context]-[mood]-[action]
    const patterns = [
        /^pluto-[a-z]+-[a-z]+$/,           // pluto-menu-float
        /^[a-z]+-[a-z]+-[a-z]+$/,         // menu-idle-pulse  
        /^pluto-[a-z]+$/                  // pluto-excited
    ];

    // Bad patterns
    const badPatterns = [
        /^pluto[A-Z]/,                    // plutoWaiting (camelCase)
        /^pluto_/,                        // pluto_eye (underscore)
        /[A-Z]/                          // Any uppercase in middle
    ];

    return !badPatterns.some(pattern => pattern.test(name));
}

// Auto-run if in browser
if (typeof window !== 'undefined') {
    console.log('🎭 Pluto Animation Audit Script Loaded');
    console.log('Run auditPlutoAnimations() to start analysis');

    // Add to global scope for easy access
    window.auditPlutoAnimations = auditPlutoAnimations;
}

// Export for Node.js if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { auditPlutoAnimations };
} 
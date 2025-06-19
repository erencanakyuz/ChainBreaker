/**
 * Template Manager - Handles loading and rendering HTML templates
 * Replaces hardcoded HTML in JavaScript with reusable templates
 */
export class TemplateManager {
    constructor() {
        this.templates = new Map();
        this.templateCache = new Map();
        this.cacheLimit = 20; // Set a reasonable cache size limit
    }

    /**
     * Load a template from a file
     * @param {string} templateName - Name of the template (without .html extension)
     * @param {string} templatePath - Optional custom path, defaults to html/templates/
     * @returns {Promise<string>} Template content
     */
    async loadTemplate(templateName, templatePath = 'html/templates/') {
        // Check cache first
        const cacheKey = `${templatePath}${templateName}`;
        if (this.templateCache.has(cacheKey)) {
            // Move the accessed template to the end to mark it as recently used
            const templateContent = this.templateCache.get(cacheKey);
            this.templateCache.delete(cacheKey);
            this.templateCache.set(cacheKey, templateContent);
            return templateContent;
        }

        try {
            const response = await fetch(`${templatePath}${templateName}.html`);
            if (!response.ok) {
                throw new Error(`Failed to load template: ${templateName} (${response.status})`);
            }

            const templateContent = await response.text();

            // Enforce cache limit with LRU eviction
            if (this.templateCache.size >= this.cacheLimit) {
                // Get the first key (least recently used) and delete it
                const lruKey = this.templateCache.keys().next().value;
                this.templateCache.delete(lruKey);
                console.log(`TemplateManager: Cache limit reached. Evicted: ${lruKey}`);
            }

            // Cache the new template
            this.templateCache.set(cacheKey, templateContent);
            console.log(`TemplateManager: Template loaded successfully: ${templateName}`);

            return templateContent;
        } catch (error) {
            console.error(`TemplateManager: Failed to load template ${templateName}:`, error);
            throw error;
        }
    }

    /**
     * Render a template with variables
     * @param {string} templateName - Name of the template
     * @param {Object} variables - Variables to substitute in the template
     * @param {string} templatePath - Optional custom path
     * @returns {Promise<string>} Rendered HTML
     */
    async render(templateName, variables = {}, templatePath = 'html/templates/') {
        const template = await this.loadTemplate(templateName, templatePath);
        return this.substitute(template, variables);
    }

    /**
     * Create a DOM element from a template
     * @param {string} templateName - Name of the template
     * @param {Object} variables - Variables to substitute
     * @param {string} templatePath - Optional custom path
     * @returns {Promise<HTMLElement>} DOM element
     */
    async createElement(templateName, variables = {}, templatePath = 'html/templates/') {
        const html = await this.render(templateName, variables, templatePath);
        const temp = document.createElement('div');
        temp.innerHTML = html;
        return temp.firstElementChild;
    }

    /**
     * Substitute variables in template
     * @param {string} template - Template string
     * @param {Object} variables - Variables to substitute
     * @returns {string} Template with variables substituted
     */
    substitute(template, variables = {}) {
        // Use a single regex to find all {{variable}} patterns and replace them
        return template.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
            // Trim the key to handle potential whitespace like {{ key }}
            const trimmedKey = key.trim();
            // Return the value from the variables object, or an empty string if not found
            return variables.hasOwnProperty(trimmedKey) ? variables[trimmedKey] : '';
        });
    }

    /**
     * Preload commonly used templates
     * @param {string[]} templateNames - Array of template names to preload
     */
    async preloadTemplates(templateNames) {
        console.log('TemplateManager: Preloading templates...');
        const loadPromises = templateNames.map(name =>
            this.loadTemplate(name).catch(error =>
                console.warn(`Failed to preload template: ${name}`, error)
            )
        );

        await Promise.allSettled(loadPromises);
        console.log('TemplateManager: Template preloading completed');
    }

    /**
     * Clear template cache
     */
    clearCache() {
        this.templateCache.clear();
        console.log('TemplateManager: Template cache cleared');
    }

    /**
     * Get cache statistics
     * @returns {Object} Cache statistics
     */
    getCacheStats() {
        return {
            cacheSize: this.templateCache.size,
            cachedTemplates: Array.from(this.templateCache.keys())
        };
    }
}

// Create a singleton instance
export const templateManager = new TemplateManager();

// Also attach to window for compatibility
if (typeof window !== 'undefined') {
    window.TemplateManager = TemplateManager;
    window.templateManager = templateManager;
} 
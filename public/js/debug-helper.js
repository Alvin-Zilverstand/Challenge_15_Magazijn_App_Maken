// Debug helper for translation issues
console.log('Debug helper loaded');

// Function to check item structure
window.debugItem = function(item) {
    console.log('Item structure:', item);
    console.log('Item name type:', typeof item.name);
    console.log('Item name value:', item.name);
    console.log('Item description type:', typeof item.description);
    console.log('Item description value:', item.description);
    
    if (window.translationManager) {
        console.log('Translation manager exists');
        const localized = window.translationManager.getLocalizedItem(item);
        console.log('Localized item:', localized);
    } else {
        console.log('Translation manager not available');
    }
};

// Function to ensure translation manager
window.ensureTranslationManager = function() {
    if (!window.translationManager) {
        console.log('Creating new translation manager instance');
        if (window.TranslationManager) {
            window.translationManager = new window.TranslationManager();
        } else {
            console.error('TranslationManager class not available');
            return null;
        }
    }
    return window.translationManager;
};

// Enhanced fallback function for items
window.getItemDisplayText = function(item, field, language = 'nl') {
    if (!item) return field === 'name' ? 'Onbekend Artikel' : 'Geen beschrijving beschikbaar';
    
    const value = item[field];
    
    if (typeof value === 'object' && value !== null) {
        return value[language] || value.nl || value.en || (field === 'name' ? 'Onbekend Artikel' : 'Geen beschrijving beschikbaar');
    } else if (typeof value === 'string') {
        return value;
    } else {
        return field === 'name' ? 'Onbekend Artikel' : 'Geen beschrijving beschikbaar';
    }
};

console.log('Debug helper functions loaded');
// Translation utility for the warehouse management system

const translations = {
    en: {
        // Navigation
        'school-warehouse': 'School Warehouse',
        'available-items': 'Available Items',
        'my-reservations': 'My Reservations',
        'logout': 'Logout',
        'inventory': 'Inventory',
        'add-new-item': 'Add New Item',
        'reservations': 'Reservations',
        
        // Page titles
        'warehouse-dashboard-admin': 'Warehouse Dashboard - Admin',
        'warehouse-dashboard-student': 'Warehouse Dashboard - Student',
        'my-reservations-student': 'My Reservations - Student',
        'login': 'Login',
        'register': 'Register',
        
        // Forms
        'username': 'Username',
        'password': 'Password',
        'remember-me': 'Remember Me',
        'no-account': "Don't have an account?",
        'student-registration': 'Student Registration',
        'confirm-password': 'Confirm Password',
        'already-account': 'Already have an account?',
        
        // Search and filters
        'search-items': 'Search items...',
        'search-reservations': 'Search reservations...',
        'clear-search': 'Clear search',
        'all-locations': 'All Locations',
        'all-status': 'All Status',
        'filter-reservations': 'Filter Reservations',
        'location': 'Location',
        'status': 'Status',
        'search': 'Search',
        
        // Table headers
        'image': 'Image',
        'item-name': 'Item Name',
        'description': 'Description',
        'quantity': 'Quantity',
        'quantity-available': 'Quantity Available',
        'action': 'Action',
        'actions': 'Actions',
        'reserved-date': 'Reserved Date',
        
        // View modes
        'grid': 'Grid',
        'list': 'List',
        
        // Status values
        'pending': 'Pending',
        'approved': 'Approved',
        'rejected': 'Rejected',
        'return-pending': 'Return Pending',
        'returned': 'Returned',
        
        // Buttons and actions
        'reserve': 'Reserve',
        'cancel': 'Cancel',
        'return': 'Return',
        'approve': 'Approve',
        'reject': 'Reject',
        'edit': 'Edit',
        'delete': 'Delete',
        
        // Messages
        'loading': 'Loading...',
        'loading-items': 'Loading items...',
        'failed-load-items': 'Failed to load items',
        'failed-load-reservations': 'Failed to load reservations',
        'failed-reserve-item': 'Failed to reserve item',
        'failed-cancel-reservation': 'Failed to cancel reservation',
        'failed-request-return': 'Failed to request return',
        'confirm-cancel-reservation': 'Are you sure you want to cancel this reservation?',
        'confirm-return-request': 'Are you sure you want to request return for this item? An admin will need to approve the return.',
        'return-request-success': 'Return requested successfully! An admin will review your request.',
        
        // Item fallbacks
        'unknown-item': 'Unknown Item',
        'no-description': 'No description available',
        
        // Management
        'inventory-management': 'Inventory Management',
        'reservation-management': 'Reservation Management'
    },
    nl: {
        // Navigation
        'school-warehouse': 'School Magazijn',
        'available-items': 'Beschikbare Artikelen',
        'my-reservations': 'Mijn Reserveringen',
        'logout': 'Uitloggen',
        'inventory': 'Voorraad',
        'add-new-item': 'Nieuw Artikel Toevoegen',
        'reservations': 'Reserveringen',
        
        // Page titles
        'warehouse-dashboard-admin': 'Magazijn Dashboard - Admin',
        'warehouse-dashboard-student': 'Magazijn Dashboard - Student',
        'my-reservations-student': 'Mijn Reserveringen - Student',
        'login': 'Inloggen',
        'register': 'Registreren',
        
        // Forms
        'username': 'Gebruikersnaam',
        'password': 'Wachtwoord',
        'remember-me': 'Onthoud mij',
        'no-account': 'Geen account?',
        'student-registration': 'Student Registratie',
        'confirm-password': 'Bevestig Wachtwoord',
        'already-account': 'Al een account?',
        
        // Search and filters
        'search-items': 'Zoek artikelen...',
        'search-reservations': 'Zoek reserveringen...',
        'clear-search': 'Zoekopdracht wissen',
        'all-locations': 'Alle Locaties',
        'all-status': 'Alle Statussen',
        'filter-reservations': 'Filter Reserveringen',
        'location': 'Locatie',
        'status': 'Status',
        'search': 'Zoeken',
        
        // Table headers
        'image': 'Afbeelding',
        'item-name': 'Artikelnaam',
        'description': 'Beschrijving',
        'quantity': 'Hoeveelheid',
        'quantity-available': 'Beschikbare Hoeveelheid',
        'action': 'Actie',
        'actions': 'Acties',
        'reserved-date': 'Reserveringsdatum',
        
        // View modes
        'grid': 'Raster',
        'list': 'Lijst',
        
        // Status values
        'pending': 'In Behandeling',
        'approved': 'Goedgekeurd',
        'rejected': 'Afgewezen',
        'return-pending': 'Retour in Behandeling',
        'returned': 'Geretourneerd',
        
        // Buttons and actions
        'reserve': 'Reserveren',
        'cancel': 'Annuleren',
        'return': 'Retourneren',
        'approve': 'Goedkeuren',
        'reject': 'Afwijzen',
        'edit': 'Bewerken',
        'delete': 'Verwijderen',
        
        // Messages
        'loading': 'Laden...',
        'loading-items': 'Artikelen laden...',
        'failed-load-items': 'Kon artikelen niet laden',
        'failed-load-reservations': 'Kon reserveringen niet laden',
        'failed-reserve-item': 'Kon artikel niet reserveren',
        'failed-cancel-reservation': 'Kon reservering niet annuleren',
        'failed-request-return': 'Kon retour niet aanvragen',
        'confirm-cancel-reservation': 'Weet je zeker dat je deze reservering wilt annuleren?',
        'confirm-return-request': 'Weet je zeker dat je retour wilt aanvragen voor dit artikel? Een admin moet de retour goedkeuren.',
        'return-request-success': 'Retour succesvol aangevraagd! Een admin zal je verzoek beoordelen.',
        
        // Item fallbacks
        'unknown-item': 'Onbekend Artikel',
        'no-description': 'Geen beschrijving beschikbaar',
        
        // Management
        'inventory-management': 'Voorraadbeheer',
        'reservation-management': 'Reserveringsbeheer'
    }
};

// Translation manager class
class TranslationManager {
    constructor() {
        this.currentLanguage = localStorage.getItem('language') || 'nl'; // Default to Dutch
        this.init();
    }

    init() {
        // Apply saved language preference
        this.applyTranslations();
        
        // Set up language toggle buttons if they exist
        const nlBtn = document.getElementById('nlBtn');
        const enBtn = document.getElementById('enBtn');
        
        if (nlBtn && enBtn) {
            nlBtn.addEventListener('click', () => {
                this.setLanguage('nl');
                this.updateLanguageButtons();
            });
            
            enBtn.addEventListener('click', () => {
                this.setLanguage('en');
                this.updateLanguageButtons();
            });
            
            // Set initial button states
            this.updateLanguageButtons();
        }
    }

    updateLanguageButtons() {
        const nlBtn = document.getElementById('nlBtn');
        const enBtn = document.getElementById('enBtn');
        
        if (nlBtn && enBtn) {
            // Remove active class from both buttons
            nlBtn.classList.remove('active');
            enBtn.classList.remove('active');
            
            // Add active class to current language button
            if (this.currentLanguage === 'nl') {
                nlBtn.classList.add('active');
            } else {
                enBtn.classList.add('active');
            }
        }
    }

    // Keep the old method for backward compatibility (in case it's used elsewhere)
    updateLanguageLabels() {
        this.updateLanguageButtons();
    }

    setLanguage(lang) {
        if (lang !== 'en' && lang !== 'nl') {
            console.warn('Unsupported language:', lang);
            return;
        }
        
        this.currentLanguage = lang;
        localStorage.setItem('language', lang);
        this.applyTranslations();
        this.updateLanguageLabels();
        
        // Reload dynamic content if function exists
        if (window.reloadContent) {
            window.reloadContent();
        }
    }

    getLanguage() {
        return this.currentLanguage;
    }

    translate(key) {
        const translation = translations[this.currentLanguage]?.[key];
        if (!translation) {
            console.warn(`Translation missing for key: ${key} in language: ${this.currentLanguage}`);
            // Fallback to Dutch first, then English, then key itself
            return translations['nl']?.[key] || translations['en']?.[key] || key;
        }
        return translation;
    }

    applyTranslations() {
        // Update all elements with data-translate attribute
        document.querySelectorAll('[data-translate]').forEach(element => {
            const key = element.getAttribute('data-translate');
            const translation = this.translate(key);
            
            if (element.tagName === 'INPUT' && element.type === 'submit') {
                element.value = translation;
            } else if (element.tagName === 'INPUT' && (element.type === 'text' || element.type === 'password')) {
                element.placeholder = translation;
            } else if (element.hasAttribute('title')) {
                element.title = translation;
            } else {
                element.textContent = translation;
            }
        });
        
        // Update page title if it has data-translate
        const titleElement = document.querySelector('title[data-translate]');
        if (titleElement) {
            const key = titleElement.getAttribute('data-translate');
            document.title = this.translate(key);
        }
    }

    // Get translated item data based on current language
    getLocalizedItem(item) {
        // Handle the case where item might be null or undefined
        if (!item) {
            return {
                name: this.translate('unknown-item'),
                description: this.translate('no-description')
            };
        }

        let name, description;

        // Handle multilingual name
        if (typeof item.name === 'object' && item.name !== null) {
            name = item.name[this.currentLanguage] || item.name.nl || item.name.en || this.translate('unknown-item');
        } else if (typeof item.name === 'string') {
            name = item.name;
        } else {
            name = this.translate('unknown-item');
        }

        // Handle multilingual description
        if (typeof item.description === 'object' && item.description !== null) {
            description = item.description[this.currentLanguage] || item.description.nl || item.description.en || this.translate('no-description');
        } else if (typeof item.description === 'string') {
            description = item.description || this.translate('no-description');
        } else {
            description = this.translate('no-description');
        }

        return {
            ...item,
            name: name,
            description: description
        };
    }

    // Get translated status text
    getStatusText(status) {
        const statusMap = {
            'PENDING': 'pending',
            'APPROVED': 'approved', 
            'REJECTED': 'rejected',
            'RETURN_PENDING': 'return-pending',
            'RETURNED': 'returned'
        };
        
        return this.translate(statusMap[status] || status.toLowerCase());
    }
}

// Initialize translation manager when DOM is loaded
let translationManager;
document.addEventListener('DOMContentLoaded', () => {
    translationManager = new TranslationManager();
    window.translationManager = translationManager;
});

// Export for use in other files
window.TranslationManager = TranslationManager;

// Function to ensure translation manager is available
window.getTranslationManager = function() {
    if (!window.translationManager) {
        window.translationManager = new TranslationManager();
    }
    return window.translationManager;
};
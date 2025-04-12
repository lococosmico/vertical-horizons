// Configuración inicial
document.addEventListener('DOMContentLoaded', () => {
    initLanguage();
    document.body.classList.add('loaded');
});

// Traducciones
const translations = {
    fr: {
        title: "Vertical Horizons",
        formation_text: "Apprenez les techniques...",
        formation_alt: "Formation en falaise"
        // ... todas las claves FR
    },
    en: {
        title: "Vertical Horizons",
        formation_text: "Learn advanced techniques...",
        formation_alt: "Rock climbing training"
        // ... todas las claves EN
    }
};

// Función principal
function changeLanguage(lang) {
    document.documentElement.lang = lang;
    
    // Actualizar textos
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.textContent = translations[lang]?.[key] || '';
    });
    
    // Actualizar imágenes
    document.querySelectorAll('[data-i18n-alt]').forEach(img => {
        const key = img.getAttribute('data-i18n-alt');
        img.alt = translations[lang]?.[key] || '';
    });
    
    localStorage.setItem('siteLang', lang);
}

// Inicialización
function initLanguage() {
    const savedLang = localStorage.getItem('siteLang') || 
                     (navigator.language.startsWith('fr') ? 'fr' : 'en');
    changeLanguage(savedLang);

    // Eventos de botones
    document.getElementById('btn-fr').addEventListener('click', () => changeLanguage('fr'));
    document.getElementById('btn-en').addEventListener('click', () => changeLanguage('en'));
}
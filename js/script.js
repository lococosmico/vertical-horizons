// Sistema de traducciones
const translations = {
    fr: {
        // ... tus traducciones al francés
    },
    en: {
        // ... tus traducciones al inglés
    }
};

// Función robusta para cambio de idioma
function changeLanguage(lang) {
    try {
        // 1. Actualizar atributo HTML
        document.documentElement.lang = lang;
        
        // 2. Actualizar textos
        const textElements = document.querySelectorAll('[data-i18n]');
        textElements.forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (translations[lang] && translations[lang][key]) {
                el.textContent = translations[lang][key];
            }
        });
        
        // 3. Actualizar placeholders e imágenes
        const updateAttributes = (selector, attr) => {
            document.querySelectorAll(selector).forEach(el => {
                const key = el.getAttribute(selector);
                if (translations[lang] && translations[lang][key]) {
                    el[attr] = translations[lang][key];
                }
            });
        };
        updateAttributes('[data-i18n-placeholder]', 'placeholder');
        updateAttributes('[data-i18n-alt]', 'alt');
        
        // 4. Guardar preferencia
        localStorage.setItem('siteLang', lang);
        
    } catch (error) {
        console.error('Error en changeLanguage:', error);
    }
}

// Inicialización segura
document.addEventListener('DOMContentLoaded', () => {
    // Configurar botones
    const setupButton = (id, lang) => {
        const btn = document.getElementById(id);
        if (btn) btn.addEventListener('click', () => changeLanguage(lang));
    };
    setupButton('btn-fr', 'fr');
    setupButton('btn-en', 'en');
    
    // Cargar idioma
    const defaultLang = navigator.language.startsWith('fr') ? 'fr' : 'en';
    const savedLang = localStorage.getItem('siteLang') || defaultLang;
    changeLanguage(savedLang);
}); 
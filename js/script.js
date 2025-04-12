// Traducciones
const translations = {
    fr: {
        // ... tus textos en francés
    },
    en: {
        // ... tus textos en inglés
    }
};

// Función ultra-robusta
function safeChangeLanguage(lang) {
    try {
        // 1. Actualizar HTML
        if (document.documentElement) {
            document.documentElement.lang = lang;
        }

        // 2. Actualizar textos
        var textElements = document.querySelectorAll('[data-i18n]');
        if (textElements) {
            textElements.forEach(function(el) {
                var key = el.getAttribute('data-i18n');
                if (translations[lang] && translations[lang][key]) {
                    el.textContent = translations[lang][key];
                }
            });
        }

        // 3. Guardar preferencia
        if (localStorage) {
            localStorage.setItem('siteLang', lang);
        }
    } catch (error) {
        console.log('Error controlado:', error.message);
    }
}

// Inicialización segura
if (document.readyState !== 'loading') {
    init();
} else {
    document.addEventListener('DOMContentLoaded', init);
}

function init() {
    // Botones
    var btnFr = document.getElementById('btn-fr');
    var btnEn = document.getElementById('btn-en');
    
    if (btnFr) btnFr.addEventListener('click', function() { safeChangeLanguage('fr'); });
    if (btnEn) btnEn.addEventListener('click', function() { safeChangeLanguage('en'); });

    // Idioma inicial
    var lang = 'fr';
    try {
        if (localStorage.getItem('siteLang')) {
            lang = localStorage.getItem('siteLang');
        } else if (navigator.language) {
            lang = navigator.language.startsWith('fr') ? 'fr' : 'en';
        }
    } catch (e) {
        console.log('Acceso a localStorage bloqueado');
    }
    
    safeChangeLanguage(lang);
}
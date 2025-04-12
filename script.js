<script>
    // Esperar a que el DOM esté completamente cargado
    document.addEventListener('DOMContentLoaded', function() {
        console.log("DOM completamente cargado - Inicializando idioma");
        
        // Definir traducciones
        const translations = {
            fr: {
                about: "À propos",
                gallery: "Galerie",
                contact: "Contact",
                about_title: "À propos",
                about_text: "Bienvenue chez Vertical Horizons, votre école d'escalade en Suisse...",
                // ... (todas tus traducciones al francés)
            },
            en: {
                about: "About",
                gallery: "Gallery",
                contact: "Contact",
                about_title: "About Us",
                about_text: "Welcome to Vertical Horizons, your climbing school in Switzerland...",
                // ... (todas tus traducciones al inglés)
            }
        };

        // Función para cambiar idioma (ahora está en el scope correcto)
        window.changeLanguage = function(lang) {
            console.log("Cambiando idioma a:", lang);
            
            try {
                // 1. Actualizar atributo lang
                document.documentElement.lang = lang;
                
                // 2. Actualizar textos
                document.querySelectorAll('[data-i18n]').forEach(el => {
                    const key = el.getAttribute('data-i18n');
                    if (translations[lang]?.[key]) {
                        el.textContent = translations[lang][key];
                    }
                });
                
                // 3. Actualizar placeholders
                document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
                    const key = el.getAttribute('data-i18n-placeholder');
                    if (translations[lang]?.[key]) {
                        el.placeholder = translations[lang][key];
                    }
                });
                
                // Guardar preferencia
                localStorage.setItem('preferredLang', lang);
                
            } catch (error) {
                console.error("Error al cambiar idioma:", error);
            }
        };

        // Asignar eventos a los botones correctamente
        document.querySelectorAll('.language-switcher button').forEach(btn => {
            btn.addEventListener('click', function() {
                changeLanguage(this.textContent.trim().toLowerCase());
            });
        });

        // Inicializar con idioma guardado o detectado
        const  preferredLang = localStorage.getItem('preferredLang') || 
        (navigator.language.startsWith('fr') ? 'fr' : 'en');
changeLanguage(preferredLang);
});
</script>
// Al final del eventListener DOMContentLoaded:
document.body.classList.add('ready');
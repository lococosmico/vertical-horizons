<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vertical Horizons</title>
    <style>
        /* ESTILOS DE PRECARGA */
        body.preload {
            visibility: hidden;
            opacity: 0;
            height: 100vh;
            overflow: hidden;
        }
        body.loaded {
            visibility: visible;
            opacity: 1;
            transition: opacity 0.4s ease-out;
        }
        
        /* ESTILOS MINIMOS PARA FUNCIONALIDAD */
        .language-switcher {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1000;
            display: flex;
            gap: 10px;
        }
        .language-switcher button {
            background: rgba(0,0,0,0.3);
            border: 1px solid white;
            color: white;
            padding: 8px 15px;
            border-radius: 5px;
            cursor: pointer;
            font-weight: bold;
            transition: all 0.2s;
        }
        .language-switcher button:hover {
            background: rgba(0,0,0,0.5);
        }
    </style>
    <link rel="stylesheet" href="styles.css">
</head>
<body class="preload">

    <!-- CABECERA -->
    <header>
        <h1 data-i18n="title">Vertical Horizons</h1>
        <div class="language-switcher">
            <button onclick="changeLanguage('fr')">FR</button>
            <button onclick="changeLanguage('en')">EN</button>
        </div>
        <nav>
            <ul>
                <li><a href="#about" data-i18n="about">À propos</a></li>
                <li><a href="#gallery" data-i18n="gallery">Galerie</a></li>
                <li><a href="#contact" data-i18n="contact">Contact</a></li>
            </ul>
        </nav>
    </header>

    <!-- SECCIONES -->
    <section id="about">
        <h2 data-i18n="about_title">À propos</h2>
        <p data-i18n="about_text">Bienvenue chez Vertical Horizons, votre école d'escalade en Suisse.</p>
    </section>

    <section id="gallery">
        <h2 data-i18n="gallery_title">Galerie</h2>
        <div class="gallery-container">
            <img src="img/JILL3700.JPG" alt="Escalade" data-i18n-alt="img1_alt">
            <img src="img/fondo.jpg" alt="Grimpeur" data-i18n-alt="img2_alt">
            <img src="img/img1.jpg" alt="Panoramique" data-i18n-alt="img3_alt">
        </div>
    </section>

    <section id="contact">
        <h2 data-i18n="contact_title">Contact</h2>
        <form>
            <input type="text" placeholder="Nom" required data-i18n-placeholder="name_ph">
            <input type="email" placeholder="Email" required data-i18n-placeholder="email_ph">
            <textarea placeholder="Message" required data-i18n-placeholder="msg_ph"></textarea>
            <button type="submit" data-i18n="submit_btn">Envoyer</button>
        </form>
    </section>

    <!-- SCRIPT PRINCIPAL -->
    <script>
    // ======================
    // SISTEMA DE TRADUCCIONES
    // ======================
    const translations = {
        fr: {
            title: "Vertical Horizons",
            about: "À propos",
            gallery: "Galerie",
            contact: "Contact",
            about_title: "À propos",
            about_text: "Bienvenue chez Vertical Horizons, votre école d'escalade en Suisse. Nous proposons des cours pour tous les âges et niveaux.",
            gallery_title: "Galerie",
            contact_title: "Contact",
            name_ph: "Nom",
            email_ph: "Email",
            msg_ph: "Message",
            submit_btn: "Envoyer",
            img1_alt: "Escalade en falaise",
            img2_alt: "Grimpeur professionnel",
            img3_alt: "Vue panoramique"
        },
        en: {
            title: "Vertical Horizons",
            about: "About",
            gallery: "Gallery",
            contact: "Contact",
            about_title: "About Us",
            about_text: "Welcome to Vertical Horizons, your climbing school in Switzerland. We offer courses for all ages and skill levels.",
            gallery_title: "Gallery",
            contact_title: "Contact",
            name_ph: "Name",
            email_ph: "Email",
            msg_ph: "Message",
            submit_btn: "Send",
            img1_alt: "Rock climbing",
            img2_alt: "Professional climber",
            img3_alt: "Panoramic view"
        }
    };

    // ======================
    // FUNCIÓN CAMBIO DE IDIOMA
    // ======================
    function changeLanguage(lang) {
        try {
            // 1. Actualizar atributo HTML
            document.documentElement.lang = lang;
            
            // 2. Actualizar textos normales
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
            
            // 4. Actualizar textos alternativos de imágenes
            document.querySelectorAll('[data-i18n-alt]').forEach(el => {
                const key = el.getAttribute('data-i18n-alt');
                if (translations[lang]?.[key]) {
                    el.alt = translations[lang][key];
                }
            });
            
            // 5. Guardar preferencia
            localStorage.setItem('siteLang', lang);
            
            console.log("Idioma cambiado a:", lang.toUpperCase());
            
        } catch (error) {
            console.error("Error al cambiar idioma:", error);
        }
    }

    // ======================
    // INICIALIZACIÓN
    // ======================
    document.addEventListener('DOMContentLoaded', () => {
        // 1. Cargar idioma guardado o detectar navegador
        const savedLang = localStorage.getItem('siteLang');
        const browserLang = navigator.language.startsWith('fr') ? 'fr' : 'en';
        const defaultLang = savedLang || browserLang;
        
        // 2. Aplicar idioma
        changeLanguage(defaultLang);
        
        // 3. Mostrar página
        document.body.classList.replace('preload', 'loaded');
        
        console.log("Página completamente cargada");
    });
    </script>
</body>
</html>
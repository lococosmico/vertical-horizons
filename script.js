/* ===== ESTILOS GENERALES ===== */
body {
    margin: 0;
    padding: 0;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    color: #fff;
    background: linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('../img/fondo.jpg') center/cover fixed no-repeat;
    line-height: 1.6;
}

.content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

/* ===== PRELOADER ===== */
#preloader {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: #2c3e50;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
    transition: opacity 0.5s ease;
}

/* ===== HEADER Y NAVEGACIÓN ===== */
header {
    padding: 2rem 0;
    text-align: center;
    position: relative;
}

nav ul {
    list-style: none;
    padding: 0;
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-top: 1rem;
}

nav a {
    color: #fff;
    text-decoration: none;
    font-weight: 600;
    padding: 5px 10px;
    border-radius: 4px;
    transition: background-color 0.3s;
}

nav a:hover, nav a.active {
    background-color: rgba(255, 255, 255, 0.2);
}

/* ===== SECCIONES ===== */
.content-section {
    padding: 2rem 0;
    margin: 2rem 0;
    display: none; /* Oculto por defecto */
}

.content-section.active-section {
    display: block; /* Mostrar sección activa */
}

h2, h3 {
    color: #e74c3c;
    margin-bottom: 1rem;
}

/* ===== GALERÍA ===== */
.gallery-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
    margin-top: 20px;
}

.gallery-container img {
    width: 100%;
    height: 250px;
    object-fit: cover;
    border-radius: 8px;
    transition: transform 0.3s ease;
    cursor: pointer;
}

.gallery-container img:hover {
    transform: scale(1.03);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

/* ===== FORMATION ===== */
.formation-container {
    display: flex;
    flex-wrap: wrap;
    gap: 30px;
    background: rgba(0, 0, 0, 0.6);
    padding: 30px;
    border-radius: 10px;
    margin-top: 20px;
}

.formation-image {
    flex: 1;
    min-width: 300px;
}

.formation-image img {
    width: 100%;
    max-height: 400px;
    object-fit: cover;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
}

.formation-text {
    flex: 1;
    min-width: 300px;
}

/* ===== BOTONES ===== */
.back-button {
    display: inline-block;
    margin-top: 20px;
    padding: 10px 20px;
    background-color: #e74c3c;
    color: white;
    border: none;
    border-radius: 5px;
    font-weight: bold;
    cursor: pointer;
    transition: background-color 0.3s;
}

.back-button:hover {
    background-color: #c0392b;
}

.language-switcher {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 1000;
    display: flex;
    gap: 10px;
}

.language-switcher button {
    background: rgba(255, 255, 255, 0.2);
    border: 1px solid #fff;
    color: #fff;
    padding: 8px 15px;
    border-radius: 5px;
    cursor: pointer;
    transition: all 0.3s;
}

.language-switcher button:hover {
    background: rgba(255, 255, 255, 0.3);
}

/* ===== FORMULARIO ===== */
form {
    max-width: 500px;
    margin: 0 auto;
}

input, textarea {
    width: 100%;
    padding: 12px;
    margin-bottom: 15px;
    border: 1px solid #ddd;
    border-radius: 5px;
    font-size: 1rem;
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
}

button[type="submit"] {
    background-color: #e74c3c;
    color: white;
    border: none;
    padding: 12px 25px;
    font-size: 1rem;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s;
}

button[type="submit"]:hover {
    background-color: #c0392b;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 768px) {
    .formation-container {
        flex-direction: column;
    }
    
    nav ul {
        flex-direction: column;
        gap: 10px;
    }
    
    .gallery-container {
        grid-template-columns: 1fr;
    }
}
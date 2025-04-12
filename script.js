<style>
    /* ...existing code... */
    .gallery-container img {
        max-width: 100%;
        max-height: 300px; /* Limita la altura máxima */
        height: auto;
        display: block;
        margin: 0 auto;
        object-fit: cover; /* Ajusta la imagen sin deformarla */
    }
    .gallery-container {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        justify-content: center;
    }
    /* ...existing code... */
</style>
<!-- ...existing code... -->

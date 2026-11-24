// Safe fallback until a real local/CI Supabase URL and publishable key are configured.
document.addEventListener('DOMContentLoaded', () => {
  const note = 'Le service sécurisé n’est pas encore configuré. Aucune donnée n’a été envoyée ni enregistrée.';
  document.querySelectorAll('.auth-box').forEach((box) => {
    const notice = document.createElement('p');
    notice.className = 'form-message error';
    notice.setAttribute('role', 'status');
    notice.textContent = note;
    box.insertBefore(notice, box.querySelector('form'));
    box.querySelectorAll('button[type="submit"]').forEach((button) => { button.disabled = true; });
  });
  document.querySelectorAll('form').forEach((form) => form.addEventListener('submit', (event) => {
    event.preventDefault();
    const status = form.querySelector('[role="status"]');
    if (status) { status.textContent = note; status.hidden = false; status.classList.add('error'); }
  }));
  const app = document.querySelector('#app');
  if (app) app.innerHTML = `<h1>Service en préparation</h1><p class="form-message" role="status">${note}</p><a class="button button-primary" href="index.html">Retour à My Progress</a>`;
});

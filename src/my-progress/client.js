import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(__SUPABASE_URL__, __SUPABASE_PUBLISHABLE_KEY__, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
});

export function safeMessage(error) {
  const allowed = [
    'Invalid login credentials', 'Email not confirmed', 'User already registered',
    'Password should be at least 8 characters', 'New password should be different from the old password',
    'Auth session missing!', 'No active coach relationship', 'Coaching access is not configured',
    'Les mots de passe ne correspondent pas.', 'Les niveaux doivent être au format JSON objet, par exemple {"voie":"6a","bloc":"6B"}.',
    'L’activité et ses données structurées ont été enregistrées, mais la photo reste à ajouter. Le formulaire est conservé : réessayez la photo avant de quitter.',
    'Les métadonnées de la photo n’ont pas été enregistrées et le nettoyage doit être repris en supprimant cette activité.',
  ];
  return allowed.find((message) => error?.message?.includes(message)) || 'Une erreur est survenue. Vérifiez votre connexion et réessayez.';
}

export async function requireSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
}

V25 : correction du masquage persistant.

Cause corrigée :
- le bouton masquait la ligne via status="hidden",
- mais la sauvegarde Supabase envoyait hidden=false.
- maintenant le champ hidden Supabase est alimenté depuis le statut réel de la ligne.

Prérequis Supabase déjà fait :
alter table expenses add column if not exists hidden boolean default false;

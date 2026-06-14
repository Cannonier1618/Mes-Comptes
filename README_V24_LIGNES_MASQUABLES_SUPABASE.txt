V24 : lignes masquables sauvegardées dans Supabase.

IMPORTANT : avant d'utiliser cette version, lancer dans Supabase SQL Editor :

alter table expenses
add column if not exists hidden boolean default false;

Puis uploader les fichiers sur GitHub.

Le bouton ○ / ◉ permet de retirer une ligne des calculs sans la supprimer.

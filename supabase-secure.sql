-- Mes Comptes: rattache les lignes existantes au compte propriétaire, puis active RLS.
-- Avant exécution: remplace l’adresse ci-dessous par celle utilisée pour le lien de connexion.
-- Crée d’abord le compte en te connectant une première fois à l’application.
BEGIN;

ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

DO $$
DECLARE
  owner_id uuid;
  matching_users integer;
BEGIN
  SELECT count(*), min(id::text)::uuid
    INTO matching_users, owner_id
    FROM auth.users
   WHERE lower(email) = lower('REMPLACER_PAR_TON_ADRESSE_EMAIL');

  IF matching_users <> 1 THEN
    RAISE EXCEPTION 'Il faut exactement un compte Auth correspondant à l’adresse configurée; trouvé: %', matching_users;
  END IF;

  UPDATE public.expenses SET user_id = owner_id WHERE user_id IS NULL;
  UPDATE public.settings SET user_id = owner_id WHERE user_id IS NULL;
END $$;

ALTER TABLE public.expenses ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.settings ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.expenses, public.settings FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.expenses, public.settings TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.expenses_id_seq TO authenticated;

DROP POLICY IF EXISTS "owner reads expenses" ON public.expenses;
DROP POLICY IF EXISTS "owner inserts expenses" ON public.expenses;
DROP POLICY IF EXISTS "owner updates expenses" ON public.expenses;
DROP POLICY IF EXISTS "owner deletes expenses" ON public.expenses;
CREATE POLICY "owner reads expenses" ON public.expenses FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "owner inserts expenses" ON public.expenses FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "owner updates expenses" ON public.expenses FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "owner deletes expenses" ON public.expenses FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "owner reads settings" ON public.settings;
DROP POLICY IF EXISTS "owner inserts settings" ON public.settings;
DROP POLICY IF EXISTS "owner updates settings" ON public.settings;
DROP POLICY IF EXISTS "owner deletes settings" ON public.settings;
CREATE POLICY "owner reads settings" ON public.settings FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "owner inserts settings" ON public.settings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "owner updates settings" ON public.settings FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "owner deletes settings" ON public.settings FOR DELETE TO authenticated USING (auth.uid() = user_id);

COMMIT;
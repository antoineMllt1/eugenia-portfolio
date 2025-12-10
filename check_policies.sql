-- Vérifier toutes les politiques RLS créées
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename IN ('conversations', 'conversation_participants')
  AND schemaname = 'public'
ORDER BY tablename, cmd;



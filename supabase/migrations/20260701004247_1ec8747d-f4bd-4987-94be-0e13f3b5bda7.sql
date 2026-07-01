REVOKE EXECUTE ON FUNCTION public.get_table_counts() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_table_counts() TO service_role;

-- Create a function to get row counts for all public tables
CREATE OR REPLACE FUNCTION public.get_table_counts()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_object_agg(table_name, row_count)
  INTO result
  FROM (
    SELECT 
      t.table_name,
      (SELECT count(*) FROM information_schema.columns WHERE table_schema = 'public' AND table_name = t.table_name) AS row_count
    FROM information_schema.tables t
    WHERE t.table_schema = 'public' 
      AND t.table_type = 'BASE TABLE'
  ) counts;
  
  RETURN COALESCE(result, '{}'::json);
END;
$$;

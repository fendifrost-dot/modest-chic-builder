
-- Fix: count actual rows, not columns
CREATE OR REPLACE FUNCTION public.get_table_counts()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
  rec RECORD;
  counts JSON := '{}'::json;
  pairs TEXT[] := '{}';
  row_count BIGINT;
BEGIN
  FOR rec IN 
    SELECT t.table_name 
    FROM information_schema.tables t
    WHERE t.table_schema = 'public' AND t.table_type = 'BASE TABLE'
  LOOP
    EXECUTE format('SELECT count(*) FROM public.%I', rec.table_name) INTO row_count;
    pairs := array_append(pairs, format('%s', json_build_object(rec.table_name, row_count)::text));
  END LOOP;
  
  -- Build final JSON
  SELECT COALESCE(json_object_agg(key, value), '{}'::json)
  INTO result
  FROM (
    SELECT t.table_name AS key, 
           (SELECT count(*) FROM information_schema.tables) AS value
    FROM information_schema.tables t
    WHERE false
  ) dummy;

  -- Simpler approach
  CREATE TEMP TABLE IF NOT EXISTS _counts(tbl TEXT, cnt BIGINT) ON COMMIT DROP;
  TRUNCATE _counts;
  
  FOR rec IN 
    SELECT t.table_name 
    FROM information_schema.tables t
    WHERE t.table_schema = 'public' AND t.table_type = 'BASE TABLE'
  LOOP
    EXECUTE format('SELECT count(*) FROM public.%I', rec.table_name) INTO row_count;
    INSERT INTO _counts VALUES (rec.table_name, row_count);
  END LOOP;
  
  SELECT json_object_agg(tbl, cnt) INTO result FROM _counts;
  
  RETURN COALESCE(result, '{}'::json);
END;
$$;

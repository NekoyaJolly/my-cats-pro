\pset pager off
\timing on

\echo 'Collecting sample filter values for pedigree queries'
WITH samples AS (
  SELECT
    COALESCE((SELECT breed_code FROM pedigrees WHERE breed_code IS NOT NULL LIMIT 1), 0) AS breed_code,
    COALESCE((SELECT coat_color_code FROM pedigrees WHERE coat_color_code IS NOT NULL LIMIT 1), 0) AS coat_color_code,
    COALESCE((SELECT gender_code FROM pedigrees WHERE gender_code IS NOT NULL LIMIT 1), 0) AS gender_code,
    COALESCE((SELECT eye_color FROM pedigrees WHERE eye_color IS NOT NULL LIMIT 1), '') AS eye_color,
    COALESCE((SELECT owner_name FROM pedigrees WHERE owner_name IS NOT NULL LIMIT 1), '') AS owner_name
)
SELECT * FROM samples;
\gset ped_

\echo '1) Cats pagination query (created_at index)'
EXPLAIN (ANALYZE, BUFFERS)
SELECT id, name, created_at
FROM cats
WHERE is_in_house = true
  AND is_graduated = false
ORDER BY created_at DESC
LIMIT 50;

\echo '2) Cats incremental sync query (updated_at index)'
EXPLAIN (ANALYZE, BUFFERS)
SELECT id, updated_at
FROM cats
WHERE updated_at >= NOW() - INTERVAL '30 days'
ORDER BY updated_at DESC
LIMIT 50;

\echo '3) Pedigree equality filters with registration_date ordering'
EXPLAIN (ANALYZE, BUFFERS)
SELECT id, pedigree_id, registration_date
FROM pedigrees
WHERE breed_code = :ped_breed_code
  AND coat_color_code = :ped_coat_color_code
  AND gender_code = :ped_gender_code
ORDER BY registration_date DESC
LIMIT 50;

\echo '4) Pedigree eye color / owner filters with created_at ordering'
EXPLAIN (ANALYZE, BUFFERS)
SELECT id, pedigree_id, owner_name
FROM pedigrees
WHERE eye_color = :'ped_eye_color'
  OR owner_name = :'ped_owner_name'
ORDER BY created_at DESC
LIMIT 50;

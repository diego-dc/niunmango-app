-- Create "Ahorro" category for each existing user
-- This category will be automatically assigned to transfers to SAVINGS accounts

INSERT INTO "Category" (id, name, "userId")
SELECT
  gen_random_uuid(),
  'Ahorro',
  id
FROM "User"
WHERE NOT EXISTS (
  SELECT 1 FROM "Category"
  WHERE "Category"."userId" = "User".id
  AND "Category".name = 'Ahorro'
);

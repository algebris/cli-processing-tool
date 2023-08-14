WITH "boat_characteristics_with_boat" AS (
  SELECT
    "boat_characteristics".*,
    "boat"."company_id" AS "company_id"
  FROM "boat_characteristics"
  LEFT OUTER JOIN "boat"
    ON "boat"."boat_characteristics_id" = "boat_characteristics"."id"
)
SELECT
  "company_shipyard".*,
  "name",
  "legal_name",
  "is_active",
  "models_count",
  "type",
  "country"."title_en" AS "country",
  B."max_length_oa" AS "max_length_oa",
  B."min_length_oa" AS "min_length_oa",
  "median_length",
  ARRAY(SELECT "name" FROM "series" WHERE "id" = ANY("company_shipyard"."series_ids")) AS "series_names",
  ARRAY(SELECT "title_en" FROM "model_category" WHERE "id" = ANY("company_shipyard"."categories_ids")) AS "model_categories",
  CASE WHEN "models_count" = 0
    THEN (
      SELECT COUNT(*)
      FROM "boat" AS b
      WHERE b."company_id" = "company_shipyard"."id"
        AND b."is_published" = true
        AND b."is_discontinued" = true
    )::integer
    ELSE NULL
  END AS "notActualBoatsCount",
  CASE WHEN (
    SELECT COUNT(*)
    FROM "boat" AS b
    WHERE b."company_id" = "company_shipyard"."id"
      AND b."is_published" = true
      AND b."is_discontinued" = true
  ) IS NOT NULL
  THEN ARRAY(
  SELECT mc.title_en
  FROM (
    SELECT j.value::text::integer AS category_id, count(*) AS count
    FROM boat b
    JOIN boat_eav be
      ON b.id = be.boat_id
    CROSS JOIN jsonb_array_elements_text(be.value::jsonb) j
    WHERE b.company_id = "company_shipyard"."id"
      AND b.is_published = true
      AND b.is_discontinued = true
      AND be.attribute = 'model_categories_ids'
    GROUP BY j.value::text::integer
    ORDER BY count(*) DESC
  ) iq
  JOIN model_category mc
    ON iq.category_id = mc.id
  WHERE iq.count > 0
  )
       ELSE ARRAY[]::varchar[]
  END AS "notActualBoatCategories"
FROM "company_shipyard"
LEFT JOIN (
  SELECT
    "boat_characteristics_with_boat"."company_id",
    MAX("length_oa") AS "max_length_oa",
    MIN("length_oa") AS "min_length_oa",
    AVG("length_oa") AS "avg_length_oa"
  FROM "boat_characteristics_with_boat"
  GROUP BY "boat_characteristics_with_boat"."company_id"
) B ON "company_shipyard"."id" = B."company_id"
LEFT OUTER JOIN "country"
  ON "company_shipyard"."country_id" = "country"."id"
WHERE
  "is_active" IS true
  AND "company_shipyard"."country_id" <> $1
  AND "avg_length_oa" IS NOT NULL
  -- REPLACE_THIS_WITH_ID
GROUP BY
  "company_shipyard"."id",
  "country"."title_en",
  B."max_length_oa",
  B."min_length_oa";

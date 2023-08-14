-- This is a first query for models
-- Please check Notion for details
-- https://www.notion.so/ibgroup/itBoat-AI-Advisor-MVP-3d49e17c35c343b281a96ce18ccf39f3?pvs=4#e76f8046ff974802abb85783c8bca779
-- !!! REPLACE_THIS_WITH_ID used to be replaced with a baot id from @/db
-- TODO: move it to ORM, select only required fields

SELECT
  "boat".id as "boat_id",
  "boat".type,
  "boat".company_id,
  "company_shipyard".name as "shipyard_name",
  "boat".name_en,
  "boat".year_from,
  "boat".year_to,
  "boat".price_id,
  "boat".is_discontinued,
  "boat".is_best,
  "boat".is_vintage,
  "boat".is_published,
  "boat".boat_characteristics_id,
  "boat".model_categories_ids,
  "boat".model_categories_ids[$1] as "main_category",
  "boat".alias,
  "boat".description_en,
  "boat_characteristics".*,
  "price".*,
  "model_category".*
FROM "boat"
LEFT OUTER JOIN "company_shipyard"
  ON "boat"."company_id" = "company_shipyard"."id"
LEFT OUTER JOIN "boat_characteristics"
  ON "boat"."boat_characteristics_id" = "boat_characteristics"."id"
LEFT OUTER JOIN "price"
  ON "boat"."price_id" = "price"."id"
LEFT OUTER JOIN "model_category"
  ON "boat".model_categories_ids[$1] = "model_category"."id"
WHERE
  "public"."boat"."is_published" = TRUE AND
  "public"."company_shipyard"."is_published" = TRUE AND
  "public"."company_shipyard"."country_id" <> $2
  -- REPLACE_THIS_WITH_ID
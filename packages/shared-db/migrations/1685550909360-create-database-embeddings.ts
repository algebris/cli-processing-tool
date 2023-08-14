import { MigrationInterface, QueryRunner } from "typeorm"

export class CreateDatabaseEmbeddings1685550909360 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM pg_type WHERE typname = 'database_embeddings_boat_model_type_enum'
        ) THEN
            CREATE TYPE "database_embeddings_boat_model_type_enum" AS ENUM ('motor_yacht', 'sailing_yacht', 'power_boat');
        END IF;
      END$$;

      DO $$BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM pg_type WHERE typname = 'database_embeddings_entity_type_enum'
        ) THEN
            CREATE TYPE "database_embeddings_entity_type_enum" AS ENUM ('boat', 'shipyard', 'category');
        END IF;
      END$$;

      CREATE TABLE IF NOT EXISTS "database_embeddings" (
          "id" BIGSERIAL NOT NULL,
          "entity_id" integer NOT NULL,
          "entity_type" "database_embeddings_entity_type_enum" NOT NULL,
          "boat_model_type" "database_embeddings_boat_model_type_enum",
          "title" character varying NOT NULL,
          "text" character varying NOT NULL,
          "text_length" integer NOT NULL,
          "tokens" integer,
          "embeddings" vector,
          CONSTRAINT "UQ_15ed2a389dd859747dac3583f08" UNIQUE ("entity_id"),
          CONSTRAINT "PK_be0da9168c06a965c36cd53255b" PRIMARY KEY ("id")
        );

        CREATE OR REPLACE FUNCTION db_search (
          query_embedding vector(1536),
          similarity_threshold float,
          match_count int
        ) RETURNS TABLE (
          id bigint,
          entity_id integer,
          entity_type database_embeddings_entity_type_enum,
          boat_model_type database_embeddings_boat_model_type_enum,
          title character varying,
          text character varying,
          tokens integer,
          similarity float
        )
        LANGUAGE PLPGSQL
        AS $$
        BEGIN
          RETURN QUERY
          SELECT
              database_embeddings.id,
              database_embeddings.entity_id,
              database_embeddings.entity_type,
              database_embeddings.boat_model_type,
              database_embeddings.title,
              database_embeddings.text,
              database_embeddings.tokens,
              1 - (database_embeddings.embeddings <=> query_embedding) AS similarity
          FROM database_embeddings
          WHERE 1 - (database_embeddings.embeddings <=> query_embedding) > similarity_threshold
          ORDER BY database_embeddings.embeddings <=> query_embedding
          LIMIT match_count;
        END;
        $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS database_embeddings;
      DROP FUNCTION IF EXISTS db_search;
      DROP TYPE IF EXISTS database_embeddings_entity_type_enum;
      DROP TYPE IF EXISTS database_embeddings_boat_model_type_enum;
    `);
  }
}

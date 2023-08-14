import { MigrationInterface, QueryRunner } from "typeorm"

export class CreateDocumentEmbeddingsTable1683836945670 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_type WHERE typname = 'document_embeddings_document_type_enum'
        ) THEN
          CREATE TYPE document_embeddings_document_type_enum AS ENUM ('pdf');
        END IF;
      END$$;

      CREATE TABLE IF NOT EXISTS "document_embeddings"
      (
          id BIGSERIAL NOT NULL,
          "document_name" character varying NOT NULL,
          "document_type" "document_embeddings_document_type_enum" NOT NULL DEFAULT 'pdf',
          page_number integer NOT NULL,
          title character varying NOT NULL,
          raw_text character varying NOT NULL,
          font character varying NOT NULL,
          is_summarized boolean,
          processed_text character varying,
          text_length integer,
          tokens integer,
          embeddings vector(1536),
          CONSTRAINT "PK_a544f56a62c3bd971e68fc6d211" PRIMARY KEY ("id")
      );

      CREATE OR REPLACE FUNCTION doc_search (
        query_embedding vector(1536),
        similarity_threshold float,
        match_count int
      ) RETURNS TABLE (
        id bigint,
        document_name character varying,
        page_number integer,
        title character varying,
        processed_text character varying,
        tokens integer,
        similarity float
      )
      LANGUAGE PLPGSQL
      AS $$
      BEGIN
        RETURN QUERY
        SELECT
          document_embeddings.id,
          document_embeddings.document_name,
          document_embeddings.page_number,
          document_embeddings.title,
          document_embeddings.processed_text,
          document_embeddings.tokens,
          1 - (document_embeddings.embeddings <=> query_embedding) AS similarity
        FROM document_embeddings
        WHERE 1 - (document_embeddings.embeddings <=> query_embedding) > similarity_threshold
        ORDER BY document_embeddings.embeddings <=> query_embedding
        LIMIT match_count;
      END;
      $$;
    `);      
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS document_embeddings;
      DROP FUNCTION IF EXISTS doc_search;
      DROP TYPE IF EXISTS document_embeddings_document_type_enum;
    `);
  }
}

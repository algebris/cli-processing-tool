import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

export enum DocumentType {
  PDF = 'pdf'
}

@Entity({ name: 'document_embeddings' })
export class DocumentEmbedding {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'document_name',
  })
  documentName: string;

  @Column({
    name: 'document_type',
    type: 'enum',
    enum: DocumentType,
    default: DocumentType.PDF
  })
  documentType: DocumentType

  @Column({
    name: 'page_number'  
  })
  pageNumber: number;

  @Column()
  title: string;

  @Column({
    name: 'raw_text'
  })
  rawText: string;

  @Column()
  font: string;

  @Column({
    name: 'is_summarized',
    nullable: true
  })
  isSummarized: boolean;

  @Column({
    name: 'processed_text',
    nullable: true,
  })
  processedText: string;

  @Column({
    name: 'text_length',
    nullable: true,
  })
  textLength: number;

  @Column({
    nullable: true
  })
  tokens: number;

  @Column({
    nullable: true,
  })
  embeddings: string;
}

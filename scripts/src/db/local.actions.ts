import {
  DatabaseEmbedding,
  db,
  InsertResult,
  DocumentEmbedding,
  SelectQueryBuilder,
  ObjectLiteral,
  ObjectType,
  SaveTemplateToDbOptions,
} from '@/db';
import { QueryTypes } from './types';
import { OperationObject } from '@/utils';
import { DeleteResult, Like } from 'typeorm';

export const saveTemplateToDb = (
  data: Partial<DocumentEmbedding> | Partial<DocumentEmbedding>[],
  opts?: SaveTemplateToDbOptions
): Promise<InsertResult> => {
  const repository = db.getRepository(DatabaseEmbedding);
  const queryBuilder = repository.createQueryBuilder('entity');
  const query = queryBuilder.insert().into(DatabaseEmbedding).values(data);

  if (opts && opts.rewriteDb) {
    query.orUpdate(['entity_type', 'boat_model_type', 'title', 'text', 'text_length', 'tokens'], ['entity_id']); //TODO: extract fields dynamically from DatabaseEmbedding
  } else {
    query.orIgnore();
  }
  return query.execute();
};

export const savePdfToDb = async (
  data: Partial<DocumentEmbedding> | Partial<DocumentEmbedding>[],
  opts?: SaveTemplateToDbOptions
) => {
  const documentName = Array.isArray(data) ? data[0]?.documentName : data.documentName;
  const queryRunner = db.createQueryRunner();
  await queryRunner.connect();

  await queryRunner.startTransaction();

  try {
    const insertData = queryRunner.manager.createQueryBuilder().insert().into(DocumentEmbedding).values(data);
    const counter = await queryRunner.manager.countBy(DocumentEmbedding, {
      documentName: Like(documentName || ''),
    });

    if (!counter) {
      const cnt = await insertData.execute();
      console.log(`Inserted ${cnt.raw.length} rows`);
    }

    if (counter && opts?.rewriteDb) {
      await queryRunner.manager.delete(DocumentEmbedding, { documentName: Like(documentName) });
      console.log(`Deleted ${counter} rows with the name '${documentName}'.`);
      const cnt = await insertData.execute();
      console.log(`Inserted ${cnt.raw.length} rows`);
    }
    if (counter && !opts?.rewriteDb) {
      console.log(`Data from file '${documentName}' already exists in DB. Use -rw to force rewriting the data.`);
    }
    await queryRunner.commitTransaction();
  } catch (err) {
    await queryRunner.rollbackTransaction();
    throw err;
  } finally {
    await queryRunner.release();
  }
};

export const getRowsForUpdateByRange = <T extends ObjectLiteral>(
  EntityClass: ObjectType<T>,
  ranges: OperationObject[],
  callback: (document: T) => Promise<void>,
  where?: (query: SelectQueryBuilder<T>) => void
): Promise<T[]> =>
  transactionalQuery(
    EntityClass,
    (query) => {
      ranges.forEach((rs, index) => {
        if (rs.operation === 'range') {
          query.orWhere(`doc.id BETWEEN :start${index} AND :end${index}`, {
            [`start${index}`]: rs.numbers[0],
            [`end${index}`]: rs.numbers[1],
          });
        } else {
          query.orWhere(`doc.id IN (:...numbers${index})`, { [`numbers${index}`]: rs.numbers });
        }
      });
      if (where) where(query);
    },
    callback
  );

export const getRowsForUpdateByFile = <T extends ObjectLiteral>(
  EntityClass: ObjectType<T>,
  fileName: string,
  callback: (document: T) => Promise<void>,
  where?: (query: SelectQueryBuilder<T>) => void,
  fileNameColumn = 'document_name'
) =>
  transactionalQuery(
    EntityClass,
    (query) => {
      query.where(`doc.${fileNameColumn} LIKE :pattern`, { pattern: `%${fileName}%` });
      if (where) where(query);
    },
    callback
  );

export const getRowsForAllUpdates = <T extends ObjectLiteral>(
  EntityClass: ObjectType<T>,
  callback: (document: T) => Promise<void>,
  where?: (query: SelectQueryBuilder<T>) => void,
  textColumn = 'processed_text'
) =>
  transactionalQuery(
    EntityClass,
    (query) => {
      query.where(`doc.${textColumn} IS NULL`);
      if (where) where(query);
    },
    callback
  );

const transactionalQuery = <T extends ObjectLiteral>(
  EntityClass: ObjectType<T>,
  selectConditions: (query: SelectQueryBuilder<T>) => void,
  updateConditions: (document: T) => Promise<void>
) =>
  db.transaction(async (manager) => {
    const repository = manager.getRepository<T>(EntityClass);
    const query = repository.createQueryBuilder('doc');

    selectConditions(query);

    query.setLock('pessimistic_read');
    const documents = await query.getMany();
    console.log(query.getQuery());

    if (!documents.length) {
      console.log('No documents found in DB by given condition.');
    }

    await Promise.all(documents.map((doc) => updateConditions(doc).then(() => repository.save(doc))));
    return documents;
  });

export const textIsEmpty = (query: SelectQueryBuilder<DocumentEmbedding>) =>
  query.andWhere('doc.processed_text IS NULL');

export const deleteByEntityName = (entityType: QueryTypes): Promise<DeleteResult> => {
  const repository = db.getRepository(DatabaseEmbedding);
  return repository.delete({ entityType: entityType as any });
};

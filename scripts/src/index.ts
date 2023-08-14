import { isEmpty } from 'lodash';
import { initLocalDb, db } from '@/db';
import {
  convertPdf,
  buildEmbeddings,
  buildSummaries,
  processPdf,
  processAllPdf,
  buildPdfEmbeddings,
  deleteEntities,
  QueryTypes,
  EntityProcessorFactory,
  EntityProcessor,
} from '@/scenarios';
import commander, { program, Option } from 'commander';

program.name('npm start --').version('1.0.0').description('Toolkit for feeding DB and building GPT embeddings');

program
  .command('pdf')
  .description('Process PDF documents')
  .addOption(new Option('-a --all', 'Process all files').conflicts(['file', 'build']))
  .addOption(new Option('-s --summary <string>', 'Build summaries in DB').conflicts(['file', 'all', 'parse']))
  .addOption(new Option('-b --build <string>', 'Build embeddings in DB').conflicts(['file', 'all', 'parse']))
  .addOption(new Option('-f --file <string>', 'PDF file name').conflicts(['all', 'build']))
  .addOption(new Option('-p --parse', "Parse only, don't write to DB").conflicts(['all', 'build']))
  .addOption(new Option('-rw --rewrite-db', 'Update rows by document_name in DB').conflicts(['parse']))
  .action(async (opts, cmd) => {
    if (isEmpty(opts)) {
      cmd.addHelpText('after', '\n\nExample:\n\t npm start -- pdf -s 1064-1070,56,58,36-100');
      cmd.addHelpText('after', '\t npm start -- pdf -f 4529_Yacht_Brokerage_16_17_Module_1_.pdf');
      cmd.help();
    }
    if (opts.file && opts.parse) {
      const blocks = await convertPdf(opts.file);
      return console.log(blocks);
    }

    await initLocalDb();
    if (opts.file) {
      await processPdf(opts.file, { rewriteDb: !!opts.rewriteDb });
    }
    if (opts.all) {
      await processAllPdf({ rewriteDb: !!opts.rewriteDb });
    }
    if (opts.summary) {
      await buildSummaries(opts.summary, { rewriteDb: !!opts.rewriteDb });
    }
    if (opts.build) {
      await buildPdfEmbeddings(opts.build);
    }
    await db.destroy();
  });

program
  .command('db')
  .description('Perform remote SQL call via SSH to server')
  .addArgument(new commander.Argument('<query_type>', 'Remote DB query type').choices(Object.values(QueryTypes)))
  .addOption(new Option('-a --all', 'Process all entities').conflicts(['id', 'build']))
  .addOption(new Option('-b --build <string>', 'Build embeddings').conflicts(['all', 'id']))
  .addOption(new Option('-i --id <number>', 'Database entity id').argParser(parseInt).conflicts(['all', 'build']))
  .addOption(new Option('-q --query', "Query only, don't write to DB").conflicts(['all', 'build', 'rewriteDb']))
  .addOption(
    new Option('-d --delete', 'Delete records by entity_type').conflicts(['all', 'build', 'rewriteDb', 'query', 'id'])
  )
  .addOption(new Option('-rw --rewrite-db', 'Update rows if they are in the database by entity_id'))
  .action(async (query_type: QueryTypes, opts, cmd) => {
    if (isEmpty(opts) || (!opts.id && !opts.all && !opts.build && !opts.delete)) {
      cmd.addHelpText('after', '\n\nExample:\n\t npm start -- db boat -i 833').help();
    }
    await initLocalDb();

    if (opts.build && query_type) {
      await buildEmbeddings(query_type, opts.build);
    } else if (opts.delete) {
      const cnt = await deleteEntities(query_type);
      console.log(`Delete ${query_type} completed. ${cnt?.affected} rows deleted.`);
    } else {
      const factory = new EntityProcessorFactory();
      const entityProcessor = factory.createEntityProcessor(query_type, opts);
      const processor = new EntityProcessor(opts, entityProcessor);
      processor.process();
    }
    db.destroy();
  });

program.parse(process.argv);

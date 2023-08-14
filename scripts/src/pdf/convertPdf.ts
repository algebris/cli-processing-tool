import fs from 'node:fs';
import path from 'node:path';
import { omit } from 'lodash';
import { PDFBlock, Context } from './types';
import { emptyBlock, saveFile, dumpFile } from './utils';
import { Parsers, FILES_FOLDER, SHOULD_DUMP_RAW_PDF, SHOULD_DUMP_PROCESSED_PDF } from './config';

import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.js';
import { TextItem } from 'pdfjs-dist/types/src/display/api';

export const convertPdf2Txt = async (fileName: string): Promise<PDFBlock[]> => {
  const filePath = path.join(FILES_FOLDER, fileName);

  if (!fs.existsSync(filePath)) {
    throw new Error(`File ${fileName} does not exist in /files folder.`);
  }
  const doc = await pdfjsLib.getDocument(filePath).promise; // Load pdf file
  const pageNum = doc.numPages as number; // Get number of all pages
  const parseConfig = Parsers[fileName as keyof typeof Parsers]; // Get parse config for current file

  if (!parseConfig) {
    throw new Error(`No parser for file ${fileName} found. Please add it to Parsers object in /src/pdf/config.ts.`);
  }

  // Context for parsing
  const ctx: Context = {
    content: [] as PDFBlock[],
    currentBlock: emptyBlock(),
    fonts: parseConfig.fonts,
    exclude: parseConfig.exclude,
    pageCount: 0,
  };
  // Bind a context to the parse function so that the parser can fill in the context and the current block
  const parseFn = parseConfig.parse.bind(ctx);

  const parsePage = (page: TextItem[], pageCount: number) => {
    ctx.pageCount = pageCount;
    page.forEach(parseFn);
  };

  const processPdf = async (outputStream?: fs.WriteStream): Promise<void> => {
    // Go through all pages and parse them
    for (let i = 1; i <= pageNum; i++) {
      if (parseConfig.skipPages.includes(i)) continue;

      const page = await doc.getPage(i);
      const textContent = await page.getTextContent();

      parsePage(textContent.items as TextItem[], i);
      // discard "transform" as an unwieldy field for dump study
      outputStream && outputStream.write(JSON.stringify(textContent.items.map((el) => omit(el, 'transform'))));
    }
  };

  if (SHOULD_DUMP_RAW_PDF) {
    const outputFile = path.join(FILES_FOLDER, `${fileName}_dump.json`);
    await dumpFile(outputFile, processPdf);
  } else {
    await processPdf();
  }

  if (SHOULD_DUMP_PROCESSED_PDF) {
    const outputFile = path.join(FILES_FOLDER, `${fileName}.json`);
    const data = JSON.stringify(ctx.content);
    saveFile(outputFile, data);
  }
  return ctx.content;
};

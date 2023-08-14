import { isEmpty } from 'lodash';
import { TextItem } from 'pdfjs-dist/types/src/display/api';

import { Context } from './types';
import { whatIsFont, emptyBlock } from './utils';

export const parser1 = function (this: Context, item: TextItem): void {
  const { str, fontName } = item as TextItem;
  const text = str.trim();

  const { pageCount, fonts, exclude } = this;

  if (whatIsFont(fontName, fonts) === 'header' && text !== '•' && text !== `${pageCount}`) {
    if (!isEmpty(this.currentBlock.header)) {
      if (!isEmpty(exclude)) {
        exclude?.forEach(({ where, rule, page }) => {
          const pageMatch = page ? pageCount === page : true;
          const match = this.currentBlock[where].match(rule);
          if (!isEmpty(match) && pageMatch) {
            this.currentBlock = emptyBlock();
          }
        });
      }
      if (!isEmpty(this.currentBlock.content)) {
        this.content.push(this.currentBlock);
      }
      this.currentBlock = emptyBlock();
    }
    this.currentBlock = {
      ...emptyBlock(),
      page: pageCount,
      header: text,
      font: fontName,
    };
  } else if (whatIsFont(fontName, fonts) === 'paragraph' || text == '•') {
    if (text.length === 0) return;
    this.currentBlock.content += this.currentBlock.content ? ' ' + text : text;
  }
};

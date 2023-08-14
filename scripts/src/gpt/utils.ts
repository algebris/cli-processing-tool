/**
 * When we summarize text, sometimes we get a sentence that doesn't end with a point.
 * This function cuts off the sentence if it doesn't end with a point.
 */
export const cutOffIfSentenceHasNoPoint = (summary: string): string => {
  const lastChar = summary.trim().slice(-1);
  return lastChar === '.' ? summary : summary.slice(0, summary.lastIndexOf('.') + 1);
};

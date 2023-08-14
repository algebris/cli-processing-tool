import fs from 'node:fs';
import path from 'node:path';

export const readFile = (fileName: string): string => {
  const filePath = path.join(__dirname, '../', fileName);
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  const sql = fs.readFileSync(filePath, 'utf8');
  return sql;
};

type Operation = 'range' | 'sequence';

export interface OperationObject {
  operation: Operation;
  numbers: number[];
}

/**
 * A tool for parsing a range of integers. Performs aggregation and range crossing.
 * This is useful for selecting DB ID ranges.
 * E.g. 1-50,23,24,25,51,60,70,10-20
 * Returns an array
 * [
 *  { operation: 'range', numbers: [ 1, 51 ] },
 *  { operation: 'sequence', numbers: [ 60 ] },
 *  { operation: 'sequence', numbers: [ 70 ] }
 * ]
 *
 * @param  {string} prompt Range string
 * @returns OperationObject
 */
export function rangeBuilder(prompt: string): OperationObject[] {
  const segments = prompt.split(',');
  const uniqueNumbers = new Set<number>();

  for (const segment of segments) {
    const numbers = segment.split('-').map(Number);

    // For a range, add all numbers in the range
    if (numbers.length === 2) {
      for (let i = numbers[0]; i <= numbers[1]; i++) {
        uniqueNumbers.add(i);
      }
    } else {
      uniqueNumbers.add(numbers[0]);
    }
  }

  // Convert Set to sorted Array
  const sortedNumbers = Array.from(uniqueNumbers).sort((a, b) => a - b);
  const result: OperationObject[] = [];
  let currentNumbers = [sortedNumbers[0]];

  for (let i = 1; i < sortedNumbers.length; i++) {
    // If the current number is adjacent to the last number, continue the sequence/range
    if (sortedNumbers[i] === currentNumbers[currentNumbers.length - 1] + 1) {
      currentNumbers.push(sortedNumbers[i]);
    } else {
      // Add the completed sequence/range to the result
      result.push({
        operation: currentNumbers.length > 1 ? 'range' : 'sequence',
        numbers:
          currentNumbers.length > 1 ? [currentNumbers[0], currentNumbers[currentNumbers.length - 1]] : currentNumbers,
      });
      // Start a new sequence/range
      currentNumbers = [sortedNumbers[i]];
    }
  }

  // Add the final sequence/range to the result
  result.push({
    operation: currentNumbers.length > 1 ? 'range' : 'sequence',
    numbers:
      currentNumbers.length > 1 ? [currentNumbers[0], currentNumbers[currentNumbers.length - 1]] : currentNumbers,
  });

  return result;
}

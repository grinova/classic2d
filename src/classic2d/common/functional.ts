export function vector<T>(iterator: IterableIterator<T>): T[] {
  const result: T[] = [];
  while (true) {
    const next = iterator.next();
    if (!next.done) {
      result.push(next.value);
    } else {
      break;
    }
  }
  return result;
}

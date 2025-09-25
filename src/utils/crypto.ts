const bufferForMaxInt = new Map<number, Uint8Array>();

export function getSecureRandomInt(options: number) {
  let buffer = bufferForMaxInt.get(options);
  if (!buffer) {
    let uint8s = 1;
    let num = 256;
    while (num < options) {
      uint8s += 1;
      num *= 256;
    }
    buffer = new Uint8Array(uint8s);
    bufferForMaxInt.set(options, buffer);
  }
  crypto.getRandomValues(buffer);
  let multiplyBy = 1;
  let res = 0;
  for (let uint8 of buffer) {
    res += uint8 * multiplyBy;
    multiplyBy *= 256;
  }
  return res % options;
}

export function getRandomEntry<T>(array: T[]): T {
  return array[getSecureRandomInt(array.length)];
}

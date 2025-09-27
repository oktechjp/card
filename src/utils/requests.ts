function compareUint8(a: Uint8Array, b: Uint8Array): 1 | -1 | 0 {
  if (a.length !== b.length) {
    return a.length > b.length ? 1 : -1;
  }
  for (let i = 0; i < a.length; i++) {
    const ab = a[i];
    const bb = b[i];
    if (ab !== bb) {
      return ab > bb ? 1 : -1;
    }
  }
  return 0;
}

type RequestType = {
  request: Request;
  body?: Uint8Array<ArrayBuffer>;
};

export function compareFetchOption(a: RequestType, b: RequestType): 1 | -1 | 0 {
  const bool = _compareRequest(a.request, b.request);
  if (bool === true) {
    return 1;
  }
  if (bool === false) {
    return -1;
  }
  if (a.body !== b.body) {
    if (!a.body) {
      return -1;
    }
    if (!b.body) {
      return 1;
    }
    return compareUint8(a.body, b.body);
  }
  return 0;
}
export function compareHeaders(a: Headers, b: Headers): 1 | -1 | 0 {
  for (const [key, aValue] of a.entries()) {
    const bValue = b.get(key);
    if (bValue === null) {
      return 1;
    }
    if (aValue !== bValue) {
      return aValue > bValue ? 1 : -1;
    }
  }
  for (const key of b.keys()) {
    if (!a.has(key)) {
      return -1;
    }
  }
  return 0;
}

function _compareRequest(a: Request, b: Request): boolean | undefined {
  if (a.url !== b.url) {
    return a.url > b.url;
  }
  const h = compareHeaders(a.headers, b.headers);
  if (h !== 0) {
    return h === 1;
  }
  return a.credentials !== b.credentials
    ? a.credentials > b.credentials
    : a.integrity !== b.integrity
      ? a.integrity > b.integrity
      : a.method !== b.method
        ? a.method > b.method
        : a.mode !== b.mode
          ? a.mode > b.mode
          : a.redirect !== b.redirect
            ? a.redirect > b.redirect
            : a.referrer !== b.referrer
              ? a.referrer > b.referrer
              : a.referrerPolicy !== b.referrerPolicy
                ? a.referrerPolicy > b.referrerPolicy
                : undefined;
}

export async function uniqueRequests(input: Request[]) {
  const requests: RequestType[] = [];
  for (const request of input) {
    const method = request.method.toUpperCase();
    const body =
      method === "POST" || method === "PUT" || method === "PATCH"
        ? new Uint8Array(await request.arrayBuffer())
        : undefined;
    requests.push({ request, body });
  }
  const filtered = requests.reduce((requests, request) => {
    let found = false;
    for (const other of requests) {
      if (compareFetchOption(request, other) === 0) {
        found = true;
        break;
      }
    }
    if (!found) {
      requests.push(request);
    }
    return requests;
  }, [] as Array<RequestType>);
  return filtered.map(({ request, body }) => {
    if (body) {
      return new Request(request, { body });
    }
    return request;
  });
}

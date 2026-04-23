export function mergeHeaders(
  baseHeaders?: HeadersInit,
  extraHeaders?: HeadersInit,
): HeadersInit {
  return {
    ...(baseHeaders ?? {}),
    ...(extraHeaders ?? {}),
  };
}
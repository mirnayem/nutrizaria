export interface PaginationQuery {
  page?: number;
  limit?: number;
  cursor?: string;
}

export interface ParsedPagination {
  mode: 'offset' | 'cursor';
  limit: number;
  page?: number;
  cursor?: string;
  skip: number;
  take: number;
  prismaCursor?: { id: string };
  skipCursor: boolean;
}

export interface PaginationMeta {
  total?: number;
  page?: number;
  limit: number;
  totalPages?: number;
  hasMore: boolean;
  nextCursor: string | null;
  prevCursor: string | null;
}
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

/**
 * Parses pagination inputs into either offset (page/limit) or cursor
 * (cursor/limit) mode. Cursor mode takes precedence when a cursor is provided.
 */
export function parsePagination(query: PaginationQuery, defaultLimit = DEFAULT_LIMIT): ParsedPagination {
  const limit = clamp(Math.floor(query.limit ?? defaultLimit), 1, MAX_LIMIT);
  const cursor = query.cursor?.trim();

  if (cursor) {
    return {
      mode: 'cursor',
      limit,
      cursor,
      skip: 0,
      take: limit + 1, // fetch one extra item to detect next
      skipCursor: true,
    };
  }

  const page = Math.max(1, Math.floor(query.page ?? 1));
  const skip = (page - 1) * limit;
  return { mode: 'offset', limit, page, skip, take: limit, skipCursor: false };
}

/**
 * Builds a response from fetched items. In cursor mode pass `take + 1` items
 * (the extra item indicates whether another page exists). `hasMore` and
 * `nextCursor` are always computed; offset metadata is included only when
 * offset mode is used (total/count supplied).
 */
export function buildPaginationResult<T extends { id: string }>(
  rawItems: T[],
  parsed: ParsedPagination,
  count?: number,
): { items: T[]; meta: PaginationMeta } {
  if (parsed.mode === 'cursor') {
    const hasMore = rawItems.length === parsed.take;
    const items = rawItems.slice(0, parsed.limit);
    const last = items[items.length - 1];
    return {
      items,
      meta: {
        limit: parsed.limit,
        hasMore,
        nextCursor: hasMore && last ? last.id : null,
        prevCursor: parsed.cursor ?? null,
      },
    };
  }

  const total = count ?? rawItems.length ?? 0;
  const totalPages = Math.ceil(total / parsed.limit);
  const last = rawItems[rawItems.length - 1];
  return {
    items: rawItems,
    meta: {
      total,
      page: parsed.page,
      limit: parsed.limit,
      totalPages,
      hasMore: (parsed.page ?? 1) < totalPages,
      nextCursor: last ? last.id : null,
      prevCursor: null,
    },
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
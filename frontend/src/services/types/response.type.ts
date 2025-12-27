export interface BackendResponse<T> {
  code: number;
  msg: string;
  data: T;
}

export interface PaginationLinks {
  first: string;
  last: string;
  self: string;
  next: string | null;
  prev: string | null;
}

export interface PageData<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  total_pages: number;
  links: PaginationLinks;
}

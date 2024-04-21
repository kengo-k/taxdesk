export interface PagingRequest {
  page_no?: number;
  page_size?: number;
}

export interface PagingResponse {
  all_count: number;
  from_count: number;
  to_count: number;
  page_count: number;
}

export function getPagingOffset(paging: PagingRequest) {
  if (paging.page_no == null || paging.page_size == null) {
    return 0;
  }
  return (paging.page_no - 1) * paging.page_size;
}

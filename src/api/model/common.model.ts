/**
 * API响应基类
 */
export interface ApiResponse<T = any> {
  data: T;
  status: boolean;
  message: string | null;
  statusCode: number;
}

/**
 * 分页响应数据
 */
export interface PaginationData<T = any> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * 带分页的API响应
 */
export interface PaginatedResponse<T = any> extends ApiResponse<PaginationData<T>> {
} 
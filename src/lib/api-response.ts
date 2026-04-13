export type ApiSuccess<T> = {
  success: true;
  data: T;
  message?: string;
};

export type ApiErrorResponse = {
  success: false;
  error: string;
  details?: unknown;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiErrorResponse;

export function successResponse<T>(
  data: T,
  message = "Success"
): ApiSuccess<T> {
  return {
    success: true,
    data,
    message,
  };
}

export function errorResponse(
  error: string,
  details?: unknown
): ApiErrorResponse {
  return {
    success: false,
    error,
    details,
  };
}
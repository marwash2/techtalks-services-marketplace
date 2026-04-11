// src/lib/api-handler.ts

import { ApiError } from "./api-error";
import { errorResponse } from "./api-response";

export function withApiHandler(
  handler: (req: Request) => Promise<Response>
) {
  return async (req: Request) => {
    try {
      return await handler(req);
    } catch (err) {
      if (err instanceof ApiError) {
        return Response.json(
          errorResponse(err.message, err.details),
          { status: err.statusCode }
        );
      }

      return Response.json(
        errorResponse("Internal Server Error"),
        { status: 500 }
      );
    }
  };
}
import { ApiError } from "./api-error";
import { errorResponse } from "./api-response";
import { ZodError } from "zod";

export function withApiHandler(
  handler: (req: Request, context?: any) => Promise<Response>
) {
  return async (req: Request, context?: any) => {
    try {
      return await handler(req, context);
    } catch (err) {
      if (err instanceof ZodError) {
        return Response.json(
          errorResponse(
            "Validation failed",
            err.issues.map((e) => ({
              field: e.path.join("."),
              message: e.message,
            }))
          ),
          { status: 422 }
        );
      }

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
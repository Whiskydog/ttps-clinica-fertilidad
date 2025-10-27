import { ZodError } from "zod";

export class ValidationError extends ZodError {
  constructor({ fieldName, message }: { fieldName: string; message: string }) {
    super([
      {
        code: "custom",
        path: [fieldName],
        message: message,
      },
    ]);
    this.name = "ValidationError";
  }
}

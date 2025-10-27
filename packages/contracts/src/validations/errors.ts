import { ZodError } from "zod";

export class ValidationError extends ZodError {
  constructor() {
    super([]);
    this.name = "ValidationError";
  }

  addCustomIssue({ fieldName, message }: { fieldName: string; message: string }) {
    this.issues.push({
      code: "custom",
      path: [fieldName],
      message,
    });
  }
}

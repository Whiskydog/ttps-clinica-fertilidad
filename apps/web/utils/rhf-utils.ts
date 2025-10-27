import { ValidationError } from "@repo/contracts";
import { FieldValues, Path, UseFormSetError } from "react-hook-form";

export function setValidationErrors<T extends FieldValues>(
  errors: ValidationError["issues"],
  setError: UseFormSetError<T>,
  shouldFocus: boolean = false
) {
  for (const error of errors) {
    setError(
      error.path[0] as Path<T>,
      { message: error.message },
      { shouldFocus }
    );
  }
}

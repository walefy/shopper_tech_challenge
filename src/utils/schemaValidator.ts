import { ZodError, ZodSchema } from 'zod';

type ValidationResult = {
  valid: boolean;
  error: string | null;
};

export const validateSchema = (schema: ZodSchema<any>, data: unknown): ValidationResult => {
  try {
    schema.parse(data);
    return { valid: true, error: null };
  } catch (error) {
    if (error instanceof ZodError) {
      const errors = error.errors.map((err) => {
        return err.message + ' at ' + err.path.join('.');
      });
      return { valid: false, error: errors.join(', ')};
    }

    let message = 'Invalid data';
    return { valid: false, error: message };
  }
};

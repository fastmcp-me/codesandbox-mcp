export type PublicError = {
  code: string;
  message: string;
  details?: Record<string, unknown>;
};

export const toPublicError = (err: unknown, code = "INTERNAL_ERROR"): PublicError => {
  if (err instanceof Error) {
    return { code, message: err.message };
  }
  return { code, message: "Unknown error" };
};


// standard error output
export const errorText = (error: unknown) =>
  error instanceof Error
    ? error.message
    : "Something went wrong. Please try again.";

// formating input
export const toLocalInput = (value: string) =>
  new Date(value).toISOString().slice(0, 16);

// frontend validate user input, in this case: img upload
export const imageIsSupported = (file: File) =>
  ["image/jpeg", "image/png", "image/webp"].includes(file.type) &&
  file.size <= 5 * 1024 * 1024;

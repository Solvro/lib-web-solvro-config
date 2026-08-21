/**
True when running in non-interactive mode (any CLI flags provided).
Evaluated once; `process.argv` cannot change during the process lifetime.
*/
export const isNonInteractive = process.argv.length > 2;

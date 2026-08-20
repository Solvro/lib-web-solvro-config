/**
Check if running in non-interactive mode (any CLI flags provided)
*/
export const isNonInteractive = () => process.argv.length > 2;

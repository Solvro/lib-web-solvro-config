/** Check if running in non-interactive mode (any CLI flags provided) */
export const checkIsNonInteractive = () => process.argv.length > 2;

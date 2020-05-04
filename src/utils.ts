// Return value of option specified by the flag if present
export function parseOption(args: string[], optionFlag: string): string | undefined {
  for (let i = 0; i < args.length; i++) {
    if (args[i] === optionFlag) {
      if ((i + 1) < args.length) {
        return args[i + 1];
      }
    }
  }

  return;
}

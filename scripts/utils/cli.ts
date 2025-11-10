export function getFlagValue(args: string[], flag: string): string | undefined {
  const index = args.findIndex((arg) => arg === flag || arg.startsWith(`${flag}=`));

  if (index === -1) {
    return undefined;
  }

  const [, value] = args[index].split("=");

  if (value) {
    return value;
  }

  return args[index + 1];
}

export function parseNumberFlag(args: string[], flag: string): number | undefined {
  const value = getFlagValue(args, flag);

  if (!value) {
    return undefined;
  }

  const parsedValue = Number(value);

  if (Number.isNaN(parsedValue)) {
    throw new Error(`Invalid value for ${flag}. It must be a number.`);
  }

  return parsedValue;
}

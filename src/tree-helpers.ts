export function buildParents(items: { value: string; level: number }[]) {
  const stack = [] as string[];
  const parents = {} as Record<string, string | null>;

  for (const item of items) {
    const { value, level } = item;

    if (stack.length >= level) {
      stack.length = level - 1;
    }

    if (stack.length === 0) {
      parents[value] = null;
    } else {
      parents[value] = stack[stack.length - 1];
    }

    stack.push(value);
  }

  return parents;
}

export function buildChildren(parents: Record<string, string | null>) {
  const children = {} as Record<string, string[]>;

  for (const key of Object.keys(parents)) {
    children[key] = [];
  }

  for (const key of Object.keys(parents)) {
    const parent = parents[key];

    if (parent !== null) {
      children[parent].push(key);
    }
  }

  return children;
}

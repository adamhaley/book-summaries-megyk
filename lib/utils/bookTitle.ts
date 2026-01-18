export type ParsedBookTitle = {
  title: string;
  subtitle?: string;
};

export function parseBookTitle(rawTitle?: string | null): ParsedBookTitle {
  const normalizedTitle = (rawTitle || '').trim();
  if (!normalizedTitle) {
    return { title: '' };
  }

  const colonIndex = normalizedTitle.indexOf(':');
  if (colonIndex === -1) {
    return { title: normalizedTitle };
  }

  const title = normalizedTitle.slice(0, colonIndex).trim();
  const subtitle = normalizedTitle.slice(colonIndex + 1).trim();

  return subtitle ? { title, subtitle } : { title };
}

export function getDisplayTitle(rawTitle?: string | null): string {
  return parseBookTitle(rawTitle).title;
}

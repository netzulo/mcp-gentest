export function stripCodeBlock(text: string): string {
  const lines = text.trim().split('\n')

  if (lines.length >= 2 && lines[0].startsWith('```') && lines.at(-1)?.startsWith('```')) {
    return lines.slice(1, -1).join('\n').trim()
  }

  return text.trim()
}

export async function formatPrompt(
  code: string,
  context?: string,
): Promise<string> {
  const ctx = context || "From clipboard";

  return `${ctx}

\`\`\`
${code}
\`\`\`

Please review this code and suggest improvements.`;
}

export function formatPrompt(code: string, context?: string): string {
  const ctx = context || "From clipboard";

  return `${ctx}

\`\`\`
${code}
\`\`\`

Please review this code and suggest improvements.`;
}

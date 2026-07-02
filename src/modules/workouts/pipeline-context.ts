export function buildPipelineContext(sections: Record<string, unknown>): string {
  return Object.entries(sections)
    .map(([label, value]) => `${label}:\n${JSON.stringify(value, null, 2)}`)
    .join("\n\n");
}


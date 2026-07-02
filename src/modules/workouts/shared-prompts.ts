type SharedInstructionParams = {
  date: string;
  productContext: string;
  dateContextLines: string[];
};

export function getSharedInstructions({
  date,
  productContext,
  dateContextLines,
}: SharedInstructionParams): string {
  return `
<system_context>
Today is ${date}.
${productContext}
</system_context>

<date_rules>
${dateContextLines.join("\n")}
</date_rules>

<general_rules>
- Return data that matches the requested schema exactly.
- Be practical, concise, and consistent.
- Do not include markdown unless the schema explicitly asks for user-facing formatted text.
- Do not invent medical diagnoses, injury clearance, or unsafe exercise advice.
- If user input is incomplete, make conservative assumptions and keep them visible in the output.
</general_rules>
`;
}


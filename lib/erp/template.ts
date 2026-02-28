export type SmsTemplateVariables = Record<string, string | number | undefined | null>;

export function applyTemplate(template: string, variables: SmsTemplateVariables): string {
  return template.replace(/{{\s*([a-zA-Z0-9_]+)\s*}}/g, (_, key: string) => String(variables[key] ?? ''));
}

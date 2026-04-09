import * as template1 from "./template1";
import * as template2 from "./template2";
import * as template3 from "./template3";
import * as template4 from "./template4";
import * as template5 from "./template5";

const TEMPLATES: Record<string, typeof template1> = {
  template1,
  template2,
  template3,
  template4,
  template5,
};

export function getTemplate(key: string | undefined) {
  return TEMPLATES[key || "template1"] || TEMPLATES.template1;
}

export type TemplateComponents = typeof template1;

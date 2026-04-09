export const TEMPLATE_LIST = [
  {
    key: "template1",
    name: "Template 1 — Clean Grid",
    description: "Standard layout with centered hero, category chips, 4-column product grid",
  },
  {
    key: "template2",
    name: "Template 2 — Full-Width Modern",
    description: "Transparent navbar, full-width hero with gradient, 3-column cards with shadows",
  },
  {
    key: "template3",
    name: "Template 3 — Minimal",
    description: "No hero, centered logo, sidebar categories, 2-column wide cards",
  },
  {
    key: "template4",
    name: "Template 4 — Bold & Dynamic",
    description: "Split hero, hover overlay cards, newsletter footer, bold typography",
  },
  {
    key: "template5",
    name: "Template 5 — Elegant Showcase",
    description: "Carousel hero, masonry grid, hamburger nav, elegant footer with story",
  },
] as const;

export type TemplateKey = (typeof TEMPLATE_LIST)[number]["key"];

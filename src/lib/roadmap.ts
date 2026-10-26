/**
 * Room for later Printify blueprints. These are not routes, products, or nav items.
 * Add them by publishing the blueprint in Printify and tagging the product.
 * Jackets stay out until they are tagged include-jacket — legacy jacket SKUs are not migrated.
 */
export const FUTURE_DROPSHIP = [
  { id: "polos", label: "Polos", status: "planned" },
  { id: "button-ups", label: "Button-ups", status: "planned" },
  { id: "hats", label: "Hats", status: "planned" },
  { id: "jackets", label: "Jackets", status: "planned" },
] as const;

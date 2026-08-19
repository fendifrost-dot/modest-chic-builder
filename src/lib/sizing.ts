export const MEASURE_STEPS = [
  {
    name: 'Chest',
    how: 'Measure around the fullest part of the chest, under the arms, keeping the tape level.',
  },
  {
    name: 'Waist',
    how: 'Measure around the natural waist, where the body bends side to side.',
  },
  {
    name: 'Sleeve',
    how: 'With the arm slightly bent, measure from the shoulder point down to where you want the sleeve to end.',
  },
  {
    name: 'Length',
    how: 'Measure from the highest point of the shoulder down the front to the hem.',
  },
] as const;

export const FIT_NOTES = [
  {
    name: 'Outerwear',
    body: 'Jackets and bombers are designed with a streetwear silhouette. If you plan to layer a heavy hoodie underneath, consider the next size up from your usual tee size.',
  },
  {
    name: 'Knitwear / cashmere',
    body: 'Sweaters follow a relaxed luxury fit. True to size for a clean line; size up for extra drape.',
  },
  {
    name: 'Tees and sweats',
    body: 'Graphic tees and sweatshirts run in a relaxed streetwear fit. Use the size options on the product page — not every color is cut in every size.',
  },
] as const;

const MarqueeBanner = () => {
  const items = [
    'Premium Materials',
    '★',
    'Free Shipping Over $200',
    '★',
    'Exclusive Designs',
    '★',
    'Limited Edition Drops',
    '★',
    'Affirm Available',
    '★',
    'Premium Materials',
    '★',
    'Free Shipping Over $200',
    '★',
    'Exclusive Designs',
    '★',
    'Limited Edition Drops',
    '★',
    'Affirm Available',
    '★',
  ];

  return (
    <div className="bg-gold py-4 overflow-hidden">
      <div className="flex animate-marquee whitespace-nowrap">
        {items.map((item, index) => (
          <span
            key={index}
            className="text-obsidian text-sm tracking-[0.2em] uppercase font-medium mx-8"
          >
            {item}
          </span>
        ))}
        {items.map((item, index) => (
          <span
            key={`duplicate-${index}`}
            className="text-obsidian text-sm tracking-[0.2em] uppercase font-medium mx-8"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
};

export default MarqueeBanner;

"use client";

interface CategoryChipsProps {
  categories: string[];
  selected: string;
  onSelect: (category: string) => void;
  theme: any;
}

export default function CategoryChips({ categories, selected, onSelect, theme }: CategoryChipsProps) {
  if (categories.length === 0) return null;

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      <button
        onClick={() => onSelect("all")}
        className="px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all shrink-0"
        style={
          selected === "all"
            ? { backgroundColor: theme.primaryColor, color: theme.buttonText }
            : { backgroundColor: theme.secondaryColor, color: theme.accentColor }
        }
      >
        All
      </button>
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onSelect(cat)}
          className="px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all shrink-0"
          style={
            selected === cat
              ? { backgroundColor: theme.primaryColor, color: theme.buttonText }
              : { backgroundColor: theme.secondaryColor, color: theme.accentColor }
          }
        >
          {cat}
        </button>
      ))}
    </div>
  );
}

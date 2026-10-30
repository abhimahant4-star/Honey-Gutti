import type { ProductInput } from "./validation";

/** Turns the admin form values into what is stored (empty optional fields are removed). */
export function toProductDoc(input: ProductInput) {
  const set = {
    name: input.name,
    slug: input.slug,
    tagline: input.tagline,
    description: input.description,
    price: input.price,
    size: input.size,
    images: [...new Set(input.images)],
    badges: [...new Set(input.badges.map((b) => b.trim()).filter(Boolean))],
    ingredients: input.ingredients.filter((i) => i.latin.trim()),
    status: input.status,
    featured: input.featured,
    sortOrder: input.sortOrder,
    ...(input.hindiName ? { hindiName: input.hindiName } : {}),
    ...(input.dosage ? { dosage: input.dosage } : {}),
  };
  const unset = {
    ...(input.hindiName ? {} : { hindiName: 1 }),
    ...(input.dosage ? {} : { dosage: 1 }),
  };
  return { set, unset };
}

export const validId = (id: string) => /^[a-f0-9]{24}$/.test(id);

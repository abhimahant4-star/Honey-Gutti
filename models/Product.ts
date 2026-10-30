import { Model, Schema, model, models } from "mongoose";
import type { Ingredient, ProductStatus } from "@/lib/products";

/** Products, managed by the shop owner in /admin/products. */
export type ProductLean = {
  _id: { toString(): string };
  slug: string;
  name: string;
  hindiName?: string;
  tagline: string;
  description: string;
  price: number;
  size: string;
  images: string[];
  badges: string[];
  ingredients: Ingredient[];
  dosage?: string;
  status: ProductStatus;
  featured: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
};

const IngredientSchema = new Schema(
  {
    hi: { type: String, trim: true, maxlength: 60 },
    latin: { type: String, required: true, trim: true, maxlength: 80 },
    qty: { type: String, trim: true, maxlength: 30 },
  },
  { _id: false }
);

const ProductSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 80 },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    hindiName: { type: String, trim: true, maxlength: 100 },
    tagline: { type: String, required: true, trim: true, maxlength: 160 },
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    price: { type: Number, required: true, min: 1, max: 100000 },
    size: { type: String, required: true, trim: true, maxlength: 40 },
    images: { type: [String], default: [] },
    badges: { type: [String], default: [] },
    ingredients: { type: [IngredientSchema], default: [] },
    dosage: { type: String, trim: true, maxlength: 500 },
    status: { type: String, enum: ["live", "coming_soon", "hidden"], default: "hidden", required: true },
    featured: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },
  },
  // strict: unknown fields are never saved
  { timestamps: true, strict: true }
);

// The website lists products by status in the admin's chosen order:
//   find({ status: { $in: ["live", "coming_soon"] } }).sort({ sortOrder: 1, createdAt: -1 })
ProductSchema.index({ status: 1, sortOrder: 1, createdAt: -1 });
// Admin > Products list (all statuses, same order)
ProductSchema.index({ sortOrder: 1, createdAt: -1 });
// "is this photo still used?" before deleting an uploaded photo
ProductSchema.index({ images: 1 });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const Product: Model<any> = models.Product || model("Product", ProductSchema);

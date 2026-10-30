import { Model, Schema, model, models } from "mongoose";

/** Blog posts, written by the shop owner in /admin/blog. */
export type PostTone = "honey" | "leaf" | "pack";
export type PostStatus = "draft" | "published";

export type PostLean = {
  _id: { toString(): string };
  slug: string;
  title: string;
  description: string;
  body: string;
  tags: string[];
  image?: string; // e.g. /api/blog-image/<id>
  imageAlt?: string;
  tone: PostTone;
  author: string;
  status: PostStatus;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};

const PostSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    body: { type: String, required: true },
    tags: { type: [String], default: [] },
    image: String,
    imageAlt: String,
    tone: { type: String, enum: ["honey", "leaf", "pack"], default: "honey" },
    author: { type: String, default: "Doy & Joy Team" },
    status: { type: String, enum: ["draft", "published"], default: "draft" },
    publishedAt: Date,
  },
  { timestamps: true }
);

PostSchema.index({ status: 1, publishedAt: -1 }); // public blog: published posts, newest first
PostSchema.index({ updatedAt: -1 }); // Admin > Blog: last edited first
PostSchema.index({ image: 1 }); // "is this photo still used?" before deleting it

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const Post: Model<any> = models.Post || model("Post", PostSchema);

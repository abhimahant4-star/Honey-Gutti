import { Model, Schema, model, models } from "mongoose";

/** Cover photos for blog posts (resized in the browser before upload, so they stay small). */
const BlogImageSchema = new Schema(
  {
    data: { type: Buffer, required: true },
    contentType: { type: String, required: true },
    size: Number,
    width: Number,
    height: Number,
  },
  { timestamps: true }
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const BlogImage: Model<any> = models.BlogImage || model("BlogImage", BlogImageSchema);

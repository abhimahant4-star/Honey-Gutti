import { Model, Schema, model, models } from "mongoose";

export type OrderStatus = "created" | "paid" | "failed";

export type OrderLean = {
  publicId: string;
  status: OrderStatus;
  items: { slug: string; name: string; price: number; qty: number }[];
  customer: { name: string; phone: string; email: string; address: string; city: string; state: string; pin: string };
  subtotal: number;
  shipping: number;
  total: number;
  txnid?: string; // PayU transaction id (older test orders may not have one)
  payuPaymentId?: string; // PayU mihpayid
  paymentMode?: string; // CC, DC, NB, UPI, ...
  paymentError?: string;
  lastCheckedAt?: Date;
  paidAt?: Date;
  createdAt: Date;
};

const OrderSchema = new Schema(
  {
    publicId: { type: String, required: true, unique: true },
    status: { type: String, enum: ["created", "paid", "failed"], default: "created", index: true },
    items: [{ _id: false, slug: String, name: String, price: Number, qty: Number }],
    customer: {
      name: String,
      phone: String,
      email: String,
      address: String,
      city: String,
      state: String,
      pin: String,
    },
    subtotal: Number,
    shipping: Number,
    total: Number,
    currency: { type: String, default: "INR" },
    txnid: { type: String, unique: true, sparse: true },
    payuPaymentId: String,
    paymentMode: String,
    paymentError: String,
    lastCheckedAt: Date,
    paidAt: Date,
  },
  { timestamps: true }
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const Order: Model<any> = models.Order || model("Order", OrderSchema);

export const orderNumber = (publicId: string) => `DJ-${publicId.slice(0, 8).toUpperCase()}`;

export const site = {
  name: "Doy & Joy",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
  legalName: "Naveen Kumar Arora (Doy & Joy Group of Company)",
  gstin: "03ANDPA8212E2ZS",
  address: "Flat 405, E-2 Tower, Savitry Greens 1 Society, VIP Road, Zirakpur, SAS Nagar, Punjab 140603",
  email: process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "care@example.com",
  phone: process.env.NEXT_PUBLIC_SUPPORT_PHONE ?? "+91 99999 99999",
  freeShippingAbove: 499,
  shippingFee: 49,
};

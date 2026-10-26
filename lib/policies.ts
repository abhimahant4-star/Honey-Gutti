import { site } from "./site";

export type Policy = { slug: string; title: string; description: string; sections: { h: string; p: string[] }[] };

const seller = `${site.legalName}, ${site.address}. GSTIN ${site.gstin}.`;

/* Starter text so the site passes payment-gateway checks. Have your client (and a lawyer) review it. */
export const policies: Policy[] = [
  {
    slug: "privacy-policy",
    title: "Privacy Policy",
    description: "How Doy & Joy collects, uses and protects your personal information.",
    sections: [
      { h: "Who we are", p: [`This website is operated by ${seller}`] },
      { h: "What we collect", p: ["When you place an order we collect your name, mobile number, email and delivery address. We also record the items you ordered and the payment status."] },
      { h: "How we use it", p: ["We use your details only to process and deliver your order, confirm payment, answer your questions and meet legal and tax requirements. We do not sell your data."] },
      { h: "Payments", p: ["Payments are handled by PayU. Your card, UPI and bank details go directly to PayU and are never stored on our servers."] },
      { h: "Sharing", p: ["We share your name, phone number and address with delivery partners so they can deliver your order, and with PayU to process payment."] },
      { h: "Your choices", p: [`To see, correct or delete your information, write to ${site.email}.`] },
    ],
  },
  {
    slug: "terms-and-conditions",
    title: "Terms & Conditions",
    description: "The terms that apply when you buy from Doy & Joy.",
    sections: [
      { h: "About these terms", p: [`By using this site and placing an order you agree to these terms. The seller is ${seller}`] },
      { h: "Products", p: ["Our products are Ayurvedic proprietary medicines and wellness products. Use them as directed on the label or by your physician. Information on this site is not medical advice."] },
      { h: "Prices and orders", p: ["All prices are in Indian Rupees and inclusive of taxes. An order is confirmed only after successful payment. We may cancel an order if a product is unavailable and will refund any amount paid."] },
      { h: "Governing law", p: ["These terms are governed by the laws of India. Courts at SAS Nagar (Mohali), Punjab have jurisdiction."] },
    ],
  },
  {
    slug: "refund-policy",
    title: "Refund & Cancellation Policy",
    description: "How cancellations, returns and refunds work at Doy & Joy.",
    sections: [
      { h: "Cancellation", p: [`You can cancel an order before it is dispatched by calling ${site.phone} or emailing ${site.email}. We will refund the full amount.`] },
      { h: "Damaged or wrong product", p: ["If your order arrives damaged or you receive a wrong product, contact us within 48 hours of delivery with your order number and clear photos. We will send a replacement or refund the amount."] },
      { h: "Returns", p: ["For safety reasons we cannot accept returns of opened or used medicines."] },
      { h: "How refunds are paid", p: ["Approved refunds go back to the original payment method within 5 to 7 business days."] },
    ],
  },
  {
    slug: "shipping-policy",
    title: "Shipping Policy",
    description: "Delivery areas, charges and timelines for Doy & Joy orders.",
    sections: [
      { h: "Where we deliver", p: ["We deliver to most PIN codes across India."] },
      { h: "Charges", p: [`Delivery is free on orders of ${"₹"}${site.freeShippingAbove} and above. Below that, the delivery charge is ${"₹"}${site.shippingFee}.`] },
      { h: "Timelines", p: ["Orders are dispatched within 2 business days of payment. Delivery usually takes 3 to 7 business days depending on your location."] },
      { h: "Tracking", p: [`We will share delivery updates on your mobile number. For help, call ${site.phone}.`] },
    ],
  },
  {
    slug: "contact-us",
    title: "Contact Us",
    description: "Get in touch with Doy & Joy for orders, delivery and product questions.",
    sections: [
      { h: "Customer support", p: [`Phone: ${site.phone}`, `Email: ${site.email}`] },
      { h: "Registered address", p: [site.address] },
      { h: "Business details", p: [`${site.legalName}. GSTIN ${site.gstin}.`, "Manufactured and marketed by Kamdhenu Ayurvedic Pharmacy, Plot No. 434/435 Bhatoli Nalagarh, (Baddi) Distt-Solan (HP) 174101. Mfg. Lic. No. HP-207-AY."] },
    ],
  },
];

export const getPolicy = (slug: string) => policies.find((p) => p.slug === slug);

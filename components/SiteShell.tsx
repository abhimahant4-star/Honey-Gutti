import { getCatalog } from "@/lib/catalog";
import { toCartProduct } from "@/lib/products";
import { CartDrawer } from "./CartDrawer";
import { CartProvider } from "./CartProvider";
import { Footer } from "./Footer";
import { Header } from "./Header";

/** Navbar, footer and cart around the public pages. The cart gets live products and prices from the database. */
export async function SiteShell({ children }: { children: React.ReactNode }) {
  const { live } = await getCatalog();
  return (
    <CartProvider products={live.map(toCartProduct)}>
      <Header />
      <main id="main">{children}</main>
      <Footer />
      <CartDrawer />
    </CartProvider>
  );
}

import type { Metadata } from "next";
import { DM_Sans, Sora } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { AuthProvider } from "./components/AuthProvider";
import CartDrawer from "./components/CartDrawer";
import { ShopProvider } from "./components/ShopProvider";
import { ThemeProvider } from "./components/ThemeProvider";
import { ToastProvider } from "./components/ToastProvider";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "ShopHub - Modern E-Commerce",
  description: "Your destination for premium products",
};

const themeBootScript = `
  (() => {
    const storageKey = "shophub-theme";
    const stored = window.localStorage.getItem(storageKey);
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const theme = stored === "dark" || stored === "light" ? stored : (prefersDark ? "dark" : "light");
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.style.colorScheme = theme;
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full scroll-smooth" suppressHydrationWarning data-scroll-behavior="smooth">
      <body
        className={`${dmSans.variable} ${sora.variable} min-h-full flex flex-col bg-background text-foreground`}
      >
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
        <ThemeProvider>
          <ToastProvider>
            <AuthProvider>
              <ShopProvider>
                <Navbar />
                <CartDrawer />
                <main className="flex-1">{children}</main>
                <Footer />
              </ShopProvider>
            </AuthProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

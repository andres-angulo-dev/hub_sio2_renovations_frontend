import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";

const beVietnamPro = Be_Vietnam_Pro({
  variable: "--font-be-vietnam",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "SiO₂ Rénovations | Entreprise générale du bâtiment tous corps d'état à Paris et Île-de-France",
  description: "SiO₂ Rénovations est une entreprise générale du bâtiment tous corps d'état, spécialisée dans la rénovation et l'aménagement à Paris et en Île-de-France. Qualité, fiabilité et savoir-faire au service de vos projets.",
  keywords: "rénovation, entreprise générale du bâtiment, aménagement, tous corps d'état, travaux de rénovation, rénovation intérieure, rénovation extérieure, bâtiment, rénovation Paris",
  authors: [{ name: "Andrés Angulo" }],
  openGraph: {
    title: "SiO₂ Rénovations | Entreprise générale du bâtiment tous corps d'état à Paris et Île-de-France",
    siteName: "SiO₂ Rénovations",
    type: "website",
    url: "https://www.sio2renovations.com",
    description: "Entreprise générale du bâtiment tous corps d'état, spécialisée dans la rénovation et l'aménagement. Faites confiance à notre expertise pour des projets de qualité adaptés à vos besoins.",
    images: [{
      url: "https://raw.githubusercontent.com/andres-angulo-dev/sio2_renovations_frontend/refs/heads/main/web/icons/cover.webp",
      width: 1200,
      height: 630,
      alt: "SiO₂ Rénovations — Entreprise générale du bâtiment tous corps d'état",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "SiO₂ Rénovations | Entreprise générale du bâtiment tous corps d'état à Paris et Île-de-France",
    description: "Entreprise générale du bâtiment tous corps d'état, spécialisée dans la rénovation et l'aménagement. Faites confiance à notre expertise pour des projets de qualité adaptés à vos besoins.",
    images: ["https://raw.githubusercontent.com/andres-angulo-dev/sio2_renovations_frontend/refs/heads/main/web/icons/cover.png"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "SiO₂ Rénovations",
  "description": "Entreprise générale du bâtiment tous corps d'état, spécialisée dans la rénovation et l'aménagement à Paris et en Île-de-France.",
  "url": "https://www.sio2renovations.com",
  "telephone": "+33756888701",
  "email": "contact@sio2renovations.com",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Paris",
    "addressRegion": "Île-de-France",
    "addressCountry": "FR",
  },
  "areaServed": [
    { "@type": "City", "name": "Paris" },
    { "@type": "AdministrativeArea", "name": "Île-de-France" },
  ],
  "image": "https://raw.githubusercontent.com/andres-angulo-dev/sio2_renovations_frontend/refs/heads/main/web/icons/cover.webp",
  "sameAs": [
    "https://www.instagram.com/sio2renovations/",
    "https://www.linkedin.com/company/sio2renovations",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        {/* JSON-LD — données structurées LocalBusiness pour le SEO local */}
        {/* Contenu hardcodé côté serveur, aucun risque XSS */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} // eslint-disable-line react/no-danger
        />
      </head>
      <body className={`${beVietnamPro.variable} antialiased`}>
        {/* Dark overlay on top of the video for readability */}
        <div className="fixed inset-0 bg-black/50 -z-5" />

        {/* Looping background video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="none"
          className="fixed top-0 left-0 w-full h-full object-cover -z-10"
        >
          <source src="/background.mp4" type="video/mp4" />
        </video>

        {children}
      </body>
    </html>
  );
}

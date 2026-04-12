import Header from './components/Header';
import Image from 'next/image';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faPhone, faArrowUpRightFromSquare, faLocationDot, faGlobe } from "@fortawesome/free-solid-svg-icons";
import { faInstagram, faLinkedin } from "@fortawesome/free-brands-svg-icons";

// Design tokens — palette SiO₂ Modern Atelier
const t = {
  font:   'var(--font-be-vietnam)',
  accent: '#f39220',
  body:   '#544435',
  dark:   '#1e1b17',
  muted:  '#b0956b',
  glass: {
    background:    'rgba(255,248,241,0.85)',
    backdropFilter:'blur(24px)',
    border:        '1px solid rgba(218,194,175,0.15)',
  },
  shadow: '0 35px 70px -5px rgba(30,27,23,0.06)',
};

export default function Home() {
  return (
    <div className="min-h-screen flex justify-center px-4">

      <main
        className="min-h-screen w-full max-w-sm px-6 flex flex-col"
        style={{ ...t.glass }}
      >
        <div className="flex-1 flex flex-col gap-8 py-10">

          {/* ── 1. Header éditorial ── */}
          <Header
            logoUrl="/black_logo.svg"
            title="SiO₂ Rénovations"
          />

          {/* ── 2. Photo principale ── */}
          <div className="relative w-full rounded-lg overflow-hidden" style={{ height: 380 }}>
            <Image
              src="/photo-hero.jpg"
              alt="Projet de rénovation Paris — Rénovation intérieure tous corps d'état"
              fill
              priority
              sizes="(max-width: 384px) calc(100vw - 48px), 336px"
              className="object-cover grayscale-0 [@media(hover:hover)]:grayscale [@media(hover:hover)]:hover:grayscale-0 transition-all duration-500"
            />
          </div>

          {/* ── 3. Notre Engagement — label + citation + pill bouton ── */}
          <div className="flex flex-col gap-3">

            <span
              style={{ fontFamily: t.font, color: t.accent, fontSize: 10, letterSpacing: '0.2em' }}
              className="uppercase font-semibold"
            >
              Notre Engagement
            </span>

            <blockquote
              style={{ fontFamily: t.font, color: t.body, fontStyle: 'italic', lineHeight: 1.65 }}
              className="text-sm"
            >
              &ldquo;Qualité, fiabilité et savoir-faire au service de vos projets.&rdquo;
            </blockquote>

            <a
              href="https://www.sio2renovations.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 w-fit transition-all duration-200 hover:shadow-sm"
              style={{
                fontFamily: t.font,
                background: '#fff8f0',
                border: `1px solid ${t.accent}`,
                borderRadius: 9999,
                padding: '8px 18px',
                color: t.dark,
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              <FontAwesomeIcon icon={faGlobe} aria-hidden={true} style={{ color: t.accent, fontSize: 12 }} />
              Découvrir le Site Web
              <FontAwesomeIcon icon={faArrowUpRightFromSquare} aria-hidden={true} style={{ color: t.accent, fontSize: 10 }} />
            </a>

          </div>

          {/* ── 4. Glass card — Instagram + LinkedIn ── */}
          <div
            className="rounded-lg px-5 py-5 flex flex-col gap-4"
            style={{ ...t.glass, boxShadow: t.shadow }}
          >
            <p style={{ fontFamily: t.font, color: t.body, lineHeight: 1.65 }} className="text-sm">
              Spécialisés dans la rénovation et l&apos;aménagement tous corps d&apos;état à Paris et Île-de-France.
            </p>

            {/* Lien Instagram */}
            <a
              href="https://www.instagram.com/sio2renovations/"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between py-1"
              style={{ fontFamily: t.font, color: t.dark }}
            >
              <span className="flex items-center gap-2 text-sm font-medium transition-transform duration-200 group-hover:translate-x-1">
                <FontAwesomeIcon icon={faInstagram} aria-hidden={true} style={{ color: t.accent, fontSize: 15 }} />
                Instagram
              </span>
              <FontAwesomeIcon
                icon={faArrowUpRightFromSquare}
                aria-hidden={true}
                className="text-xs transition-all duration-200 opacity-30 group-hover:opacity-100 group-hover:text-[#f39220]"
              />
            </a>

            <div style={{ height: 1, background: 'rgba(218,194,175,0.35)' }} />

            {/* Lien LinkedIn */}
            <a
              href="https://www.linkedin.com/company/sio2renovations"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between py-1"
              style={{ fontFamily: t.font, color: t.dark }}
            >
              <span className="flex items-center gap-2 text-sm font-medium transition-transform duration-200 group-hover:translate-x-1">
                <FontAwesomeIcon icon={faLinkedin} aria-hidden={true} style={{ color: t.accent, fontSize: 15 }} />
                LinkedIn
              </span>
              <FontAwesomeIcon
                icon={faArrowUpRightFromSquare}
                aria-hidden={true}
                className="text-xs transition-all duration-200 opacity-30 group-hover:opacity-100 group-hover:text-[#f39220]"
              />
            </a>
          </div>

          {/* ── 5. Photo artisan + overlay citation ── */}
          <div className="relative w-full rounded-lg overflow-hidden" style={{ height: 380 }}>
            <Image
              src="/photo-artisan.jpg"
              alt="Artisan SiO₂ Rénovations réalisant des travaux de finition en Île-de-France"
              fill
              sizes="(max-width: 384px) calc(100vw - 48px), 336px"
              className="object-cover grayscale-0 [@media(hover:hover)]:grayscale [@media(hover:hover)]:hover:grayscale-0 transition-all duration-500"
            />
            <div
              className="absolute bottom-3 left-3 right-3 px-4 py-3 rounded-md"
              style={{ background: '#fff8f0', backdropFilter: 'blur(10px)' }}
            >
              <p style={{ fontFamily: t.font, color: t.body, fontStyle: 'italic', lineHeight: 1.6, fontSize: 13 }}>
                &ldquo;La qualité réside dans chaque détail invisible.&rdquo;
              </p>
            </div>
          </div>

          {/* ── 6. Section contact ── */}
          <div className="flex flex-col gap-4">

            {/* Séparateur "Contactez-nous" */}
            <div className="flex items-center gap-3">
              <div style={{ flex: 1, height: 1, background: 'rgba(243,146,32,0.15)' }} />
              <span
                style={{ fontFamily: t.font, color: t.accent, fontSize: 10, letterSpacing: '0.2em' }}
                className="uppercase font-bold"
              >
                Contactez-nous
              </span>
              <div style={{ flex: 1, height: 1, background: 'rgba(243,146,32,0.15)' }} />
            </div>

            <div
              className="rounded-xl p-6 flex flex-col items-center gap-6"
              style={{ background: '#f9f3eb', boxShadow: t.shadow }}
            >
              {/* Grid 2 colonnes — Appeler + Email */}
              <div className="grid grid-cols-2 gap-4 w-full">

                <a
                  href="tel:0756888701"
                  className="flex flex-col items-center justify-center p-4 rounded-lg transition-all duration-200 hover:bg-[#ffdcbf] hover:scale-105 hover:shadow-md"
                  style={{ background: 'rgba(255,255,255,0.5)', color: t.dark }}
                >
                  <FontAwesomeIcon icon={faPhone} aria-hidden={true} style={{ color: t.accent, fontSize: 22, marginBottom: 8 }} />
                  <span style={{ fontFamily: t.font, fontSize: 12 }} className="font-bold">
                    Appeler
                  </span>
                </a>

                <a
                  href="mailto:contact@sio2renovations.com"
                  className="flex flex-col items-center justify-center p-4 rounded-lg transition-all duration-200 hover:bg-[#ffdcbf] hover:scale-105 hover:shadow-md"
                  style={{ background: 'rgba(255,255,255,0.5)', color: t.dark }}
                >
                  <FontAwesomeIcon icon={faEnvelope} aria-hidden={true} style={{ color: t.accent, fontSize: 22, marginBottom: 8 }} />
                  <span style={{ fontFamily: t.font, fontSize: 12 }} className="font-bold">
                    Email
                  </span>
                </a>

              </div>

              {/* Devis + localisation */}
              <div className="w-full text-center flex flex-col gap-2">
                <p style={{ fontFamily: t.font, color: t.body, fontSize: 14 }} className="font-medium">
                  Besoin d&apos;un devis pour votre projet ?
                </p>
                <div className="flex items-center justify-center gap-2" style={{ color: t.accent }}>
                  <FontAwesomeIcon icon={faLocationDot} aria-hidden={true} style={{ fontSize: 12 }} />
                  <span style={{ fontFamily: t.font, fontSize: 11, letterSpacing: '0.12em' }} className="uppercase font-bold">
                    Paris & Île-de-France
                  </span>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* ── 7. Footer ── */}
        <footer className="pb-8 pt-4">
          <p className="text-center" style={{ fontFamily: t.font, color: t.muted, fontSize: 11 }}>
            © 2026 | Tous droits réservés | Réalisé par{" "}
            <a href="https://www.andres-angulo.com/" className="hover:text-[#f39220] transition-colors" style={{ color: t.muted }}>
              Andrés Angulo
            </a>
          </p>
        </footer>

      </main>
    </div>
  );
}

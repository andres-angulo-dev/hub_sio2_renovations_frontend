import Header from './components/Header';
import Image from 'next/image';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faPhone, faArrowUpRightFromSquare, faLocationDot, faGlobe } from "@fortawesome/free-solid-svg-icons";
import { faInstagram, faLinkedin } from "@fortawesome/free-brands-svg-icons";

export default function Home() {
  return (
    // Colonne centrée — même largeur que la card, hauteur plein écran
    <div className="min-h-screen flex justify-center px-4">

      <main
        className="min-h-screen w-full max-w-sm px-6 flex flex-col"
        style={{
          background: 'rgb(255, 255, 255)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(218,194,175,0.15)',
        }}
      >
        <div className="flex-1 flex flex-col gap-8 py-10">

          {/* ── 1. Header éditorial ── */}
          <Header
            logoUrl="https://raw.githubusercontent.com/andres-angulo-dev/sio2_renovations_frontend/refs/heads/main/assets/black_logo.svg"
            title="SiO₂ Rénovations"
          />

          {/* ── 2. Photo placeholder — grayscale → couleur au hover ── */}
          <div className="relative w-full rounded-lg overflow-hidden" style={{ height: 380 }}>
            <Image
              src="/photo-hero.jpg"
              alt="Projet de rénovation"
              fill
              className="object-cover grayscale-0 [@media(hover:hover)]:grayscale [@media(hover:hover)]:hover:grayscale-0 transition-all duration-500"
            />
          </div>

          {/* ── 3. Section description — philosophie + citation + pill bouton ── */}
          <div className="flex flex-col gap-3">

            {/* Label Notre Engagement — en premier */}
            <span
              style={{
                fontFamily: 'var(--font-be-vietnam)',
                color: '#f39220',
                fontSize: 10,
                letterSpacing: '0.2em',
              }}
              className="uppercase font-semibold"
            >
              Notre Engagement
            </span>

            {/* Citation italique — en second */}
            <blockquote
              style={{
                fontFamily: 'var(--font-be-vietnam)',
                color: '#544435',
                fontStyle: 'italic',
                lineHeight: 1.65,
              }}
              className="text-sm"
            >
              "Qualité, fiabilité et savoir-faire au service de vos projets."
            </blockquote>

            {/* Pill badge — bouton Site Web */}
            <a
              href="https://www.sio2renovations.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 w-fit transition-all duration-200 hover:shadow-sm"
              style={{
                fontFamily: 'var(--font-be-vietnam)',
                background: '#fff8f0',
                border: '1px solid #f39220',
                borderRadius: 9999,
                padding: '8px 18px',
                color: '#1e1b17',
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              <FontAwesomeIcon icon={faGlobe} style={{ color: '#f39220', fontSize: 12 }} />
              Découvrir le Site Web
              <FontAwesomeIcon icon={faArrowUpRightFromSquare} style={{ color: '#f39220', fontSize: 10 }} />
            </a>

          </div>

          {/* ── 4. Glass card — autres liens (Instagram + LinkedIn) ── */}
          <div
            className="rounded-lg px-5 py-5 flex flex-col gap-4"
            style={{
              background: 'rgba(255,248,241,0.85)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(218,194,175,0.15)',
              boxShadow: '0 35px 70px -5px rgba(30,27,23,0.06)',
            }}
          >
            {/* Texte d'accroche */}
            <p
              style={{
                fontFamily: 'var(--font-be-vietnam)',
                color: '#544435',
                lineHeight: 1.65,
              }}
              className="text-sm"
            >
              Spécialisés dans la rénovation et l'aménagement tous corps d'état à Paris et Île-de-France.
            </p>

            {/* Lien Instagram */}
            <a
              href="https://www.instagram.com/sio2renovations/"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between py-1"
              style={{ fontFamily: 'var(--font-be-vietnam)', color: '#1e1b17' }}
            >
              <span className="flex items-center gap-2 text-sm font-medium transition-transform duration-200 group-hover:translate-x-1">
                <FontAwesomeIcon icon={faInstagram} style={{ color: '#f39220', fontSize: 15 }} />
                Instagram
              </span>
              {/* Flèche externe — apparaît au hover */}
              <FontAwesomeIcon
                icon={faArrowUpRightFromSquare}
                className="text-xs transition-all duration-200 opacity-30 group-hover:opacity-100 group-hover:text-[#f39220]"
              />
            </a>

            {/* Séparateur */}
            <div style={{ height: 1, background: 'rgba(218,194,175,0.35)' }} />

            {/* Lien LinkedIn */}
            <a
              href="https://www.linkedin.com/company/sio2renovations"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between py-1"
              style={{ fontFamily: 'var(--font-be-vietnam)', color: '#1e1b17' }}
            >
              <span className="flex items-center gap-2 text-sm font-medium transition-transform duration-200 group-hover:translate-x-1">
                <FontAwesomeIcon icon={faLinkedin} style={{ color: '#f39220', fontSize: 15 }} />
                LinkedIn
              </span>
              <FontAwesomeIcon
                icon={faArrowUpRightFromSquare}
                className="text-xs transition-all duration-200 opacity-30 group-hover:opacity-100 group-hover:text-[#f39220]"
              />
            </a>

          </div>

          {/* ── 5. Card photo + texte overlay sombre ── */}
          <div className="relative w-full rounded-lg overflow-hidden" style={{ height: 380 }}>
            <Image
              src="/photo-artisan.jpg"
              alt="Qualité artisanale SiO₂"
              fill
              className="object-cover grayscale-0 [@media(hover:hover)]:grayscale [@media(hover:hover)]:hover:grayscale-0 transition-all duration-500"
            />
            {/* Overlay flottant — marges sur les 4 côtés, couleur palette */}
            <div
              className="absolute bottom-3 left-3 right-3 px-4 py-3 rounded-md"
              style={{
                background: '#fff8f0',
                backdropFilter: 'blur(10px)',
              }}
            >
              <p
                style={{
                  fontFamily: 'var(--font-be-vietnam)',
                  color: '#544435',
                  fontStyle: 'italic',
                  lineHeight: 1.6,
                  fontSize: 13,
                }}
              >
                "La qualité réside dans chaque détail invisible."
              </p>
            </div>
          </div>

          {/* ── 6. Section contact — style Sio2 Link-in-Bio Hub v1 ── */}
          <div className="flex flex-col gap-4">

            {/* Séparateur "Contactez-nous" centré avec lignes */}
            <div className="flex items-center gap-3">
              <div style={{ flex: 1, height: 1, background: 'rgba(243,146,32,0.15)' }} />
              <span
                style={{
                  fontFamily: 'var(--font-be-vietnam)',
                  color: '#f39220',
                  fontSize: 10,
                  letterSpacing: '0.2em',
                }}
                className="uppercase font-bold"
              >
                Contactez-nous
              </span>
              <div style={{ flex: 1, height: 1, background: 'rgba(243,146,32,0.15)' }} />
            </div>

            {/* Card principale */}
            <div
              className="rounded-xl p-6 flex flex-col items-center gap-6"
              style={{
                background: '#f9f3eb',
                boxShadow: '0 35px 70px -5px rgba(30,27,23,0.06)',
              }}
            >
              {/* Grid 2 colonnes — Appeler + Email */}
              <div className="grid grid-cols-2 gap-4 w-full">

                <a
                  href="tel:0756888701"
                  className="flex flex-col items-center justify-center p-4 rounded-lg transition-all duration-200 hover:bg-[#ffdcbf] hover:scale-105 hover:shadow-md"
                  style={{ background: 'rgba(255,255,255,0.5)', color: '#1e1b17' }}
                >
                  <FontAwesomeIcon icon={faPhone} style={{ color: '#f39220', fontSize: 22, marginBottom: 8 }} />
                  <span
                    style={{ fontFamily: 'var(--font-be-vietnam)', fontSize: 12 }}
                    className="font-bold"
                  >
                    Appeler
                  </span>
                </a>

                <a
                  href="mailto:contact@sio2renovations.com"
                  className="flex flex-col items-center justify-center p-4 rounded-lg transition-all duration-200 hover:bg-[#ffdcbf] hover:scale-105 hover:shadow-md"
                  style={{ background: 'rgba(255,255,255,0.5)', color: '#1e1b17' }}
                >
                  <FontAwesomeIcon icon={faEnvelope} style={{ color: '#f39220', fontSize: 22, marginBottom: 8 }} />
                  <span
                    style={{ fontFamily: 'var(--font-be-vietnam)', fontSize: 12 }}
                    className="font-bold"
                  >
                    Email
                  </span>
                </a>

              </div>

              {/* Texte bas — devis + localisation */}
              <div className="w-full text-center flex flex-col gap-2">
                <p
                  style={{ fontFamily: 'var(--font-be-vietnam)', color: '#544435', fontSize: 14 }}
                  className="font-medium"
                >
                  Besoin d'un devis pour votre projet ?
                </p>
                <div className="flex items-center justify-center gap-2" style={{ color: '#f39220' }}>
                  <FontAwesomeIcon icon={faLocationDot} style={{ fontSize: 12 }} />
                  <span
                    style={{ fontFamily: 'var(--font-be-vietnam)', fontSize: 11, letterSpacing: '0.12em' }}
                    className="uppercase font-bold"
                  >
                    Paris & Île-de-France
                  </span>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* ── 7. Footer ── */}
        <footer className="pb-8 pt-4">
          <p className="text-center" style={{ fontFamily: 'var(--font-be-vietnam)', color: '#b0956b', fontSize: 11 }}>
            © 2026 | Tous droits réservés | Réalisé par{" "}
            <a href="https://www.andres-angulo.com/" className="hover:text-[#f39220] transition-colors" style={{ color: '#b0956b' }}>
              Andrés Angulo
            </a>
          </p>
        </footer>

      </main>
    </div>
  );
}

import Header from './components/Header';
import LinkButton from './components/LinkButton';
import { links } from './data/links';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faPhone } from "@fortawesome/free-solid-svg-icons";

export default function Home() {
  return (
    // Centered white column — same width as card, full screen height
    <div className="min-h-screen flex justify-center px-4">

      <main className="min-h-screen w-full max-w-sm bg-white px-6 flex flex-col">

        {/* Main content — vertically centered in available space */}
        <div className="flex-1 flex flex-col gap-8 py-10">

          {/* Logo, title and description */}
          <Header
            logoUrl="https://raw.githubusercontent.com/andres-angulo-dev/sio2_renovations_frontend/refs/heads/main/assets/black_logo.svg"
            title="SiO₂ Rénovations"
            description="Des artisans expérimentés à votre service pour tous vos projets de rénovation. Chaque intervention est menée avec précision, professionnalisme et souci du travail bien fait, pour un résultat à la hauteur de vos attentes."
          />

          {/* Redirect buttons */}
          <div className="flex flex-col gap-3 pt-8">
            {links.map((item) => (
              <LinkButton
                key={item.url}
                label={item.label}
                url={item.url}
                icon={item.icon}
              />
            ))}
          </div>

          {/* Contact info — email and phone side by side */}
          <div className="flex gap-2 pt-5">

            {/* Email block */}
            <div
              className="flex-[2] min-w-0 flex items-center gap-2 bg-orange-50 rounded-xl px-2 py-2"
              style={{ borderLeft: '3px solid #F39220' }}
            >
              <FontAwesomeIcon icon={faEnvelope} className="text-[#F39220] flex-shrink-0 text-xs" />
              <div className="flex flex-col gap-0 min-w-0">
                <span className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase truncate">Email</span>
                <span className="text-[12px] text-gray-700 truncate">contact@sio2renovations.com</span>
              </div>
            </div>

            {/* Phone block */}
            <div
              className="min-w-0 flex items-center gap-2 bg-orange-50 rounded-xl px-2 py-2"
              style={{ borderLeft: '3px solid #F39220' }}
            >
              <FontAwesomeIcon icon={faPhone} className="text-[#F39220] flex-shrink-0 text-xs" />
              <div className="flex flex-col gap-0 min-w-0">
                <span className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase truncate">Téléphone</span>
                <span className="text-[12px] text-gray-700 truncate">07 56 88 87 01</span>
              </div>
            </div>

          </div>

        </div>

        {/* Footer — pinned to bottom with spacing */}
        <footer className="pb-8 pt-4">
          <p className="text-center text-xs text-gray-400">
            © 2026 | Tous droits réservés | Réalisé par{" "}
            <a href="https://www.andres-angulo.com/" className="hover:text-[#F39220] transition-colors">
              Andrés Angulo
            </a>
          </p>
        </footer>

      </main>
    </div>
  );
}

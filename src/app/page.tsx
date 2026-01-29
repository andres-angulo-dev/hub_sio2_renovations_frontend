import Image from "next/legacy/image";
import Header from './components/Header';
import LinkButton from './components/LinkButton';
import { links } from './data/links';

export default function Home() {
  return (
    <main className='flex flex-col justify-between min-h-screen max-w-md mx-auto px-4 py-4 bg-orange-100'>
      <div>
        <Header
          logoUrl='https://raw.githubusercontent.com/andres-angulo-dev/sio2_renovations_frontend/refs/heads/main/assets/black_logo.svg'
          title="Entreprise générale du bâtiment tous corps d'état"
          presentation="Au fil des années, nous avons construit une expertise solide qui nous permet d’orchestrer chaque projet avec une vision globale. De la rénovation complète aux ajustements les plus précis, nous transformons vos idées en réalité en alliant esthétique, maîtrise technique, respect des délais et des normes actuelles."
        />

        <div className='mt-6'>
          <div className='flex flex-col items-center gap-2 mb-5'>
            <Image alt="email-icon" layout="fixed" src='/email-icon.png' width={35} height={35} />
            <p className='text-center break-all'>contact@sio2renovations.com</p>
          </div>
          <div className='flex flex-col items-center gap-2 mb-4'>
            <Image alt="phone-icon" layout="fixed" src='/phone-icon.png' width={35} height={35} />
            <p className='text-center break-all text-black'>contact@sio2renovations.com</p>
          </div>
        </div>
        
        <div className='pt-6'>
          {links.map((item) => (
            <LinkButton 
              key= {item.url}
              label= {item.label}
              url={item.url}
              icon={item.icon}
            />
          ))}
        </div>
      </div>


      <div className='mt-20 flex justify-center text-sm'>
        <span className='flex flex-wrap gap-1'>
          <p className="text-black">© 2026 | Tous droits réservés | Réalisé par</p>
          <a href='https://www.andres-angulo.com/'>
            <span className='hover:text-[#F39220] text-black'>Andrés Angulo</span>
          </a>
        </span>
        <p>.</p>
      </div>
    </main>
  )
}
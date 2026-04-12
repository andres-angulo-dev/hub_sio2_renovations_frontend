"use client";

import React from "react";
import Image from "next/image";

interface HeaderProps {
  logoUrl?: string;
  title: string; // utilisé pour l'alt du logo et le h1
}

/**
 * Header éditorial — style "The Modern Atelier"
 * Disposition : logo à gauche + label "Maison de Qualité" à droite
 * puis titre grand format sur 2 lignes + signature thread orange 1px
 */
const Header: React.FC<HeaderProps> = ({ logoUrl, title }) => {
  return (
    <header className="flex flex-col gap-5 pt-8">

      {/* Ligne 1 : Logo (gauche) + label Maison de Qualité (droite) */}
      <div className="flex items-center">
        {logoUrl && (
          // Cercle orange border avec ombre ambiante
          <div
            className="bg-white rounded-full flex items-center justify-center overflow-hidden flex-shrink-0"
            style={{
              width: 80, height: 80,
              border: '5px solid #f39220',
              boxShadow: '0 0 0 8px rgba(243,146,32,0.12), 0 8px 24px rgba(0,0,0,0.12)',
            }}
          >
            <Image
              src={logoUrl}
              alt={`Logo ${title}`}
              width={58}
              height={58}
              style={{ objectFit: 'contain' }}
            />
          </div>
        )}

        {/* Label éditorial — top right */}
        <span
          className="pl-5"
          style={{
            fontFamily: 'var(--font-be-vietnam)',
            color: '#f39220',
            fontSize: 11,
            letterSpacing: '0.08em',
            fontStyle: 'italic',
          }}
        >
          Entreprise Générale du Bâtiment
        </span>
      </div>

      {/* Titre grand éditorial — 2 lignes */}
      <h1
        style={{
          fontFamily: 'var(--font-be-vietnam)',
          color: '#1e1b17',
          letterSpacing: '-0.02em',
          lineHeight: 1.05,
        }}
        className="text-4xl font-black"
      >
        {title}
      </h1>

      {/* Signature Thread — 1px orange */}
      <div style={{ width: '100%', height: 1, background: '#f39220', opacity: 0.5 }} />

    </header>
  );
};

export default Header;

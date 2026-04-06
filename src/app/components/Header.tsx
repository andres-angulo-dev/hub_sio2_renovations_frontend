"use client";

import React from "react";
import Image from "next/image";

interface HeaderProps {
    logoUrl?: string;
    title: string;
    description?: string;
}

// Hub page header: logo, company name and short description
const Header: React.FC<HeaderProps> = ({ title, description, logoUrl }) => {
    return (
        <header className="flex flex-col items-center text-center gap-3 pt-8">
            {logoUrl && (
                // Logo circle with orange ring and subtle glow
                <div className="bg-white rounded-full border-[5px] border-[#F39220] shadow-[0_0_0_8px_rgba(243,146,32,0.12),0_8px_24px_rgba(0,0,0,0.12)] w-[116px] h-[116px] flex items-center justify-center overflow-hidden flex-shrink-0">
                    <Image
                        src={logoUrl}
                        alt="Logo SiO₂ Rénovations"
                        width={90}
                        height={90}
                        style={{ objectFit: 'contain' }}
                    />
                </div>
            )}

            <h1 className="text-2xl font-extrabold text-gray-900 mt-1 pt-10">
                {title}
            </h1>

            {description && (
                <p className="text-gray-500 text-sm leading-relaxed">
                    {description}
                </p>
            )}
        </header>
    );
};

export default Header;

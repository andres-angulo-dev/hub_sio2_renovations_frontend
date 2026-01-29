"use client";

import React from "react";
import Image from "next/legacy/image";

interface HeaderProps {
    logoUrl?: string;
    title: string;
    presentation?: string;
}

const Header: React.FC<HeaderProps> = ({ title, presentation, logoUrl }) => {
    return( 
        <header className="flex flex-col items-center text-center gap-3 py-6">
            {logoUrl && (
                <div className="bg-white rounded-full border-4 border-[#F39220] shadow-lg p-5">
                    <Image
                        src={logoUrl}
                        alt="Logo"
                        width={150}
                        height={150}
                    />
                </div>
            )}

            <h1 className="text-2xl font-bold text-gray-900 pt-4">
                {title}
            </h1>

            {presentation && (
                <p className="text-gray-600 text-base">
                    {presentation}
                </p>
            )}
        </header> 
    )
}

export default Header;
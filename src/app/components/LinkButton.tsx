"use client";

import React from 'react';

interface LinkButtonProps {
    label: string;
    url: string;
    icon?: React.ReactNode;
}

const linkButton: React.FC<LinkButtonProps> = ({
    label,
    url,
    icon,
}) => {
    return (
        <a 
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="
                flex items-center gap-3
                justify-center
                w-full px-4 py-3
                bg-[#F39220]
                rounded-full shadow-md
                hover:bg-orange-100
                transition-all duration-200
                mb-3
            "
        >
            {icon && <span className="text-2xl">{icon}</span>}
            <span className="font-medium text-black brea">{label}</span>
        </a>
    )
}

export default linkButton
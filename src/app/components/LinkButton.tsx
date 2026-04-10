"use client";

import React from 'react';

interface LinkButtonProps {
    label: string;
    url: string;
    icon?: React.ReactNode;
}

// Redirect button with orange gradient and subtle hover effect
const LinkButton: React.FC<LinkButtonProps> = ({ label, url, icon }) => {
    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="relative flex items-center justify-center w-full px-4 py-4 rounded-lg text-white font-semibold cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            style={{
                background: 'linear-gradient(135deg, #f39220, #8c4f00)',
                boxShadow: '0 8px 30px rgba(30,27,23,0.08)',
                borderLeft: '4px solid rgba(255,220,120,0.75)',
            }}
        >
            {/* Icon anchored to the left */}
            {icon && <span className="absolute left-4 text-lg">{icon}</span>}
            {/* Label centered across the full width */}
            <span>{label}</span>
        </a>
    );
};

export default LinkButton;

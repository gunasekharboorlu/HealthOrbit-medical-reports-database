import React, { useState } from 'react';

interface AvatarProps {
  name: string;
  src?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export default function Avatar({
  name,
  src,
  size = 'md',
  className = '',
}: AvatarProps) {
  const [imageError, setImageError] = useState(false);

  // Compute 2-letter initials from name, ignoring honorific titles
  const getInitials = (fullName: string): string => {
    if (!fullName) return 'U';
    
    // Clean out honorifics like Dr., Prof., Mr., Mrs., Ms.
    const cleanName = fullName
      .replace(/^(Dr\.|Doctor|Prof\.|Mr\.|Mrs\.|Ms\.)\s+/i, '')
      .trim();

    const parts = cleanName.split(/\s+/).filter(Boolean);
    
    if (parts.length === 0) return 'U';
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const initials = getInitials(name);

  // Size mapping
  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-lg',
    xl: 'w-20 h-20 text-2xl',
  }[size];

  const hasValidImage = src && src.trim().length > 0 && !imageError;

  if (hasValidImage) {
    return (
      <img
        src={src}
        alt={name}
        onError={() => setImageError(true)}
        className={`${sizeClasses} rounded-full object-cover border border-[#38bdf8]/40 shadow-md ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeClasses} rounded-full bg-gradient-to-tr from-[#0284c7]/30 via-[#38bdf8]/20 to-[#4f8cff]/30 border border-[#38bdf8]/50 flex items-center justify-center font-mono font-black text-[#38bdf8] shadow-md shrink-0 select-none ${className}`}
    >
      {initials}
    </div>
  );
}

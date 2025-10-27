'use client';

import { motion } from 'framer-motion';
import { FaFacebookF, FaInstagram, FaWhatsapp } from "react-icons/fa";
import { SiTiktok } from "react-icons/si";

interface SocialIconsProps {
  variant?: 'default' | 'restaurant' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function SocialIcons({ 
  variant = 'restaurant', 
  size = 'md',
  className = '' 
}: SocialIconsProps) {
  
  const socialLinks = [
    { 
      name: 'Facebook', 
      href: 'https://facebook.com/BoucherieFine', 
      icon: <FaFacebookF />,
      hoverColor: variant === 'restaurant' ? 'hover:bg-blue-600' : 'hover:text-blue-600'
    },
    { 
      name: 'Instagram', 
      href: 'https://instagram.com/boucheriefine', 
      icon: <FaInstagram />,
      hoverColor: variant === 'restaurant' ? 'hover:bg-pink-600' : 'hover:text-pink-600'
    },
    { 
      name: 'TikTok', 
      href: 'https://tiktok.com/@boucheriefine', 
      icon: <SiTiktok />,
      hoverColor: variant === 'restaurant' ? 'hover:bg-black' : 'hover:text-black'
    },
    { 
      name: 'WhatsApp', 
      href: 'https://wa.me/2250544544735', 
      icon: <FaWhatsapp />,
      hoverColor: variant === 'restaurant' ? 'hover:bg-green-600' : 'hover:text-green-600'
    },
  ];

  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-xl',
    lg: 'w-16 h-16 text-2xl'
  };

  const getVariantClasses = (social: typeof socialLinks[0]) => {
    switch (variant) {
      case 'restaurant':
        return `${sizeClasses[size]} bg-restaurant-primary ${social.hoverColor} rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 shadow-lg text-white`;
      case 'minimal':
        return `${sizeClasses[size]} text-gray-700 ${social.hoverColor} transition-colors duration-300`;
      default:
        return `${sizeClasses[size]} bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 shadow-lg text-gray-700`;
    }
  };

  return (
    <div className={`flex gap-4 justify-center items-center ${className}`}>
      {socialLinks.map((social) => (
        <motion.a
          key={social.name}
          href={social.href}
          target="_blank"
          rel="noopener noreferrer"
          className={getVariantClasses(social)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          title={`Suivez-nous sur ${social.name}`}
        >
          {social.icon}
        </motion.a>
      ))}
    </div>
  );
}
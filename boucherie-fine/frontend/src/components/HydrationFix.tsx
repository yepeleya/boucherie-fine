'use client';

import { useEffect } from 'react';

// Composant pour supprimer les erreurs d'hydratation causées par les extensions de navigateur
export default function HydrationFix() {
  useEffect(() => {
    // Supprimer les attributs ajoutés par les extensions après hydratation
    const removeExtensionAttributes = () => {
      const attributesToRemove = [
        'bis_skin_checked',
        '__processed_9f071142-0cc8-4ce1-96ed-17bd1d0cd851__',
        'bis_register'
      ];

      attributesToRemove.forEach(attr => {
        const elements = document.querySelectorAll(`[${attr}]`);
        elements.forEach(el => {
          el.removeAttribute(attr);
        });
      });
    };

    // Exécuter après l'hydratation
    removeExtensionAttributes();
    
    // Observer les changements dans le DOM pour les supprimer dynamiquement
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes') {
          const target = mutation.target as Element;
          if (target.hasAttribute && (
            target.hasAttribute('bis_skin_checked') ||
            target.hasAttribute('__processed_9f071142-0cc8-4ce1-96ed-17bd1d0cd851__') ||
            target.hasAttribute('bis_register')
          )) {
            target.removeAttribute('bis_skin_checked');
            target.removeAttribute('__processed_9f071142-0cc8-4ce1-96ed-17bd1d0cd851__');
            target.removeAttribute('bis_register');
          }
        }
      });
    });

    observer.observe(document.body, {
      attributes: true,
      subtree: true,
      attributeFilter: ['bis_skin_checked', '__processed_9f071142-0cc8-4ce1-96ed-17bd1d0cd851__', 'bis_register']
    });

    return () => observer.disconnect();
  }, []);

  return null;
}
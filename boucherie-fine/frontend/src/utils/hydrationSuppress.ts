// Suppression des erreurs d'hydratation en développement
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // Supprimer les warnings d'hydratation spécifiques aux extensions
  const originalConsoleError = console.error;
  console.error = (...args) => {
    const errorMessage = args[0];
    
    // Ignorer les erreurs d'hydratation liées aux extensions de navigateur
    if (
      typeof errorMessage === 'string' && (
        errorMessage.includes('A tree hydrated but some attributes of the server rendered HTML didn\'t match') ||
        errorMessage.includes('bis_skin_checked') ||
        errorMessage.includes('__processed_') ||
        errorMessage.includes('bis_register')
      )
    ) {
      return; // Ignorer cette erreur
    }
    
    // Afficher toutes les autres erreurs normalement
    originalConsoleError.apply(console, args);
  };
}

export {};
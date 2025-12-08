import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  XMarkIcon,
  PhotoIcon,
  EyeIcon,
  CloudArrowUpIcon
} from '@heroicons/react/24/outline';

const ActualiteForm = ({ 
  isOpen, 
  onClose, 
  actualite = null, 
  onSave 
}) => {
  const [formData, setFormData] = useState({
    titre: '',
    slug: '',
    extrait: '',
    contenu: '',
    categorie: 'Actualités',
    imageUrl: '',
    auteur: 'Administration — La Boucherie Fine',
    actif: true
  });

  const [loading, setLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  // Catégories disponibles
  const categories = [
    'Actualités',
    'Menu', 
    'Service',
    'Événement',
    'Partenariat',
    'Décoration',
    'Promotion'
  ];

  useEffect(() => {
    if (actualite) {
      setFormData({
        titre: actualite.titre || '',
        slug: actualite.slug || '',
        extrait: actualite.extrait || '',
        contenu: actualite.contenu || '',
        categorie: actualite.categorie || 'Actualités',
        imageUrl: actualite.imageUrl || '',
        auteur: actualite.auteur || 'Administration — La Boucherie Fine',
        actif: actualite.actif !== undefined ? actualite.actif : true
      });
    } else {
      // Reset form for new article
      setFormData({
        titre: '',
        slug: '',
        extrait: '',
        contenu: '',
        categorie: 'Actualités',
        imageUrl: '',
        auteur: 'Administration — La Boucherie Fine',
        actif: true
      });
    }
  }, [actualite, isOpen]);

  // Générer automatiquement le slug à partir du titre
  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
      .replace(/[^\w\s-]/g, '') // Supprimer les caractères spéciaux
      .replace(/\s+/g, '-') // Remplacer les espaces par des tirets
      .replace(/-+/g, '-') // Supprimer les tirets multiples
      .trim('-'); // Supprimer les tirets en début/fin
  };

  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setFormData(prev => ({
      ...prev,
      titre: newTitle,
      slug: generateSlug(newTitle)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = actualite 
        ? `/api/actualites/admin/${actualite.id}`
        : '/api/actualites/admin';
      
      const method = actualite ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        onSave();
        onClose();
      } else {
        throw new Error('Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full"
        >
          {/* Header */}
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 border-b">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl leading-6 font-bold text-gray-900">
                {actualite ? 'Modifier l\'actualité' : 'Nouvelle actualité'}
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPreviewMode(!previewMode)}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                >
                  <EyeIcon className="w-4 h-4" />
                  {previewMode ? 'Éditer' : 'Aperçu'}
                </button>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="bg-white">
            <div className="px-4 py-6 sm:px-6 max-h-[calc(100vh-200px)] overflow-y-auto">
              {previewMode ? (
                // Mode Aperçu
                <div className="prose max-w-none">
                  <div className="mb-6">
                    {formData.imageUrl && (
                      <img 
                        src={formData.imageUrl} 
                        alt={formData.titre}
                        className="w-full h-64 object-cover rounded-lg mb-4"
                      />
                    )}
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {formData.titre || 'Titre de l\'actualité'}
                    </h1>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                      <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full">
                        {formData.categorie}
                      </span>
                      <span>Par {formData.auteur}</span>
                      <span>{new Date().toLocaleDateString('fr-FR')}</span>
                    </div>
                    {formData.extrait && (
                      <p className="text-xl text-gray-600 leading-relaxed mb-6">
                        {formData.extrait}
                      </p>
                    )}
                    <div 
                      className="prose prose-lg max-w-none"
                      dangerouslySetInnerHTML={{ 
                        __html: formData.contenu.replace(/\n/g, '<br>') 
                      }} 
                    />
                  </div>
                </div>
              ) : (
                // Mode Édition
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Colonne gauche */}
                  <div className="space-y-6">
                    {/* Titre */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Titre de l'actualité *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.titre}
                        onChange={handleTitleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Titre de votre actualité..."
                      />
                    </div>

                    {/* Slug */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Slug (URL)
                      </label>
                      <input
                        type="text"
                        value={formData.slug}
                        onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="url-de-larticle"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        URL: /news/{formData.slug}
                      </p>
                    </div>

                    {/* Extrait */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Extrait
                      </label>
                      <textarea
                        value={formData.extrait}
                        onChange={(e) => setFormData(prev => ({ ...prev, extrait: e.target.value }))}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Résumé de votre actualité..."
                        maxLength={500}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {formData.extrait.length}/500 caractères
                      </p>
                    </div>

                    {/* Catégorie et Auteur */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Catégorie
                        </label>
                        <select
                          value={formData.categorie}
                          onChange={(e) => setFormData(prev => ({ ...prev, categorie: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        >
                          {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Auteur
                        </label>
                        <input
                          type="text"
                          value={formData.auteur}
                          onChange={(e) => setFormData(prev => ({ ...prev, auteur: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    {/* Image */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Image de couverture
                      </label>
                      <input
                        type="url"
                        value={formData.imageUrl}
                        onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="https://example.com/image.jpg"
                      />
                      {formData.imageUrl && (
                        <div className="mt-2">
                          <img 
                            src={formData.imageUrl} 
                            alt="Aperçu"
                            className="w-full h-32 object-cover rounded-lg"
                          />
                        </div>
                      )}
                    </div>

                    {/* Statut */}
                    <div>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.actif}
                          onChange={(e) => setFormData(prev => ({ ...prev, actif: e.target.checked }))}
                          className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          Publier immédiatement
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Colonne droite - Contenu */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contenu de l'article *
                    </label>
                    <textarea
                      required
                      value={formData.contenu}
                      onChange={(e) => setFormData(prev => ({ ...prev, contenu: e.target.value }))}
                      rows={20}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Rédigez le contenu de votre actualité ici..."
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Vous pouvez utiliser du HTML pour formater votre contenu.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                disabled={loading || previewMode}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sauvegarde...
                  </div>
                ) : (
                  actualite ? 'Mettre à jour' : 'Publier'
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Annuler
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default ActualiteForm;
// src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../hooks/useTheme.jsx';
import { 
  UsersIcon, 
  CubeIcon, 
  ClipboardDocumentListIcon, 
  CurrencyDollarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon,
  ArrowTrendingUpIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { dashboardService } from '../services/api';
import Preloader, { CardLoader } from '../components/Preloader';

// Données mockées pour la démo
const mockStats = {
  users: { total: 1247, change: +12.5, trend: 'up' },
  orders: { total: 342, change: +8.2, trend: 'up' },
  products: { total: 89, change: +2.1, trend: 'up' },
  revenue: { total: 45780, change: +15.3, trend: 'up' }
};

const mockChartData = [
  { name: 'Lun', ventes: 4000, commandes: 24, revenus: 3200 },
  { name: 'Mar', ventes: 3000, commandes: 18, revenus: 2800 },
  { name: 'Mer', ventes: 5000, commandes: 32, revenus: 4200 },
  { name: 'Jeu', ventes: 2780, commandes: 19, revenus: 2500 },
  { name: 'Ven', ventes: 1890, commandes: 14, revenus: 1800 },
  { name: 'Sam', ventes: 6390, commandes: 41, revenus: 5200 },
  { name: 'Dim', ventes: 4200, commandes: 28, revenus: 3800 },
];

const mockPieData = [
  { name: 'Viandes', value: 45, color: '#E50914' },
  { name: 'Charcuterie', value: 30, color: '#FF6B6B' },
  { name: 'Accompagnements', value: 25, color: '#4ECDC4' },
];

const mockRecentActivity = [
  { action: 'Nouvelle commande', user: 'Marie Dubois', time: 'Il y a 5 min', type: 'order', avatar: 'MD' },
  { action: 'Nouvel utilisateur', user: 'Pierre Martin', time: 'Il y a 15 min', type: 'user', avatar: 'PM' },
  { action: 'Produit ajouté', user: 'Admin', time: 'Il y a 1h', type: 'product', avatar: 'AD' },
  { action: 'Paiement reçu', user: 'Sophie Laurent', time: 'Il y a 2h', type: 'payment', avatar: 'SL' },
  { action: 'Réservation confirmée', user: 'Jean Dupont', time: 'Il y a 3h', type: 'reservation', avatar: 'JD' },
];

export default function Home() {
  const { isDark } = useTheme();
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('7d');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Simuler l'appel API
        await new Promise(resolve => setTimeout(resolve, 1500));
        setStats(mockStats);
        setChartData(mockChartData);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        setStats(mockStats);
        setChartData(mockChartData);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedPeriod]);

  if (loading) {
    return <Preloader text="Chargement des statistiques..." />;
  }

  const StatCard = ({ title, value, change, trend, icon: Icon, color, formatValue }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -2 }}
      className={`card p-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className={`text-sm font-medium mb-2 ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            {title}
          </p>
          <p className={`text-3xl font-bold ${
            isDark ? 'text-white' : 'text-brand-black'
          }`}>
            {formatValue ? formatValue(value) : value.toLocaleString()}
          </p>
          
          <div className="flex items-center mt-3">
            <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              trend === 'up' 
                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
            }`}>
              {trend === 'up' ? (
                <ArrowUpIcon className="h-3 w-3 mr-1" />
              ) : (
                <ArrowDownIcon className="h-3 w-3 mr-1" />
              )}
              {Math.abs(change)}%
            </div>
            <span className={`text-xs ml-2 ${
              isDark ? 'text-gray-500' : 'text-gray-500'
            }`}>
              vs période précédente
            </span>
          </div>
        </div>
        
        <div className={`p-4 rounded-2xl ${color}`}>
          <Icon className="h-8 w-8 text-white" />
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-8">
      {/* En-tête avec animation */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <div>
          <h1 className={`text-4xl font-bold ${
            isDark ? 'text-white' : 'text-brand-black'
          }`}>
            Tableau de bord
          </h1>
          <p className={`text-lg mt-2 ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Aperçu de votre activité - La Boucherie Fine
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className={`px-4 py-2 rounded-lg border ${
              isDark 
                ? 'bg-gray-800 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-brand-black'
            } focus:ring-2 focus:ring-brand-red focus:border-brand-red`}
          >
            <option value="7d">7 derniers jours</option>
            <option value="30d">30 derniers jours</option>
            <option value="90d">3 derniers mois</option>
          </select>
        </div>
      </motion.div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Utilisateurs inscrits"
          value={stats.users.total}
          change={stats.users.change}
          trend={stats.users.trend}
          icon={UsersIcon}
          color="bg-gradient-to-r from-blue-500 to-blue-600"
        />
        <StatCard
          title="Commandes totales"
          value={stats.orders.total}
          change={stats.orders.change}
          trend={stats.orders.trend}
          icon={ClipboardDocumentListIcon}
          color="bg-gradient-to-r from-green-500 to-green-600"
        />
        <StatCard
          title="Produits actifs"
          value={stats.products.total}
          change={stats.products.change}
          trend={stats.products.trend}
          icon={CubeIcon}
          color="bg-gradient-to-r from-purple-500 to-purple-600"
        />
        <StatCard
          title="Chiffre d'affaires"
          value={stats.revenue.total}
          change={stats.revenue.change}
          trend={stats.revenue.trend}
          icon={CurrencyDollarIcon}
          color="bg-gradient-to-r from-red-500 to-brand-red"
          formatValue={(value) => `${value.toLocaleString()} €`}
        />
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Graphique des ventes */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className={`lg:col-span-2 card ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}
        >
          <div className="card-header">
            <div className="flex items-center justify-between">
              <h3 className={`text-lg font-semibold ${
                isDark ? 'text-white' : 'text-brand-black'
              }`}>
                Évolution des revenus
              </h3>
              <div className="flex items-center space-x-2">
                <ArrowTrendingUpIcon className="h-5 w-5 text-green-500" />
                <span className="text-sm text-green-500 font-medium">+15.3%</span>
              </div>
            </div>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E50914" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#E50914" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#E5E7EB'} />
                <XAxis 
                  dataKey="name" 
                  stroke={isDark ? '#9CA3AF' : '#6B7280'}
                  fontSize={12}
                />
                <YAxis 
                  stroke={isDark ? '#9CA3AF' : '#6B7280'}
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                    border: isDark ? '1px solid #374151' : '1px solid #E5E7EB',
                    borderRadius: '8px',
                    color: isDark ? '#F3F4F6' : '#1F2937'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenus" 
                  stroke="#E50914" 
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Répartition par catégorie */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className={`card ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}
        >
          <div className="card-header">
            <h3 className={`text-lg font-semibold ${
              isDark ? 'text-white' : 'text-brand-black'
            }`}>
              Ventes par catégorie
            </h3>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={mockPieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {mockPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="mt-4 space-y-2">
              {mockPieData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className={`text-sm ${
                      isDark ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {item.name}
                    </span>
                  </div>
                  <span className={`text-sm font-medium ${
                    isDark ? 'text-white' : 'text-brand-black'
                  }`}>
                    {item.value}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Graphique des commandes et activité récente */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graphique des commandes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={`card ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}
        >
          <div className="card-header">
            <h3 className={`text-lg font-semibold ${
              isDark ? 'text-white' : 'text-brand-black'
            }`}>
              Commandes de la semaine
            </h3>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#E5E7EB'} />
                <XAxis 
                  dataKey="name" 
                  stroke={isDark ? '#9CA3AF' : '#6B7280'}
                  fontSize={12}
                />
                <YAxis 
                  stroke={isDark ? '#9CA3AF' : '#6B7280'}
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                    border: isDark ? '1px solid #374151' : '1px solid #E5E7EB',
                    borderRadius: '8px',
                    color: isDark ? '#F3F4F6' : '#1F2937'
                  }}
                />
                <Bar 
                  dataKey="commandes" 
                  fill="#E50914" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Activité récente */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className={`card ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}
        >
          <div className="card-header">
            <div className="flex items-center justify-between">
              <h3 className={`text-lg font-semibold ${
                isDark ? 'text-white' : 'text-brand-black'
              }`}>
                Activité récente
              </h3>
              <button className="text-brand-red hover:text-red-700 text-sm font-medium flex items-center">
                <EyeIcon className="h-4 w-4 mr-1" />
                Tout voir
              </button>
            </div>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              {mockRecentActivity.map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className={`flex items-center space-x-3 p-3 rounded-lg hover:bg-opacity-50 transition-colors ${
                    isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                    activity.type === 'order' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                    activity.type === 'user' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                    activity.type === 'product' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400' :
                    activity.type === 'payment' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                    'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400'
                  }`}>
                    {activity.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${
                      isDark ? 'text-white' : 'text-brand-black'
                    }`}>
                      {activity.action}
                    </p>
                    <p className={`text-sm ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {activity.user}
                    </p>
                  </div>
                  <span className={`text-xs ${
                    isDark ? 'text-gray-500' : 'text-gray-400'
                  }`}>
                    {activity.time}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
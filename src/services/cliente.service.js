'use client';

import React, { useState, useMemo } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  BarChart3, PhoneCall, Target, Briefcase, UserCheck, 
  FileText, Settings, TrendingUp, ChevronRight, Users,
  Calendar, PieChart, Rocket, LayoutDashboard, Filter
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart as RePieChart, Pie, Cell 
} from 'recharts';

// Importación de tus componentes personalizados (Marcadores de posición)
// Asegúrate de que estos archivos existan o comenta las líneas si aún no los tienes
import GestionLlamadas from './components/GestionLlamadas';
import ConversionVentas from './components/ConversionVentas';
import TiposServiciosVendidos from './components/TiposServiciosVendidos';
import ControlPresupuesto from './components/ControlPresupuesto';
import CalculoComision from './components/CalculoComision';
import IndicadoresVendedor from './components/IndicadoresVendedor';
import GestionCotizaciones from './components/GestionCotizaciones';

// --- DATOS MOCK PARA EL DASHBOARD PRINCIPAL (Cumpliendo requerimiento de 5 vendedores) ---
const VENDEDORES = ['Todos', 'Ana', 'Carlos', 'Beatriz', 'David', 'Elena'];
const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril'];

const DATA_VENTAS = [
  { name: 'Ana', ventas: 45000, llamadas: 120, conversion: 12 },
  { name: 'Carlos', ventas: 38000, llamadas: 150, conversion: 8 },
  { name: 'Beatriz', ventas: 52000, llamadas: 100, conversion: 15 },
  { name: 'David', ventas: 31000, llamadas: 90, conversion: 10 },
  { name: 'Elena', ventas: 49000, llamadas: 130, conversion: 11 },
];

const DATA_TENDENCIA = [
  { dia: 'Sem 1', ventas: 12000 },
  { dia: 'Sem 2', ventas: 19000 },
  { dia: 'Sem 3', ventas: 15000 },
  { dia: 'Sem 4', ventas: 28000 },
];

const DATA_SERVICIOS = [
  { name: 'Consultoría', value: 400 },
  { name: 'Implementación', value: 300 },
  { name: 'Soporte', value: 300 },
  { name: 'Licencias', value: 200 },
];

const COLORS = ['#0F2346', '#FF6B00', '#00C49F', '#FFBB28']; // Colores corporativos (Azul oscuro y Naranja Ruwark)

export default function DashboardVentasPage() {
  const [activeTab, setActiveTab] = useState('Visualización');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Estados para filtros del dashboard principal
  const [selectedVendedor, setSelectedVendedor] = useState('Todos');
  const [selectedMes, setSelectedMes] = useState('Febrero');

  const menuItems = [
    { name: 'Visualización', icon: <LayoutDashboard size={18} /> },
    { name: 'Gestión de Llamadas', icon: <PhoneCall size={18} /> },
    { name: 'Conversión', icon: <TrendingUp size={18} /> },
    { name: 'Servicios', icon: <Briefcase size={18} /> },
    { name: 'Presupuesto', icon: <Target size={18} /> },
    { name: 'Calculo de Comisión', icon: <UserCheck size={18} /> },
    { name: 'Indicadores', icon: <PieChart size={18} /> },
    { name: 'Cotizaciones', icon: <FileText size={18} /> },
    { name: 'Configuración', icon: <Settings size={18} /> },
  ];

  // Lógica simple para filtrar datos (Simulación)
  const kpiData = useMemo(() => {
    if (selectedVendedor === 'Todos') {
      return {
        totalVentas: DATA_VENTAS.reduce((acc, curr) => acc + curr.ventas, 0),
        totalLlamadas: DATA_VENTAS.reduce((acc, curr) => acc + curr.llamadas, 0),
        promedioConversion: (DATA_VENTAS.reduce((acc, curr) => acc + curr.conversion, 0) / 5).toFixed(1)
      };
    } else {
      const vendedor = DATA_VENTAS.find(v => v.name === selectedVendedor) || DATA_VENTAS[0];
      return {
        totalVentas: vendedor.ventas,
        totalLlamadas: vendedor.llamadas,
        promedioConversion: vendedor.conversion
      };
    }
  }, [selectedVendedor]);

  // Función para renderizar el contenido dinámico
  const renderContent = () => {
    switch (activeTab) {
      case 'Gestión de Llamadas':
        return <GestionLlamadas />;
      
      case 'Conversión':
        return <ConversionVentas />;

      case 'Servicios':
        return <TiposServiciosVendidos />;

      case 'Presupuesto':
        return <ControlPresupuesto />;

      case 'Calculo de Comisión':
        return <CalculoComision />;

      case 'Indicadores':
        return <IndicadoresVendedor />;
        
      case 'Cotizaciones':
        return <GestionCotizaciones />;
      
      case 'Visualización':
      default:
        return (
          <div className="p-6 space-y-6">
            {/* Barra de Filtros (Requerimiento Gerencia) */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex flex-wrap gap-4 items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter size={20} className="text-gray-500" />
                <span className="font-semibold text-gray-700">Filtros de Vista:</span>
              </div>
              <div className="flex gap-4">
                <select 
                  className="border rounded-md px-3 py-1.5 text-sm bg-gray-50 focus:ring-2 focus:ring-orange-500 outline-none"
                  value={selectedMes}
                  onChange={(e) => setSelectedMes(e.target.value)}
                >
                  {MESES.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <select 
                  className="border rounded-md px-3 py-1.5 text-sm bg-gray-50 focus:ring-2 focus:ring-orange-500 outline-none"
                  value={selectedVendedor}
                  onChange={(e) => setSelectedVendedor(e.target.value)}
                >
                  {VENDEDORES.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
            </div>

            {/* KPIs Principales */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-900">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Ventas Totales</p>
                    <h3 className="text-2xl font-bold text-gray-800">${kpiData.totalVentas.toLocaleString()}</h3>
                  </div>
                  <div className="p-2 bg-blue-50 rounded-lg text-blue-900"><Target size={24} /></div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-orange-500">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Llamadas Realizadas</p>
                    <h3 className="text-2xl font-bold text-gray-800">{kpiData.totalLlamadas}</h3>
                  </div>
                  <div className="p-2 bg-orange-50 rounded-lg text-orange-500"><PhoneCall size={24} /></div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Tasa de Conversión</p>
                    <h3 className="text-2xl font-bold text-gray-800">{kpiData.promedioConversion}%</h3>
                  </div>
                  <div className="p-2 bg-green-50 rounded-lg text-green-600"><TrendingUp size={24} /></div>
                </div>
              </div>
            </div>

            {/* Gráficos (Si es 'Todos' muestra comparativa, si es individual muestra detalle) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Gráfico 1: Comparativa de Equipo o Histórico */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-80">
                <h4 className="font-semibold text-gray-700 mb-4">
                  {selectedVendedor === 'Todos' ? 'Rendimiento por Vendedor' : `Tendencia Mensual - ${selectedVendedor}`}
                </h4>
                <ResponsiveContainer width="100%" height="100%">
                  {selectedVendedor === 'Todos' ? (
                    <BarChart data={DATA_VENTAS}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" tick={{fontSize: 12}} />
                      <YAxis tick={{fontSize: 12}} />
                      <RechartsTooltip />
                      <Bar dataKey="ventas" fill="#0F2346" radius={[4, 4, 0, 0]} name="Ventas ($)" />
                    </BarChart>
                  ) : (
                    <LineChart data={DATA_TENDENCIA}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="dia" />
                      <YAxis />
                      <RechartsTooltip />
                      <Line type="monotone" dataKey="ventas" stroke="#FF6B00" strokeWidth={2} dot={{r: 4}} />
                    </LineChart>
                  )}
                </ResponsiveContainer>
              </div>

              {/* Gráfico 2: Distribución de Servicios */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-80">
                <h4 className="font-semibold text-gray-700 mb-4">Distribución por Servicio</h4>
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie
                      data={DATA_SERVICIOS}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {DATA_SERVICIOS.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                    <Legend verticalAlign="bottom" height={36} />
                  </RePieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Tabla Resumen (Solo visible en vista general) */}
            {selectedVendedor === 'Todos' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h4 className="font-semibold text-gray-700">Detalle del Equipo (5 Vendedores)</h4>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-600 font-medium border-b">
                      <tr>
                        <th className="px-6 py-3">Vendedor</th>
                        <th className="px-6 py-3 text-right">Ventas ($)</th>
                        <th className="px-6 py-3 text-right">Llamadas</th>
                        <th className="px-6 py-3 text-right">Conversión</th>
                        <th className="px-6 py-3 text-center">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {DATA_VENTAS.map((v) => (
                        <tr key={v.name} className="hover:bg-gray-50">
                          <td className="px-6 py-3 font-medium text-gray-800">{v.name}</td>
                          <td className="px-6 py-3 text-right">${v.ventas.toLocaleString()}</td>
                          <td className="px-6 py-3 text-right">{v.llamadas}</td>
                          <td className="px-6 py-3 text-right">{v.conversion}%</td>
                          <td className="px-6 py-3 text-center">
                            <span className={`px-2 py-1 rounded-full text-xs ${v.ventas > 40000 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                              {v.ventas > 40000 ? 'Objetivo Alcanzado' : 'En Progreso'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <DashboardLayout>
      <div className="flex h-screen bg-gray-100">
        {/* Sidebar */}
        <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} shadow-lg border-r transition-all duration-300 relative`} style={{backgroundColor: 'rgb(15, 35, 70)'}}>
          {/* Toggle Button */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="absolute -right-3 top-6 bg-orange-500 text-white rounded-full p-1 shadow-lg hover:bg-orange-600 transition-colors z-10"
          >
            <ChevronRight size={16} className={`transform transition-transform duration-300 ${sidebarCollapsed ? 'rotate-0' : 'rotate-180'}`} />
          </button>

          {/* Header del Sidebar */}
          <div className="p-2 border-b" style={{borderColor: 'rgba(255,255,255,0.1)'}}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500 rounded-lg flex-shrink-0">
                <BarChart3 size={20} className="text-white" />
              </div>
              {!sidebarCollapsed && (
                <h1 className="text-lg font-bold text-white">Dashboard Ventas</h1>
              )}
            </div>
          </div>

          {/* Menu Items */}
          <nav className="p-1 mt-2">
            <div className="space-y-1">
              {menuItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => setActiveTab(item.name)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-colors relative group
                    ${activeTab === item.name 
                      ? 'bg-orange-500 text-white shadow-md' 
                      : 'text-blue-100 hover:text-white hover:bg-white/10'}`}
                  title={sidebarCollapsed ? item.name : ''}
                >
                  <div className="flex-shrink-0">
                    {item.icon}
                  </div>
                  {!sidebarCollapsed && (
                    <span className="text-sm font-medium">{item.name}</span>
                  )}
                  
                  {/* Tooltip para cuando está colapsado */}
                  {sidebarCollapsed && (
                    <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                      {item.name}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header del contenido */}
          <div className="bg-white p-4 border-b border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800">{activeTab}</h2>
              <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full border">
                <Calendar size={16} />
                <span>{selectedMes} 2026</span>
              </div>
            </div>
          </div>

          {/* Contenido principal scrolleable */}
          <div className="flex-1 overflow-auto bg-gray-50">
            {renderContent()}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
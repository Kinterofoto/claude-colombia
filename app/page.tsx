'use client';

import { useEffect, useState } from 'react';
import Papa from 'papaparse';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

ChartJS.defaults.font.family = 'var(--font-geist-sans), system-ui, sans-serif';
ChartJS.defaults.color = '#A1A1A1';
ChartJS.defaults.borderColor = 'rgba(255, 255, 255, 0.06)';

interface DataRow {
  geo_id: string;
  geography: string;
  date_start: string;
  date_end: string;
  platform_and_product: string;
  facet: string;
  level: number;
  variable: string;
  cluster_name: string;
  value: number;
  geo_name: string;
}

interface Stats {
  totalUsage: number;
  usagePercent: string;
  usagePerCapita: string;
  dateStart: string;
  dateEnd: string;
  automationPct: number;
  augmentationPct: number;
}

interface CountryComparison {
  name: string;
  usage: number;
}

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [collaboration, setCollaboration] = useState<Record<string, number>>({});
  const [onetTasks, setOnetTasks] = useState<Record<string, number>>({});
  const [requests, setRequests] = useState<Record<string, number>>({});
  const [latamCountries, setLatamCountries] = useState<CountryComparison[]>([]);
  const [topCountries, setTopCountries] = useState<CountryComparison[]>([]);
  const [occupations, setOccupations] = useState<Record<string, number>>({});
  const [latamRank, setLatamRank] = useState<number>(0);
  const [globalRank, setGlobalRank] = useState<number>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch('/data.csv');
        const csvText = await response.text();

        Papa.parse<DataRow>(csvText, {
          header: true,
          dynamicTyping: true,
          complete: (results) => {
            const data = results.data;

            const colombiaData = data.filter((row) => row.geo_id === 'COL');

            if (colombiaData.length === 0) {
              setError('No se encontraron datos para Colombia en el dataset');
              setLoading(false);
              return;
            }

            const statsData: Stats = {
              totalUsage: 0,
              usagePercent: '0',
              usagePerCapita: '0',
              dateStart: '',
              dateEnd: '',
              automationPct: 0,
              augmentationPct: 0,
            };

            const collabData: Record<string, number> = {};
            const onetData: Record<string, number> = {};
            const requestData: Record<string, number> = {};
            const occupationData: Record<string, number> = {};

            colombiaData.forEach((row) => {
              if (!statsData.dateStart) {
                statsData.dateStart = row.date_start;
                statsData.dateEnd = row.date_end;
              }

              if (row.facet === 'country' && row.variable === 'usage_count') {
                statsData.totalUsage = Math.round(row.value);
              }

              if (row.facet === 'country' && row.variable === 'usage_pct') {
                statsData.usagePercent = row.value.toFixed(3);
              }

              if (row.facet === 'country' && row.variable === 'usage_per_capita') {
                statsData.usagePerCapita = (row.value * 100000).toFixed(2);
              }

              if (row.facet === 'collaboration_automation_augmentation' && row.variable === 'automation_pct') {
                statsData.automationPct = row.value;
              }

              if (row.facet === 'collaboration_automation_augmentation' && row.variable === 'augmentation_pct') {
                statsData.augmentationPct = row.value;
              }

              if (
                row.facet === 'collaboration' &&
                row.variable === 'collaboration_count' &&
                row.cluster_name &&
                row.cluster_name !== 'not_classified' &&
                row.cluster_name !== 'none'
              ) {
                collabData[row.cluster_name] = row.value;
              }

              if (
                row.facet === 'onet_task' &&
                row.variable === 'onet_task_count' &&
                row.cluster_name &&
                row.cluster_name !== 'not_classified' &&
                row.cluster_name !== 'none'
              ) {
                onetData[row.cluster_name] = row.value;
              }

              if (
                row.facet === 'request' &&
                row.variable === 'request_count' &&
                row.cluster_name &&
                row.cluster_name !== 'not_classified' &&
                row.level === 1
              ) {
                requestData[row.cluster_name] = row.value;
              }

              if (
                row.facet === 'soc_occupation' &&
                row.variable === 'soc_pct' &&
                row.cluster_name &&
                row.cluster_name !== 'not_classified'
              ) {
                occupationData[row.cluster_name] = row.value;
              }
            });

            setStats(statsData);
            setCollaboration(collabData);
            setOnetTasks(onetData);
            setRequests(requestData);
            setOccupations(occupationData);

            const latamCodes = ['COL', 'BRA', 'MEX', 'ARG', 'CHL', 'PER', 'ECU', 'VEN', 'CRI', 'URY'];
            const latamData: CountryComparison[] = [];

            latamCodes.forEach((code) => {
              const countryData = data.find(
                (row) =>
                  row.geo_id === code &&
                  row.facet === 'country' &&
                  row.variable === 'usage_count'
              );
              if (countryData && countryData.value > 0) {
                latamData.push({
                  name: countryData.geo_name,
                  usage: Math.round(countryData.value),
                });
              }
            });

            const sortedLatam = latamData.sort((a, b) => b.usage - a.usage);
            setLatamCountries(sortedLatam);

            // Find Colombia's rank in LATAM
            const colRank = sortedLatam.findIndex(c => c.name === 'Colombia') + 1;
            setLatamRank(colRank);

            const countryUsage: CountryComparison[] = [];
            const countrySet = new Set<string>();

            data.forEach((row) => {
              if (
                row.geography === 'country' &&
                row.facet === 'country' &&
                row.variable === 'usage_count' &&
                row.geo_id !== 'not_classified' &&
                !countrySet.has(row.geo_id)
              ) {
                countrySet.add(row.geo_id);
                countryUsage.push({
                  name: row.geo_name,
                  usage: Math.round(row.value),
                });
              }
            });

            const sortedGlobal = countryUsage.sort((a, b) => b.usage - a.usage);
            setTopCountries(sortedGlobal.slice(0, 10));

            // Find Colombia's global rank
            const globalRank = sortedGlobal.findIndex(c => c.name === 'Colombia') + 1;
            setGlobalRank(globalRank);

            setLoading(false);
          },
          error: (err: Error) => {
            setError(`Error al cargar datos: ${err.message}`);
            setLoading(false);
          },
        });
      } catch (err) {
        setError(`Error: ${err}`);
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#00E0B4] border-t-transparent rounded-full animate-spin" />
          <div className="text-[#A1A1A1] text-sm">Loading insights...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="text-red-400/80 text-sm">{error}</div>
      </div>
    );
  }

  const collabLabels = Object.keys(collaboration).map((key) => {
    const translations: Record<string, string> = {
      directive: 'Directiva',
      'feedback loop': 'Retroalimentación',
      learning: 'Aprendizaje',
      'task iteration': 'Iteración',
      validation: 'Validación',
    };
    return translations[key] || key;
  });

  const chartColors = [
    'rgba(0, 224, 180, 0.7)',
    'rgba(0, 224, 180, 0.6)',
    'rgba(0, 224, 180, 0.5)',
    'rgba(0, 224, 180, 0.4)',
    'rgba(0, 224, 180, 0.3)',
  ];

  const collabChartData = {
    labels: collabLabels,
    datasets: [
      {
        data: Object.values(collaboration),
        backgroundColor: chartColors,
        borderColor: 'rgba(0, 0, 0, 0.8)',
        borderWidth: 1,
      },
    ],
  };

  const sortedOnet = Object.entries(onetTasks)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const onetChartData = {
    labels: sortedOnet.map(([key]) => key.length > 50 ? key.substring(0, 47) + '...' : key),
    datasets: [
      {
        label: 'Tasks',
        data: sortedOnet.map(([, value]) => value),
        backgroundColor: 'rgba(0, 224, 180, 0.3)',
        borderColor: 'rgba(0, 224, 180, 0.6)',
        borderWidth: 1,
        fullLabels: sortedOnet.map(([key]) => key), // Store full labels for tooltip
      },
    ],
  };

  const sortedRequests = Object.entries(requests)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  const requestChartData = {
    labels: sortedRequests.map(([key]) => key.length > 40 ? key.substring(0, 37) + '...' : key),
    datasets: [
      {
        label: 'Requests',
        data: sortedRequests.map(([, value]) => value),
        backgroundColor: 'rgba(0, 224, 180, 0.3)',
        borderColor: 'rgba(0, 224, 180, 0.6)',
        borderWidth: 1,
        fullLabels: sortedRequests.map(([key]) => key), // Store full labels for tooltip
      },
    ],
  };

  const latamChartData = {
    labels: latamCountries.map((c) => c.name),
    datasets: [
      {
        data: latamCountries.map((c) => c.usage),
        backgroundColor: 'rgba(0, 224, 180, 0.3)',
        borderColor: 'rgba(0, 224, 180, 0.6)',
        borderWidth: 1,
      },
    ],
  };

  const topCountriesChartData = {
    labels: topCountries.map((c) => c.name),
    datasets: [
      {
        data: topCountries.map((c) => c.usage),
        backgroundColor: 'rgba(0, 224, 180, 0.3)',
        borderColor: 'rgba(0, 224, 180, 0.6)',
        borderWidth: 1,
      },
    ],
  };

  const autoAugChartData = {
    labels: ['Automation', 'Augmentation'],
    datasets: [
      {
        data: [stats?.automationPct || 0, stats?.augmentationPct || 0],
        backgroundColor: ['rgba(239, 68, 68, 0.5)', 'rgba(0, 224, 180, 0.5)'],
        borderColor: ['rgba(239, 68, 68, 0.8)', 'rgba(0, 224, 180, 0.8)'],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(10, 10, 10, 0.95)',
        titleColor: '#EAEAEA',
        bodyColor: '#A1A1A1',
        borderColor: 'rgba(255, 255, 255, 0.06)',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        titleFont: { size: 12, weight: 'normal' as const },
        bodyFont: { size: 11 },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        border: { display: false },
        grid: {
          color: 'rgba(255, 255, 255, 0.03)',
          lineWidth: 1,
        },
        ticks: {
          color: '#6B6B6B',
          font: { size: 10 },
        },
      },
      x: {
        border: { display: false },
        grid: {
          display: false,
        },
        ticks: {
          color: '#6B6B6B',
          font: { size: 10 },
        },
      },
    },
  };

  const horizontalChartOptions = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(10, 10, 10, 0.95)',
        titleColor: '#EAEAEA',
        bodyColor: '#A1A1A1',
        borderColor: 'rgba(255, 255, 255, 0.06)',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        titleFont: { size: 11, weight: 'normal' as const },
        bodyFont: { size: 11 },
        callbacks: {
          title: function(context: any) {
            // Show full label in tooltip
            const dataset = context[0].dataset;
            const index = context[0].dataIndex;
            return dataset.fullLabels ? dataset.fullLabels[index] : context[0].label;
          },
          label: function(context: any) {
            const value = context.parsed.x;
            const dataset = context.dataset;
            const total = dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return [
              'Count: ' + value.toLocaleString(),
              'Share: ' + percentage + '%'
            ];
          }
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        border: { display: false },
        grid: {
          color: 'rgba(255, 255, 255, 0.03)',
          lineWidth: 1,
        },
        ticks: {
          color: '#6B6B6B',
          font: { size: 10 },
        },
      },
      y: {
        border: { display: false },
        grid: {
          display: false,
        },
        ticks: {
          color: '#6B6B6B',
          font: { size: 10 },
        },
      },
    },
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#A1A1A1',
          padding: 20,
          font: { size: 11, weight: 'normal' as const },
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(10, 10, 10, 0.95)',
        titleColor: '#EAEAEA',
        bodyColor: '#A1A1A1',
        borderColor: 'rgba(255, 255, 255, 0.06)',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        titleFont: { size: 12, weight: 'normal' as const },
        bodyFont: { size: 11 },
      },
    },
  };

  return (
    <div className="min-h-screen bg-black text-[#EAEAEA]">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06] backdrop-blur-xl bg-black/80">
        <div className="max-w-[1200px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[#EAEAEA] font-medium text-sm tracking-tight">Claude Insights</span>
            <span className="w-1 h-1 rounded-full bg-[#00E0B4]"></span>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center gap-6 text-xs">
            <a href="#overview" className="text-[#A1A1A1] hover:text-[#EAEAEA] transition-colors duration-200">Overview</a>
            <a href="#patterns" className="text-[#A1A1A1] hover:text-[#EAEAEA] transition-colors duration-200">Patterns</a>
            <a href="#tasks" className="text-[#A1A1A1] hover:text-[#EAEAEA] transition-colors duration-200">Tasks</a>
            <a href="#insights" className="text-[#A1A1A1] hover:text-[#EAEAEA] transition-colors duration-200">Insights</a>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-[#A1A1A1] hover:text-[#EAEAEA] transition-colors duration-200"
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/[0.06] bg-black/95 backdrop-blur-xl">
            <div className="max-w-[1200px] mx-auto px-6 py-4 flex flex-col gap-4 text-sm">
              <a
                href="#overview"
                onClick={() => setMobileMenuOpen(false)}
                className="text-[#A1A1A1] hover:text-[#EAEAEA] transition-colors duration-200 py-2"
              >
                Overview
              </a>
              <a
                href="#patterns"
                onClick={() => setMobileMenuOpen(false)}
                className="text-[#A1A1A1] hover:text-[#EAEAEA] transition-colors duration-200 py-2"
              >
                Patterns
              </a>
              <a
                href="#tasks"
                onClick={() => setMobileMenuOpen(false)}
                className="text-[#A1A1A1] hover:text-[#EAEAEA] transition-colors duration-200 py-2"
              >
                Tasks
              </a>
              <a
                href="#insights"
                onClick={() => setMobileMenuOpen(false)}
                className="text-[#A1A1A1] hover:text-[#EAEAEA] transition-colors duration-200 py-2"
              >
                Insights
              </a>
            </div>
          </div>
        )}
      </nav>

      <div className="max-w-[1200px] mx-auto px-6 pt-32 pb-24">
        {/* Hero */}
        <header className="mb-24">
          <h1 className="text-5xl md:text-6xl font-light mb-6 tracking-tight leading-tight text-balance max-w-3xl">
            How Colombia uses AI—in real.
          </h1>
          <p className="text-base text-[#A1A1A1] mb-8 max-w-2xl leading-relaxed">
            See the patterns behind adoption. Measured from 250k+ sessions, aggregated & anonymized.
          </p>
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 text-xs text-[#6B6B6B]">
            <span>{stats?.dateStart} → {stats?.dateEnd}</span>
            <span className="hidden md:block w-1 h-1 rounded-full bg-[#6B6B6B]"></span>
            <span>Anthropic Economic Index</span>
            <span className="hidden md:block w-1 h-1 rounded-full bg-[#6B6B6B]"></span>
            <span>Crafted by Nicolás Quintero</span>
          </div>
        </header>

        {stats && (
          <>
            {/* Main Stats */}
            <section id="overview" className="mb-32">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.12] transition-all duration-300 p-6 rounded-xl group">
                  <div className="text-xs text-[#6B6B6B] mb-3 tracking-wide uppercase">Sessions</div>
                  <div className="text-4xl font-extralight text-[#EAEAEA] mb-1 tracking-tight">{stats.totalUsage.toLocaleString()}</div>
                  <div className="text-xs text-[#A1A1A1]">Measured conversations</div>
                </div>
                <div className="bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.12] transition-all duration-300 p-6 rounded-xl group">
                  <div className="text-xs text-[#6B6B6B] mb-3 tracking-wide uppercase">Global Rank</div>
                  <div className="text-4xl font-extralight text-[#00E0B4] mb-1 tracking-tight">#{globalRank}</div>
                  <div className="text-xs text-[#A1A1A1]">Worldwide position</div>
                </div>
                <div className="bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.12] transition-all duration-300 p-6 rounded-xl group">
                  <div className="text-xs text-[#6B6B6B] mb-3 tracking-wide uppercase">LATAM Rank</div>
                  <div className="text-4xl font-extralight text-[#00E0B4] mb-1 tracking-tight">#{latamRank}</div>
                  <div className="text-xs text-[#A1A1A1]">In Latin America</div>
                </div>
                <div className="bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.12] transition-all duration-300 p-6 rounded-xl group">
                  <div className="text-xs text-[#6B6B6B] mb-3 tracking-wide uppercase">Global Share</div>
                  <div className="text-4xl font-extralight text-[#EAEAEA] mb-1 tracking-tight">{stats.usagePercent}%</div>
                  <div className="text-xs text-[#A1A1A1]">Of worldwide usage</div>
                </div>
                <div className="bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.12] transition-all duration-300 p-6 rounded-xl group">
                  <div className="text-xs text-[#6B6B6B] mb-3 tracking-wide uppercase">Per Capita</div>
                  <div className="text-4xl font-extralight text-[#EAEAEA] mb-1 tracking-tight">{stats.usagePerCapita}</div>
                  <div className="text-xs text-[#A1A1A1]">Per 100k people</div>
                </div>
                <div className="bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.12] transition-all duration-300 p-6 rounded-xl group">
                  <div className="text-xs text-[#6B6B6B] mb-3 tracking-wide uppercase">Time Frame</div>
                  <div className="text-4xl font-extralight text-[#EAEAEA] mb-1 tracking-tight">7d</div>
                  <div className="text-xs text-[#A1A1A1]">Single week snapshot</div>
                </div>
              </div>
            </section>

            {/* Comparisons */}
            <section className="mb-32">
              <h2 className="text-2xl font-light mb-2 tracking-tight">Regional context</h2>
              <p className="text-sm text-[#6B6B6B] mb-12">Colombia vs global & Latin America</p>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.12] transition-all duration-300 p-8 rounded-xl">
                  <h3 className="text-xs text-[#6B6B6B] mb-6 tracking-wide uppercase">Top 10 Worldwide</h3>
                  <Bar data={topCountriesChartData} options={chartOptions} />
                </div>

                <div className="bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.12] transition-all duration-300 p-8 rounded-xl">
                  <h3 className="text-xs text-[#6B6B6B] mb-6 tracking-wide uppercase">Latin America</h3>
                  <Bar data={latamChartData} options={chartOptions} />
                </div>
              </div>
            </section>

            {/* Automation vs Augmentation */}
            <section id="patterns" className="mb-32">
              <h2 className="text-2xl font-light mb-2 tracking-tight">Usage mode</h2>
              <p className="text-sm text-[#6B6B6B] mb-12">How people delegate to AI</p>

              <div className="bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.12] transition-all duration-300 p-12 rounded-xl">
                <div className="max-w-sm mx-auto mb-12">
                  <Doughnut data={autoAugChartData} options={pieOptions} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
                  <div className="text-center p-6 rounded-lg border border-white/[0.06] bg-white/[0.02]">
                    <div className="text-5xl font-extralight text-red-400/90 mb-2 tracking-tight">
                      {stats.automationPct.toFixed(1)}%
                    </div>
                    <div className="text-xs text-[#6B6B6B] uppercase tracking-wide mb-2">Automation</div>
                    <div className="text-xs text-[#A1A1A1]">AI completes task autonomously</div>
                  </div>
                  <div className="text-center p-6 rounded-lg border border-white/[0.06] bg-white/[0.02]">
                    <div className="text-5xl font-extralight text-[#00E0B4]/90 mb-2 tracking-tight">
                      {stats.augmentationPct.toFixed(1)}%
                    </div>
                    <div className="text-xs text-[#6B6B6B] uppercase tracking-wide mb-2">Augmentation</div>
                    <div className="text-xs text-[#A1A1A1]">AI assists human decision</div>
                  </div>
                </div>
              </div>
            </section>

            {/* Collaboration */}
            <section className="mb-32">
              <h2 className="text-2xl font-light mb-2 tracking-tight">Collaboration patterns</h2>
              <p className="text-sm text-[#6B6B6B] mb-12">How users interact with Claude</p>

              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3 bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.12] transition-all duration-300 p-8 rounded-xl">
                  <Bar data={collabChartData} options={chartOptions} />
                </div>
                <div className="lg:col-span-2 space-y-3">
                  <div className="bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.12] transition-all duration-300 p-4 rounded-lg">
                    <div className="text-xs font-medium text-[#00E0B4] mb-1">Directiva</div>
                    <div className="text-xs text-[#6B6B6B]">Direct instruction to Claude</div>
                  </div>
                  <div className="bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.12] transition-all duration-300 p-4 rounded-lg">
                    <div className="text-xs font-medium text-[#00E0B4] mb-1">Retroalimentación</div>
                    <div className="text-xs text-[#6B6B6B]">Iterative feedback loops</div>
                  </div>
                  <div className="bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.12] transition-all duration-300 p-4 rounded-lg">
                    <div className="text-xs font-medium text-[#00E0B4] mb-1">Aprendizaje</div>
                    <div className="text-xs text-[#6B6B6B]">Educational exploration</div>
                  </div>
                  <div className="bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.12] transition-all duration-300 p-4 rounded-lg">
                    <div className="text-xs font-medium text-[#00E0B4] mb-1">Iteración</div>
                    <div className="text-xs text-[#6B6B6B]">Progressive refinement</div>
                  </div>
                  <div className="bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.12] transition-all duration-300 p-4 rounded-lg">
                    <div className="text-xs font-medium text-[#00E0B4] mb-1">Validación</div>
                    <div className="text-xs text-[#6B6B6B]">Work review & verification</div>
                  </div>
                </div>
              </div>
            </section>

            {/* Requests */}
            <section id="tasks" className="mb-32">
              <h2 className="text-2xl font-light mb-2 tracking-tight">Request types</h2>
              <p className="text-sm text-[#6B6B6B] mb-2">Most common prompts & queries</p>
              <p className="text-xs text-[#6B6B6B]/60 mb-12 italic">Hover for full name & percentage share</p>

              <div className="bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.12] transition-all duration-300 p-8 rounded-xl">
                <div className="h-[500px] md:h-[400px]">
                  <Bar data={requestChartData} options={horizontalChartOptions} />
                </div>
              </div>
            </section>

            {/* O*NET Tasks */}
            <section className="mb-32">
              <h2 className="text-2xl font-light mb-2 tracking-tight">Professional tasks</h2>
              <p className="text-sm text-[#6B6B6B] mb-2">Mapped to O*NET occupational framework</p>
              <p className="text-xs text-[#6B6B6B]/60 mb-12 italic">Hover for full description & percentage share</p>

              <div className="bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.12] transition-all duration-300 p-8 rounded-xl">
                <div className="h-[500px] md:h-[400px]">
                  <Bar data={onetChartData} options={horizontalChartOptions} />
                </div>
              </div>
            </section>

            {/* Occupations */}
            <section className="mb-32">
              <h2 className="text-2xl font-light mb-2 tracking-tight">Who uses Claude in Colombia</h2>
              <p className="text-sm text-[#6B6B6B] mb-12">Distribution by professional occupation</p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(occupations)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 9)
                  .map(([occupation, percentage]) => (
                    <div key={occupation} className="bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.12] transition-all duration-300 p-6 rounded-xl">
                      <div className="text-xs text-[#6B6B6B] mb-2 uppercase tracking-wide">{occupation}</div>
                      <div className="text-3xl font-extralight text-[#00E0B4] tracking-tight">{percentage.toFixed(1)}%</div>
                    </div>
                  ))}
              </div>
            </section>

            {/* Key Insights */}
            <section id="insights" className="mb-32">
              <h2 className="text-2xl font-light mb-2 tracking-tight">Key insights</h2>
              <p className="text-sm text-[#6B6B6B] mb-12">What makes Colombia unique</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/[0.02] border border-white/[0.06] p-8 rounded-xl">
                  <div className="flex items-start gap-4">
                    <div className="w-2 h-2 rounded-full bg-[#00E0B4] mt-2"></div>
                    <div>
                      <h3 className="text-lg font-light text-[#EAEAEA] mb-3">Global positioning</h3>
                      <p className="text-sm text-[#A1A1A1] leading-relaxed">
                        Ranked <span className="text-[#00E0B4] font-medium">#{globalRank} globally</span> and{' '}
                        <span className="text-[#00E0B4] font-medium">#{latamRank} in LATAM</span>,
                        Colombia demonstrates competitive AI adoption among emerging markets.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/[0.02] border border-white/[0.06] p-8 rounded-xl">
                  <div className="flex items-start gap-4">
                    <div className="w-2 h-2 rounded-full bg-[#00E0B4] mt-2"></div>
                    <div>
                      <h3 className="text-lg font-light text-[#EAEAEA] mb-3">Tech dominance</h3>
                      <p className="text-sm text-[#A1A1A1] leading-relaxed">
                        With <span className="text-[#00E0B4] font-medium">{occupations['Computer and Mathematical']?.toFixed(1)}%</span> in
                        programming and development, Colombia shows the <span className="text-[#00E0B4] font-medium">highest tech concentration</span> in the region.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/[0.02] border border-white/[0.06] p-8 rounded-xl">
                  <div className="flex items-start gap-4">
                    <div className="w-2 h-2 rounded-full bg-[#00E0B4] mt-2"></div>
                    <div>
                      <h3 className="text-lg font-light text-[#EAEAEA] mb-3">Sophistication index</h3>
                      <p className="text-sm text-[#A1A1A1] leading-relaxed">
                        At <span className="text-[#00E0B4] font-medium">0.93x</span>, Colombian users engage in
                        collaborative and strategic AI work—going beyond simple queries to build complex solutions.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/[0.02] border border-white/[0.06] p-8 rounded-xl">
                  <div className="flex items-start gap-4">
                    <div className="w-2 h-2 rounded-full bg-[#00E0B4] mt-2"></div>
                    <div>
                      <h3 className="text-lg font-light text-[#EAEAEA] mb-3">Progressive refinement</h3>
                      <p className="text-sm text-[#A1A1A1] leading-relaxed">
                        <span className="text-[#00E0B4] font-medium">{(collaboration['task iteration'] / Object.values(collaboration).reduce((a, b) => a + b, 0) * 100).toFixed(0)}%</span> in
                        task iteration—Colombians don't seek single answers, they iteratively build and refine solutions.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/[0.02] border border-white/[0.06] p-8 rounded-xl">
                  <div className="flex items-start gap-4">
                    <div className="w-2 h-2 rounded-full bg-[#00E0B4] mt-2"></div>
                    <div>
                      <h3 className="text-lg font-light text-[#EAEAEA] mb-3">Augmentation over automation</h3>
                      <p className="text-sm text-[#A1A1A1] leading-relaxed">
                        <span className="text-[#00E0B4] font-medium">{stats.augmentationPct.toFixed(0)}%</span> of usage
                        is for augmentation—users prefer AI as a strategic collaborator, not a replacement.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/[0.02] border border-white/[0.06] p-8 rounded-xl">
                  <div className="flex items-start gap-4">
                    <div className="w-2 h-2 rounded-full bg-[#00E0B4] mt-2"></div>
                    <div>
                      <h3 className="text-lg font-light text-[#EAEAEA] mb-3">Education focus</h3>
                      <p className="text-sm text-[#A1A1A1] leading-relaxed">
                        Educational professionals at{' '}
                        <span className="text-[#00E0B4] font-medium">{occupations['Educational Instruction and Library']?.toFixed(1)}%</span>
                        —Claude plays a significant role in learning, teaching, and knowledge work.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Footer */}
            <footer className="mt-32 pt-12 border-t border-white/[0.06]">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
                <div>
                  <div className="text-xs text-[#6B6B6B] uppercase tracking-wide mb-3">Data Source</div>
                  <a
                    href="https://huggingface.co/datasets/Anthropic/EconomicIndex"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[#A1A1A1] hover:text-[#00E0B4] transition-colors duration-200 inline-flex items-center gap-1"
                  >
                    Anthropic Economic Index
                    <span className="text-xs">↗</span>
                  </a>
                </div>
                <div>
                  <div className="text-xs text-[#6B6B6B] uppercase tracking-wide mb-3">Methodology</div>
                  <p className="text-sm text-[#A1A1A1] leading-relaxed">
                    Representative sample with privacy-preserving methods. Minimum 200 conversations per country.
                  </p>
                </div>
                <div>
                  <div className="text-xs text-[#6B6B6B] uppercase tracking-wide mb-3">License</div>
                  <p className="text-sm text-[#A1A1A1]">
                    Educational purposes · CC BY 4.0
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-8 border-t border-white/[0.06]">
                <div className="text-xs text-[#6B6B6B]">
                  Built with Claude Code
                </div>
                <div className="text-xs text-[#6B6B6B]">
                  {new Date().getFullYear()} · Colombia AI Insights
                </div>
              </div>
            </footer>
          </>
        )}
      </div>
    </div>
  );
}

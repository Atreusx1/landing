'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ArrowUpRight, Sparkles, TrendingUp, Eye, Lock } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Particle {
  x: number;
  y: number;
  dx: number;
  dy: number;
  size: number;
}

interface CursorParticle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
}

interface ConnectionLine {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  opacity: number;
}

interface Dimensions {
  width: number;
  height: number;
}

const PARTICLE_COUNT = 30; // Adjusted to reduce visual noise
const CONNECTION_DISTANCE = 100;

const mockChartData = Array.from({ length: 24 }, (_, i) => ({
  name: `${i}h`,
  value: 3000 + Math.random() * 2000,
  volume: Math.random() * 1000
}));

const generateParticles = (width: number, height: number, count: number): Particle[] => {
  return Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    dx: (Math.random() - 0.5) * 0.5,
    dy: (Math.random() - 0.5) * 0.5,
    size: Math.random() * 3 + 1,
  }));
};

export default function TradingPlatform() {
  const [isVisible, setIsVisible] = useState<Record<string, boolean>>({});
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [cursorParticles, setCursorParticles] = useState<CursorParticle[]>([]);
  const [bgParticles, setBgParticles] = useState<Particle[]>([]);
  const [dimensions, setDimensions] = useState<Dimensions>({ width: 0, height: 0 });
  const [activeTab, setActiveTab] = useState('markets');
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    if (dimensions.width && dimensions.height) {
      setBgParticles(generateParticles(dimensions.width, dimensions.height, PARTICLE_COUNT));
    }
  }, [dimensions]);

  useEffect(() => {
    const animateParticles = () => {
      setBgParticles(prevParticles => 
        prevParticles.map(particle => {
          let newX = particle.x + particle.dx;
          let newY = particle.y + particle.dy;

          if (newX < 0 || newX > dimensions.width) particle.dx *= -1;
          if (newY < 0 || newY > dimensions.height) particle.dy *= -1;

          return {
            ...particle,
            x: newX,
            y: newY
          };
        })
      );
    };

    const interval = setInterval(animateParticles, 16);
    return () => clearInterval(interval);
  }, [dimensions]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
    
    if (Math.random() > 0.8) {
      const newParticle = {
        id: Date.now(),
        x: e.clientX,
        y: e.clientY,
        size: Math.random() * 4 + 2,
        color: `hsl(${Math.random() * 60 + 200}, 100%, 70%)`,
      };
      
      setCursorParticles(prev => [...prev, newParticle]);
      setTimeout(() => {
        setCursorParticles(prev => prev.filter(p => p.id !== newParticle.id));
      }, 1000);
    }
  }, []);

  const connectionLines = useMemo(() => {
    const lines: ConnectionLine[] = [];
    for (let i = 0; i < bgParticles.length; i++) {
      for (let j = i + 1; j < bgParticles.length; j++) {
        const dx = bgParticles[i].x - bgParticles[j].x;
        const dy = bgParticles[i].y - bgParticles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < CONNECTION_DISTANCE) {
          const opacity = (1 - distance / CONNECTION_DISTANCE) * 0.2;
          lines.push({
            x1: bgParticles[i].x,
            y1: bgParticles[i].y,
            x2: bgParticles[j].x,
            y2: bgParticles[j].y,
            opacity
          });
        }
      }
    }
    return lines;
  }, [bgParticles]);

  return (
    <main onMouseMove={handleMouseMove} className="min-h-screen bg-gradient-to-br from-gray-800 via-blue-800 to-purple-800 text-white relative overflow-hidden">
      {/* Background Particle Canvas */}
      <svg className="fixed inset-0 pointer-events-none">
        {connectionLines.map((line, index) => (
          <line
            key={index}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="1"
            style={{ opacity: line.opacity }}
          />
        ))}
        {bgParticles.map((particle, index) => (
          <circle
            key={index}
            cx={particle.x}
            cy={particle.y}
            r={particle.size}
            fill="rgba(255,255,255,0.5)"
          />
        ))}
      </svg>

      {/* Cursor Particles */}
      <div className="fixed inset-0 pointer-events-none">
        {cursorParticles.map((particle) => (
          <div
            key={particle.id}
            className="absolute rounded-full animate-fade-out"
            style={{
              left: particle.x,
              top: particle.y,
              width: particle.size,
              height: particle.size,
              backgroundColor: particle.color,
              transform: 'translate(-50%, -50%)',
            }}
          />
        ))}
      </div>

      {/* Navigation */}
      <nav className="fixed w-full backdrop-blur-xl bg-white/5 z-50 border-b border-white/10">
  <div className="max-w-7xl mx-auto px-4 py-3">
    <div className="flex justify-between items-center">
      {/* Logo Section */}
      <div className="flex items-center">
        <img
          src="image.png" // Replace with the path to your logo
          alt="Logo"
          className="h-8 w-auto" // Adjust the height to fit your design
        />
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-8">
        {['markets', 'trading', 'analysis', 'education'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 transition-all relative ${
              activeTab === tab ? 'text-blue-400' : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-400" />
            )}
          </button>
        ))}
        <button className="px-6 py-2 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center gap-2 transform hover:scale-105 transition-all">
          Login
          <ArrowUpRight size={16} />
        </button>
      </div>
    </div>
  </div>
</nav>


      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center py-20 bg-gradient-to-b from-gray-800 via-purple-900 to-transparent text-center">
        <div className="max-w-5xl mx-auto px-4">
          <h1 className="text-5xl font-bold text-white mb-6">
            Real-time Trading & Crypto Insights
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Experience the future of trading with live market data, AI-powered analysis, and secure transactions.
          </p>
          <button
            className="px-8 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all"
            onClick={() => setIsVisible(prev => ({ ...prev, trading: true }))}
          >
            Get Started
          </button>
        </div>
      </section>

     
    {/* Enhanced Chart Section */}
<section className="py-20 bg-gradient-to-r from-blue-800 via-blue-700 to-purple-600">
  <div className="max-w-7xl mx-auto px-4 text-center">
    <h2 className="text-3xl font-semibold text-white mb-8">Market Insights</h2>
    <p className="text-xl text-gray-300 mb-12">
      Visualize market trends and make informed decisions with our real-time trading charts.
    </p>
    <div className="relative">
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={mockChartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
          <XAxis dataKey="name" stroke="#fff" />
          <YAxis stroke="#fff" />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke="#00BFFF" dot={false} strokeWidth={3} />
          <Line type="monotone" dataKey="volume" stroke="#32CD32" dot={false} strokeWidth={3} />
        </LineChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black opacity-30 rounded-xl"></div>
    </div>
  </div>
</section>

{/* Enhanced Features Section */}
<section className="py-20 bg-gradient-to-r from-blue-800 via-blue-700 to-purple-600">
  <div className="max-w-7xl mx-auto px-4">
    <h2 className="text-4xl font-bold text-center text-white mb-12">Key Features</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
      {[
        {
          icon: <TrendingUp size={50} />,
          title: 'Real-time Trading Data',
          description: 'Stay ahead with live market data and trends at your fingertips, always up to date.',
        },
        {
          icon: <Sparkles size={50} />,
          title: 'AI-powered Analysis',
          description: 'Harness the power of machine learning to gain actionable insights and optimize your strategy.',
        },
        {
          icon: <Eye size={50} />,
          title: 'Customizable Dashboard',
          description: 'Create a workspace tailored to your needs with drag-and-drop widgets and real-time data.',
        },
        {
          icon: <Lock size={50} />,
          title: 'Secure Transactions',
          description: 'Trade with peace of mind knowing your transactions are protected by state-of-the-art encryption.',
        },
      ].map((feature, index) => (
        <div
          key={index}
          className="p-8 bg-gray-800 text-center rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300 ease-in-out"
          onMouseEnter={() => setHoveredFeature(index)}
          onMouseLeave={() => setHoveredFeature(null)}
        >
          <div className="mb-6 text-blue-400 transform hover:scale-110 transition-all duration-200">
            {feature.icon}
          </div>
          <h3 className="text-2xl font-semibold mb-3 text-white">
            {feature.title}
          </h3>
          <p className="text-gray-200">{feature.description}</p>
        </div>
      ))}
    </div>
  </div>
</section>

{/* New Sign-up Form Section */}
<section className="py-12 bg-gradient-to-r from-blue-800 via-blue-700 to-purple-600">
  <div className="max-w-lg mx-auto text-center">
    <h3 className="text-3xl text-white font-semibold mb-6">Start Trading Like a Pro</h3>
    <p className="text-lg text-gray-300 mb-6">Join now and gain access to powerful tools to boost your trading performance.</p>
    <form className="p-8 bg-gradient-to-r from-gray-700 via-gray-800 to-gray-900 rounded-xl shadow-lg" action="/submit" method="POST">
            <div className="mb-6">
        <label htmlFor="name" className="block text-white-800 font-medium">Full Name</label>
        <input
          type="text"
          id="name"
          name="name"
          className="w-full p-3 border border-white-300 rounded-md mt-2 text-black"
          placeholder="John Doe"
          required
        />
      </div>

      <div className="mb-6">
        <label htmlFor="email" className="block text-white-800 font-medium">Email Address</label>
        <input
          type="email"
          id="email"
          name="email"
          className="w-full p-3 border border-gray-300 rounded-md mt-2 text-black"
          placeholder="john@example.com"
          required
        />
      </div>

      <div className="mb-6">
        <label htmlFor="phone" className="block text-white-800 font-medium">Phone Number</label>
        <input
          type="tel"
          id="phone"
          name="phone"
          className="w-full p-3 border border-gray-300 rounded-md mt-2 text-black"
          placeholder="+1 (234) 567-8900"
          required
        />
      </div>

      <div className="mb-6">
        <label htmlFor="experience" className="block text-white-800 font-medium">Trading Experience</label>
        <select
          id="experience"
          name="experience"
          className="w-full p-3 border border-gray-300 rounded-md mt-2 text-black"
          required
          value={activeTab}
          onChange={(e) => setActiveTab(e.target.value)}
        >
          <option value="" disabled>Select your experience level</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </div>

      <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 transition-all">
        Get Started Now
      </button>
    </form>
  </div>
</section>

{/* Educational Resources Section */}
<section className="py-20 bg-gradient-to-r from-blue-800 via-blue-700 to-purple-600">
  <div className="max-w-7xl mx-auto px-4 text-center">
    <h2 className="text-4xl font-bold text-white mb-12">Trading Education</h2>
    <p className="text-xl text-gray-300 mb-12">
      Improve your trading skills with our free resources, including articles, tutorials, and market guides.
    </p>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
      {[
        {
          title: 'Technical Analysis 101',
          description: 'Learn the fundamentals of technical analysis and how to apply them to your trading strategy.',
        },
        {
          title: 'Risk Management Techniques',
          description: 'Master risk management strategies to protect your investments and minimize losses.',
        },
        {
          title: 'Understanding Market Sentiment',
          description: 'Gain insights into market psychology and sentiment to make informed decisions in volatile markets.',
        },
      ].map((course, index) => (
        <div key={index} className="p-8 bg-gray-800 text-center rounded-xl shadow-lg hover:scale-105 transform transition-all duration-300">
          <h3 className="text-2xl font-semibold text-white mb-3">{course.title}</h3>
          <p className="text-gray-200">{course.description}</p>
        </div>
      ))}
    </div>
  </div>
</section>

{/* Footer Section */}
<section className="py-6 bg-gray-900 text-center text-gray-400">
  <div className="max-w-7xl mx-auto px-4">
    <div className="flex justify-center space-x-8 mb-6">
      <a href="/privacy-policy" className="hover:text-white">Privacy Policy</a>
      <a href="/disclaimer" className="hover:text-white">Disclaimer</a>
      <a href="/contact" className="hover:text-white">Contact Info</a>
    </div>
    <p className="text-sm">&copy; 2025 Precise Trader. All rights reserved.</p>
  </div>
</section>



    </main>
  );
}

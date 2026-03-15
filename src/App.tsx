import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { 
  Activity, 
  Zap, 
  Heart, 
  Wind, 
  Brain, 
  Terminal, 
  Send, 
  Loader2, 
  ChevronRight
} from 'lucide-react';
import { generateNeuralJourney } from './services/geminiService';
import { Message, NeuralStats } from './types';
import NeuralMap from './components/NeuralMap';

// Extend window for AI Studio API
declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

export default function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'agent',
      text: 'Neural Voyager initialized. Micro-drone standing by for cortical insertion. Awaiting destination coordinates...',
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<NeuralStats>({
    dopamine: 45,
    serotonin: 62,
    heartRate: 72,
    synapticActivity: 88,
    oxygenLevel: 98
  });
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Simulate real-time stats
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        dopamine: Math.max(0, Math.min(100, prev.dopamine + (Math.random() * 4 - 2))),
        serotonin: Math.max(0, Math.min(100, prev.serotonin + (Math.random() * 2 - 1))),
        heartRate: Math.max(60, Math.min(120, prev.heartRate + (Math.random() * 6 - 3))),
        synapticActivity: Math.max(0, Math.min(100, prev.synapticActivity + (Math.random() * 10 - 5))),
        oxygenLevel: Math.max(90, Math.min(100, prev.oxygenLevel + (Math.random() * 0.4 - 0.2)))
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await generateNeuralJourney(input);
      
      const agentMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'agent',
        text: response.text,
        simulationParams: response.simulationParams,
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, agentMsg]);
      if (response.stats) setStats(response.stats);
    } catch (error: any) {
      console.error("Caught error in App:", error);
      
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'agent',
        text: 'ERROR: Neural link disrupted. The simulation is experiencing interference. Please try again.',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  if (showLanding) {
    return (
      <div className="h-screen w-full bg-space-black flex flex-col items-center justify-center relative overflow-hidden">
        <div className="scanline" />
        
        {/* Background 3D Simulation */}
        <div className="absolute inset-0 z-0 opacity-40">
          <NeuralMap className="h-full border-none bg-transparent" hideUI />
        </div>

        {/* Content */}
        <div className="z-10 flex flex-col items-center text-center px-6 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="p-4 bg-neon-teal/10 rounded-2xl border border-neon-teal/30 glow-teal">
                <Brain className="w-12 h-12 text-neon-teal" />
              </div>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-bold text-white tracking-tighter uppercase">
              Neural <span className="text-neon-teal">Voyager</span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-400 font-mono tracking-widest max-w-2xl mx-auto uppercase">
              Interactive 3D Cortical Exploration Interface
            </p>

            <div className="h-1 w-32 bg-neon-teal/50 mx-auto rounded-full" />

            <div className="pt-12">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(0, 242, 255, 0.4)" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowLanding(false)}
                className="group relative px-12 py-5 bg-neon-teal text-space-black font-bold text-lg rounded-full overflow-hidden transition-all"
              >
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
                <span className="relative flex items-center gap-3">
                  BEGIN CORTICAL INSERTION
                  <ChevronRight className="w-5 h-5" />
                </span>
              </motion.button>
            </div>
          </motion.div>

          {/* Bottom Stats Preview */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="absolute bottom-12 left-0 right-0 flex justify-center gap-12 text-[10px] font-mono text-gray-500 tracking-[0.3em] uppercase"
          >
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 bg-neon-teal rounded-full animate-pulse" />
              SYSTEMS_NOMINAL
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 bg-neon-teal rounded-full animate-pulse" />
              LINK_ESTABLISHED
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 bg-neon-teal rounded-full animate-pulse" />
              VOYAGER_READY
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col md:flex-row bg-space-black overflow-hidden relative">
      <div className="scanline" />
      
      {/* Sidebar - Neural Vitals */}
      <aside className="w-full md:w-80 border-r border-white/10 bg-panel-bg backdrop-blur-md p-6 flex flex-col gap-8 z-20">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-neon-teal-dim rounded-lg">
            <Brain className="w-6 h-6 text-neon-teal" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-neon-teal tracking-widest uppercase">Mission Control</h2>
            <p className="text-[10px] text-gray-500">VOYAGER-01 STATUS: ACTIVE</p>
          </div>
        </div>

        {/* 3D Tactical Map */}
        <div className="h-48 w-full">
          <NeuralMap params={messages.filter(m => m.role === 'agent' && m.simulationParams).slice(-1)[0]?.simulationParams} />
        </div>

        <div className="space-y-6">
          <h3 className="text-[10px] font-bold text-gray-400 tracking-widest uppercase border-b border-white/5 pb-2">Neural Vitals</h3>
          
          <StatItem icon={<Activity className="w-4 h-4" />} label="Dopamine" value={stats.dopamine} unit="%" color="text-yellow-400" />
          <StatItem icon={<Zap className="w-4 h-4" />} label="Synaptic" value={stats.synapticActivity} unit="Hz" color="text-neon-teal" />
          <StatItem icon={<Heart className="w-4 h-4" />} label="Heart Rate" value={stats.heartRate} unit="BPM" color="text-red-500" />
          <StatItem icon={<Wind className="w-4 h-4" />} label="Oxygen" value={stats.oxygenLevel} unit="%" color="text-blue-400" />
        </div>

        <div className="mt-auto pt-6 border-t border-white/5">
          <div className="flex items-center justify-between text-[10px] text-gray-500 mb-2">
            <span>DRONE POSITION</span>
            <span className="text-neon-teal">CORTEX-A12</span>
          </div>
          <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-neon-teal"
              animate={{ width: ['20%', '80%', '40%', '90%'] }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            />
          </div>
        </div>
      </aside>

      {/* Main Content - Feed */}
      <main className="flex-1 flex flex-col relative z-20">
        <header className="h-16 border-b border-white/10 bg-panel-bg flex items-center px-6 justify-between">
          <div className="flex items-center gap-4">
            <Terminal className="w-4 h-4 text-neon-teal" />
            <span className="text-xs font-mono text-neon-teal tracking-widest uppercase">Neural_Feed_Stream_v3.0</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-neon-teal animate-pulse" />
            <span className="text-[10px] font-mono text-gray-400">SIMULATION_ACTIVE</span>
          </div>
        </header>

        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-12 scroll-smooth"
        >
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div className={`max-w-3xl w-full space-y-6 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                  {msg.role === 'user' ? (
                    <div className="bg-neon-teal/10 border border-neon-teal/30 px-6 py-3 rounded-2xl inline-block">
                      <p className="text-sm font-mono text-neon-teal tracking-tight">{msg.text}</p>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      {msg.simulationParams && (
                        <div className="h-96 w-full rounded-2xl overflow-hidden border border-white/10 glow-teal">
                          <NeuralMap params={msg.simulationParams} />
                        </div>
                      )}
                      
                      {msg.text && (
                        <div className="bg-white/5 border border-white/10 p-8 rounded-2xl backdrop-blur-sm relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-1 h-full bg-neon-teal/30" />
                          <div className="flex items-center gap-2 mb-6 text-[10px] font-bold text-neon-teal tracking-widest uppercase">
                            <ChevronRight className="w-3 h-3" />
                            Voyager Intelligence Report
                          </div>
                          <div className="markdown-body prose prose-invert prose-sm max-w-none">
                            <ReactMarkdown
                              components={{
                                h3: ({node, ...props}) => <h3 className="text-neon-teal text-xs font-bold tracking-widest uppercase mt-6 mb-2 border-b border-neon-teal/20 pb-1" {...props} />,
                                p: ({node, ...props}) => <p className="text-gray-300 leading-relaxed font-light mb-4" {...props} />,
                              }}
                            >
                              {msg.text}
                            </ReactMarkdown>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isLoading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-3 text-neon-teal"
            >
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-xs font-mono tracking-widest animate-pulse">DECRYPTING NEURAL DATA STREAM...</span>
            </motion.div>
          )}
        </div>

        {/* Input Area */}
        <footer className="p-6 bg-panel-bg border-t border-white/10">
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter neural coordinates or command (e.g., 'Explore the Hippocampus')..."
              className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-6 pr-16 text-sm focus:outline-none focus:border-neon-teal/50 transition-colors font-mono placeholder:text-gray-600"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="absolute right-2 top-2 bottom-2 px-4 bg-neon-teal text-space-black rounded-lg hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
          <div className="mt-4 flex justify-center gap-6">
            <QuickCommand label="Amygdala" onClick={() => setInput('Enter the Amygdala')} />
            <QuickCommand label="Synapse" onClick={() => setInput('Simulate a memory firing across a synapse')} />
            <QuickCommand label="Visual Cortex" onClick={() => setInput('Navigate to the Visual Cortex')} />
          </div>
        </footer>
      </main>
    </div>
  );
}

function StatItem({ icon, label, value, unit, color }: { icon: React.ReactNode, label: string, value: number, unit: string, color: string }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-[10px] uppercase tracking-wider">
        <div className="flex items-center gap-2 text-gray-400">
          {icon}
          <span>{label}</span>
        </div>
        <span className={`${color} font-bold`}>{value.toFixed(1)}{unit}</span>
      </div>
      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
        <motion.div 
          className={`h-full ${color.replace('text-', 'bg-')}`}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </div>
  );
}

function QuickCommand({ label, onClick }: { label: string, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="text-[10px] font-mono text-gray-500 hover:text-neon-teal transition-colors uppercase tracking-widest border border-white/5 px-3 py-1 rounded hover:border-neon-teal/30"
    >
      [{label}]
    </button>
  );
}

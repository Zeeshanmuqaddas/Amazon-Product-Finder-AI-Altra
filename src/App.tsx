import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Loader2, BarChart2, DollarSign, Star, TrendingUp, CheckCircle, Package, ArrowRight, ShieldCheck } from 'lucide-react';
import { cn } from './lib/utils';

interface AnalysisResult {
  market_insight: string;
  price_score: number;
  quality_score: number;
  conversion_score: number;
  final_score: number;
  best_product: {
    name: string;
    description: string;
    estimated_price: string;
    amazon_search_query: string;
  };
}

const AGENTS = [
  { id: 'market', name: 'Market Research Agent', icon: BarChart2, loadingMsg: 'Detecting demand & competition...' },
  { id: 'pricing', name: 'Pricing Analyst Agent', icon: DollarSign, loadingMsg: 'Evaluating value & competitiveness...' },
  { id: 'quality', name: 'Quality Analyst Agent', icon: ShieldCheck, loadingMsg: 'Analyzing reviews & trust signals...' },
  { id: 'conversion', name: 'Conversion agent', icon: TrendingUp, loadingMsg: 'Predicting buyer intent...' },
];

export default function App() {
  const [query, setQuery] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeAgentIndex, setActiveAgentIndex] = useState(-1);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState('');

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsAnalyzing(true);
    setResult(null);
    setError('');
    setActiveAgentIndex(0);

    // Simulate multi-agent steps visually
    const interval = setInterval(() => {
      setActiveAgentIndex((prev) => {
        if (prev >= AGENTS.length - 1) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 1500); // 1.5 seconds per agent step

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze product.');
      }

      // Quick visual delay so final agent resolves before showing result
      setTimeout(() => {
        setResult(data);
        setIsAnalyzing(false);
      }, 500);

    } catch (err: any) {
      setError(err.message);
      setIsAnalyzing(false);
    } finally {
      clearInterval(interval);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Package className="w-5 h-5 text-white" />
          </div>
          <h1 className="font-semibold text-lg tracking-tight">Amazon Product Finder AI</h1>
        </div>
        <div className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
          Enterprise Multi-Agent System
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Hero Section */}
        {!isAnalyzing && !result && (
          <div className="text-center max-w-2xl mx-auto mb-16 pt-12">
            <h2 className="text-4xl font-bold tracking-tight text-slate-900 mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Find Winning Products with AI
            </h2>
            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
              Our Multi-Agent system parallelizes market research, pricing analysis, and conversion prediction to uncover highly profitable Amazon products.
            </p>
          </div>
        )}

        {/* Search Input */}
        <div className={cn("max-w-2xl mx-auto transition-all duration-500", (isAnalyzing || result) ? "mb-12" : "mb-20")}>
          <form onSubmit={handleAnalyze} className="relative group">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
              <Search className="w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <input
              type="text"
              className="block w-full p-4 pl-12 pr-32 text-lg text-slate-900 border border-slate-200 rounded-2xl bg-white shadow-sm focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
              placeholder="e.g. Noise cancelling headphones under $150..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={isAnalyzing}
            />
            <button
              type="submit"
              disabled={isAnalyzing || !query.trim()}
              className="absolute right-2 top-2 bottom-2 px-6 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 text-white font-medium rounded-xl transition-colors flex items-center gap-2"
            >
              {isAnalyzing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                'Find'
              )}
            </button>
          </form>
          {error && <p className="text-red-500 mt-3 text-sm font-medium text-center">{error}</p>}
        </div>

        {/* Loading Multi-Agent State */}
        <AnimatePresence mode="wait">
          {isAnalyzing && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="max-w-2xl mx-auto space-y-4"
            >
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-6 text-center">
                System flow initialized
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {AGENTS.map((agent, index) => {
                  const isActive = index === activeAgentIndex;
                  const isDone = index < activeAgentIndex;
                  const isWaiting = index > activeAgentIndex;

                  return (
                    <motion.div
                      key={agent.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className={cn(
                        "p-4 rounded-2xl border transition-all duration-500 flex items-start gap-4",
                        isActive ? "bg-white border-blue-200 shadow-[0_0_20px_-5px_rgba(59,130,246,0.2)]" :
                        isDone ? "bg-slate-50 border-emerald-200" : "bg-slate-50/50 border-slate-100 opacity-50"
                      )}
                    >
                      <div className={cn(
                        "p-2.5 rounded-xl shrink-0 transition-colors",
                         isActive ? "bg-blue-100 text-blue-600" :
                         isDone ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400"
                      )}>
                        <agent.icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                         <h4 className="font-semibold text-slate-900 mb-1">{agent.name}</h4>
                         <p className="text-sm text-slate-500 truncate">
                            {isWaiting && "Awaiting input..."}
                            {isActive && (
                               <span className="flex items-center gap-2 text-blue-600">
                                 <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0"/>
                                 {agent.loadingMsg}
                               </span>
                            )}
                            {isDone && <span className="text-emerald-600 flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Task completed</span>}
                         </p>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Result Dashboard */}
        <AnimatePresence>
          {!isAnalyzing && result && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              
              {/* Product Card */}
              <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-bl-full -z-10 blur-3xl opacity-60" />
                
                <div className="flex flex-col md:flex-row gap-8 items-start justify-between mb-8 pb-8 border-b border-slate-100">
                  <div>
                     <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold mb-6">
                        <CheckCircle className="w-4 h-4" /> AI Recommended
                     </div>
                     <h2 className="text-3xl font-bold text-slate-900 mb-3">{result.best_product.name}</h2>
                     <p className="text-lg text-slate-600 max-w-2xl">{result.best_product.description}</p>
                  </div>
                  <div className="shrink-0 bg-blue-50 border border-blue-100 p-6 rounded-2xl text-center md:min-w-[200px]">
                     <div className="text-sm font-medium text-blue-600 uppercase tracking-wider mb-2">Final Score</div>
                     <div className="text-6xl font-bold text-blue-900">{result.final_score}</div>
                     <div className="text-sm text-slate-500 mt-2">out of 100</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                       <BarChart2 className="w-5 h-5 text-indigo-500" />
                       Market Insights
                    </h3>
                    <p className="text-slate-600 leading-relaxed bg-slate-50 p-5 rounded-2xl border border-slate-100">
                      {result.market_insight}
                    </p>

                    <div className="mt-6 flex flex-wrap items-center gap-4">
                       <div className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl bg-white shadow-sm">
                          <DollarSign className="w-4 h-4 text-slate-400" />
                          <span className="text-sm font-medium text-slate-700">Est. Price: {result.best_product.estimated_price}</span>
                       </div>
                       <a href={`https://www.amazon.com/s?k=${encodeURIComponent(result.best_product.amazon_search_query)}`} target="_blank" rel="noopener noreferrer" 
                          className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-medium transition-colors">
                          View on Amazon <ArrowRight className="w-4 h-4" />
                       </a>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <ScoreBar label="Price Competitiveness" score={result.price_score} icon={DollarSign} color="from-green-500 to-emerald-400" />
                    <ScoreBar label="Quality Analyst Score" score={result.quality_score} icon={ShieldCheck} color="from-blue-500 to-cyan-400" />
                    <ScoreBar label="Conversion Prediction" score={result.conversion_score} icon={TrendingUp} color="from-indigo-500 to-purple-400" />
                  </div>
                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

      </main>
    </div>
  );
}

function ScoreBar({ label, score, icon: Icon, color }: { label: string, score: number, icon: any, color: string }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
           <Icon className="w-4 h-4 text-slate-500" />
           <span className="font-semibold text-slate-700 text-sm">{label}</span>
        </div>
        <span className="font-bold text-slate-900">{score}/100</span>
      </div>
      <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
          className={cn("h-full rounded-full bg-gradient-to-r", color)}
        />
      </div>
    </div>
  );
}

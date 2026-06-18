import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Clock, 
  TrendingUp, 
  Calendar, 
  TrendingDown, 
  Plus, 
  Trash2, 
  HelpCircle, 
  Coins, 
  FileText,
  BookmarkCheck,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { ExpenseCategory, IncomeSource, UserFinanceState } from '../types';
import { DEFAULT_CATEGORIES, DEFAULT_INCOME_SOURCES } from '../data';

interface OnboardingProps {
  onComplete: (setup: { categories: ExpenseCategory[]; incomeSources: IncomeSource[]; loadDemo: boolean }) => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [categories, setCategories] = useState<ExpenseCategory[]>(DEFAULT_CATEGORIES);
  const [incomeSources, setIncomeSources] = useState<IncomeSource[]>(DEFAULT_INCOME_SOURCES);
  
  // Custom Category Input
  const [newCatName, setNewCatName] = useState('');
  const [newCatLimit, setNewCatLimit] = useState<number>(500);
  const [newCatColor, setNewCatColor] = useState('bg-[#ECF5FC] text-sky-800 border-sky-200/60');

  // Custom Source Input
  const [newSrcName, setNewSrcName] = useState('');
  const [newSrcExpected, setNewSrcExpected] = useState<number>(1000);
  const [newSrcColor, setNewSrcColor] = useState('bg-[#EAF7EE] text-emerald-800 border-emerald-200/60');

  // Setup options
  const [loadDemoData, setLoadDemoData] = useState(false);
  const [activeTab, setActiveTab] = useState<'expenses' | 'revenue'>('expenses');

  const pastelColors = [
    { name: 'Azul', bg: 'bg-[#ECF5FC] text-sky-800 border-sky-200/60' },
    { name: 'Pêssego', bg: 'bg-[#FDF1EB] text-amber-800 border-orange-200/60' },
    { name: 'Lilás', bg: 'bg-[#F5EEFB] text-purple-800 border-purple-200/60' },
    { name: 'Verde', bg: 'bg-[#EAF7EE] text-emerald-800 border-emerald-200/60' },
  ];

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    
    const newCat: ExpenseCategory = {
      id: Date.now().toString(),
      name: newCatName.trim(),
      limit: Number(newCatLimit) || 0,
      spent: 0,
      color: newCatColor,
    };
    
    setCategories([...categories, newCat]);
    setNewCatName('');
    setNewCatLimit(500);
  };

  const handleAddSource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSrcName.trim()) return;

    const newSrc: IncomeSource = {
      id: Date.now().toString(),
      name: newSrcName.trim(),
      expectedAmount: Number(newSrcExpected) || 0,
      color: newSrcColor,
    };

    setIncomeSources([...incomeSources, newSrc]);
    setNewSrcName('');
    setNewSrcExpected(1000);
  };

  const handleRemoveCategory = (id: string) => {
    setCategories(categories.filter(c => c.id !== id));
  };

  const handleRemoveSource = (id: string) => {
    setIncomeSources(incomeSources.filter(s => s.id !== id));
  };

  const formatCurrency = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div id="onboarding-container" className="min-h-screen bg-[#FAF9F6] text-[#2D3436] py-12 px-6 flex flex-col items-center justify-between font-sans">
      
      {/* Upper Brand / Welcome */}
      <div className="w-full max-w-4xl mx-auto text-center mt-4 mb-10">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#E0F2FE] text-[#0369A1] border border-[#7DD3FC]/40 text-xs font-semibold mb-4 tracking-wide"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Configuração do Primeiro Acesso
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#1A1A1A] mb-4"
        >
          Bem-vindo ao seu App de Finanças!
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-lg md:text-xl text-[#636E72] max-w-2xl mx-auto leading-relaxed"
        >
          Vamos organizar suas finanças e entender de onde sai o seu dinheiro.
        </motion.p>
      </div>

      {/* Main Empty State functional cards: Zeradas conforme o requisito com tema Bento Grid */}
      <div className="w-full max-w-4xl mx-auto mb-10">
        <div className="text-center mb-6">
          <span className="text-xs font-bold tracking-wider text-[#636E72]/80 uppercase">Visão Inicial das suas Cartas Funcionais</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Receber Pendente (Lilás) */}
          <motion.div 
            whileHover={{ scale: 1.01 }}
            className="bg-[#F3E8FF] rounded-[40px] p-8 border-2 border-[#D8B4FE] flex flex-col justify-between min-h-[180px] transition-all shadow-xs"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-xs text-purple-600">
                <Clock className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-[#5B21B6]">Receber Pendente</h3>
            </div>
            <div className="mt-6">
              <p className="text-sm text-[#7C3AED] font-medium uppercase tracking-wider mb-1">Aguardando Confirmação</p>
              <p className="text-4xl md:text-5xl font-extrabold text-[#4C1D95]">R$ 0,00</p>
            </div>
          </motion.div>

          {/* Receita (Verde) */}
          <motion.div 
            whileHover={{ scale: 1.01 }}
            className="bg-[#DCFCE7] rounded-[40px] p-8 border-2 border-[#86EFAC] flex flex-col justify-between min-h-[180px] transition-all shadow-xs"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-xs text-emerald-600">
                <TrendingUp className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-[#166534]">Receita</h3>
            </div>
            <div className="mt-6">
              <p className="text-sm text-[#15803D] font-medium uppercase tracking-wider mb-1">Entradas Confirmadas</p>
              <p className="text-4xl md:text-5xl font-extrabold text-[#064E3B]">R$ 0,00</p>
            </div>
          </motion.div>

          {/* A Receber (Pêssego) */}
          <motion.div 
            whileHover={{ scale: 1.01 }}
            className="bg-[#FFEDD5] rounded-[40px] p-8 border-2 border-[#FDBA74] flex flex-col justify-between min-h-[180px] transition-all shadow-xs"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-xs text-amber-600">
                <Calendar className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-[#9A3412]">A Receber</h3>
            </div>
            <div className="mt-6">
              <p className="text-sm text-[#C2410C] font-medium uppercase tracking-wider mb-1">Próximos Lançamentos</p>
              <p className="text-4xl md:text-5xl font-extrabold text-[#7C2D12]">R$ 0,00</p>
            </div>
          </motion.div>

          {/* Gastos (Azul) */}
          <motion.div 
            whileHover={{ scale: 1.01 }}
            className="bg-[#E0F2FE] rounded-[40px] p-8 border-2 border-[#7DD3FC] flex flex-col justify-between min-h-[180px] transition-all shadow-xs"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-xs text-sky-600">
                <TrendingDown className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-[#075985]">Gastos</h3>
            </div>
            <div className="mt-6">
              <p className="text-sm text-[#0369A1] font-medium uppercase tracking-wider mb-1">Total de Despesas</p>
              <p className="text-4xl md:text-5xl font-extrabold text-[#0C4A6E]">R$ 0,00</p>
            </div>
          </motion.div>

        </div>
      </div>

      {/* Dynamic Interaction Panel */}
      <div className="w-full max-w-4xl bg-white rounded-3xl border border-slate-200/60 shadow-md p-6 md:p-8 mb-8">
        
        {/* Step Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-5 mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Coins className="text-sky-600 block md:hidden lg:block" />
              Vamos customizar sua estrutura inicial?
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Personalize suas categorias de gastos e fontes de receita antes de entrar no painel.
            </p>
          </div>
          
          {/* Tab Selector */}
          <div className="flex bg-slate-100 p-1 rounded-xl mt-4 md:mt-0 gap-1 self-start">
            <button
              id="tab-btn-expenses"
              onClick={() => setActiveTab('expenses')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'expenses' 
                  ? 'bg-white text-slate-900 shadow-xs' 
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              De onde sai o dinheiro? (Categorias)
            </button>
            <button
              id="tab-btn-revenue"
              onClick={() => setActiveTab('revenue')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'revenue' 
                  ? 'bg-white text-slate-900 shadow-xs' 
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              De onde vem o dinheiro? (Receita)
            </button>
          </div>
        </div>

        {/* ONBOARDING CONTENT DYNAMICS */}
        <div className="min-h-[280px]">
          {activeTab === 'expenses' ? (
            <motion.div 
              id="onboarding-expenses-panel"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-6"
            >
              <div className="bg-sky-50/50 border border-sky-100 p-4 rounded-xl flex items-start gap-3">
                <div className="p-1 rounded-md bg-sky-100 text-sky-700 mt-0.5">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-sky-950">De onde sai o seu dinheiro?</h3>
                  <p className="text-xs text-sky-800 bg-transparent mt-0.5">
                    Defina categorias para classificar suas despesas e coloque limites de aviso (metas de gastos). Seus saldos começarão zerados, permitindo que você lance seus primeiros gastos de forma controlada.
                  </p>
                </div>
              </div>

              {/* Grid of editable categories */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {categories.map((cat) => (
                  <div 
                    key={cat.id} 
                    className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 bg-white shadow-xs transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`px-2.5 py-1 rounded-md text-xs font-bold ${cat.color}`}>
                        {cat.name}
                      </div>
                      <div className="text-slate-400 text-xs">
                        Limite: <span className="font-semibold text-slate-700">{formatCurrency(cat.limit)}</span>
                      </div>
                    </div>
                    <button 
                      id={`remove-cat-${cat.id}`}
                      onClick={() => handleRemoveCategory(cat.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all cursor-pointer"
                      title="Excluir categoria"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add New Category Form */}
              <form onSubmit={handleAddCategory} className="bg-slate-50/70 p-4 rounded-2xl border border-dashed border-slate-200">
                <span className="text-xs font-extrabold text-slate-400 block mb-3 uppercase tracking-wider">Adicionar Nova Categoria</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Nome da Categoria</label>
                    <input 
                      id="input-new-cat-name"
                      type="text" 
                      placeholder="Ex: Saúde, Educação" 
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      className="w-full text-xs font-medium bg-white border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-hidden focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Limite Mensal Estimado (R$)</label>
                    <input 
                      id="input-new-cat-limit"
                      type="number" 
                      value={newCatLimit}
                      onChange={(e) => setNewCatLimit(Number(e.target.value))}
                      className="w-full text-xs font-medium bg-white border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-hidden focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <button 
                      id="btn-add-cat-submit"
                      type="submit" 
                      className="w-full flex items-center justify-center gap-1.5 bg-slate-900 text-white font-bold text-xs py-2.5 px-4 rounded-xl cursor-pointer hover:bg-slate-800 transition-all"
                    >
                      <Plus className="w-4 h-4" /> Adicionar
                    </button>
                  </div>
                </div>

                <div className="mt-3.5 flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-semibold">Cor Pastel:</span>
                  <div className="flex gap-1.5">
                    {pastelColors.map((col) => (
                      <button
                        id={`btn-cat-color-${col.name}`}
                        key={col.name}
                        type="button"
                        onClick={() => setNewCatColor(col.bg)}
                        className={`px-2 py-1 rounded text-[10px] font-bold border transition-all ${col.bg} ${
                          newCatColor === col.bg ? 'ring-2 ring-slate-900 border-transparent shadow-xs' : 'opacity-60 hover:opacity-100'
                        }`}
                      >
                        {col.name}
                      </button>
                    ))}
                  </div>
                </div>
              </form>
            </motion.div>
          ) : (
            <motion.div 
              id="onboarding-revenue-panel"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-6"
            >
              <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-xl flex items-start gap-3">
                <div className="p-1 rounded-md bg-emerald-100 text-emerald-700 mt-0.5">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-emerald-950">De onde vem o seu dinheiro?</h3>
                  <p className="text-xs text-emerald-800 bg-transparent mt-0.5">
                    Quais são as suas fontes de receitas habituais? Cadastre para planejar as entradas no caixa do seu aplicativo. Todas as receitas estarão inicialmente zeradas para que você as confirme conforme forem depositadas.
                  </p>
                </div>
              </div>

              {/* Grid of editable sources */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {incomeSources.map((src) => (
                  <div 
                    key={src.id} 
                    className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 bg-white shadow-xs transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`px-2.5 py-1 rounded-md text-xs font-bold ${src.color}`}>
                        {src.name}
                      </div>
                      <div className="text-slate-400 text-xs">
                        Estimado: <span className="font-semibold text-slate-700">{formatCurrency(src.expectedAmount)}</span>
                      </div>
                    </div>
                    <button 
                      id={`remove-src-${src.id}`}
                      onClick={() => handleRemoveSource(src.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all cursor-pointer"
                      title="Excluir fonte"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add New Source Form */}
              <form onSubmit={handleAddSource} className="bg-slate-50/70 p-4 rounded-2xl border border-dashed border-slate-200">
                <span className="text-xs font-extrabold text-slate-400 block mb-3 uppercase tracking-wider">Adicionar Nova Fonte de Entrada</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Nome da Fonte</label>
                    <input 
                      id="input-new-src-name"
                      type="text" 
                      placeholder="Ex: Investimentos, Pensão" 
                      value={newSrcName}
                      onChange={(e) => setNewSrcName(e.target.value)}
                      className="w-full text-xs font-medium bg-white border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Valor Mensal Estimado (R$)</label>
                    <input 
                      id="input-new-src-expected"
                      type="number" 
                      value={newSrcExpected}
                      onChange={(e) => setNewSrcExpected(Number(e.target.value))}
                      className="w-full text-xs font-medium bg-white border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <button 
                      id="btn-add-src-submit"
                      type="submit" 
                      className="w-full flex items-center justify-center gap-1.5 bg-slate-900 text-white font-bold text-xs py-2.5 px-4 rounded-xl cursor-pointer hover:bg-slate-800 transition-all"
                    >
                      <Plus className="w-4 h-4" /> Adicionar
                    </button>
                  </div>
                </div>

                <div className="mt-3.5 flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-semibold">Cor Pastel:</span>
                  <div className="flex gap-1.5">
                    {pastelColors.map((col) => (
                      <button
                        id={`btn-src-color-${col.name}`}
                        key={col.name}
                        type="button"
                        onClick={() => setNewSrcColor(col.bg)}
                        className={`px-2 py-1 rounded text-[10px] font-bold border transition-all ${col.bg} ${
                          newSrcColor === col.bg ? 'ring-2 ring-slate-900 border-transparent shadow-xs' : 'opacity-60 hover:opacity-100'
                        }`}
                      >
                        {col.name}
                      </button>
                    ))}
                  </div>
                </div>
              </form>
            </motion.div>
          )}
        </div>

        {/* Demo Data Option */}
        <div className="mt-8 border-t border-slate-100 pt-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <input 
              id="checkbox-load-demo"
              type="checkbox" 
              checked={loadDemoData}
              onChange={(e) => setLoadDemoData(e.target.checked)}
              className="w-4.5 h-4.5 text-sky-600 rounded-md border-slate-300 focus:ring-sky-500 focus:ring-1 accent-sky-500 cursor-pointer"
            />
            <label htmlFor="checkbox-load-demo" className="text-xs font-bold text-slate-600 cursor-pointer select-none">
              Deseja carregar dados iniciais de exemplo / simulação? <span className="font-normal text-slate-400 font-sans">(Recomendado para testar os gráficos interativos de imediato!)</span>
            </label>
          </div>
          <span className="text-xs text-sky-600 font-extrabold uppercase hidden md:inline-flex items-center gap-1">
            Recomendado
            <BookmarkCheck className="w-3.5 h-3.5" />
          </span>
        </div>

      </div>

      {/* Styled Centered Pastel Blue Footer Button as explicitly directed by Bento Grid design theme:
          "No rodapé, adicione um botão centralizado ‘Vamos começar a organizar!’ em azul pastel com sombra e efeitos táteis." */}
      <div className="w-full flex flex-col items-center gap-2 mt-6 mb-8">
        <motion.button
          id="btn-confirm-onboarding"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onComplete({ categories, incomeSources, loadDemo: loadDemoData })}
          className="bg-[#BAE6FD] hover:bg-[#7DD3FC] text-[#0369A1] text-lg font-bold py-5 px-16 rounded-full border-b-4 border-[#7DD3FC] shadow-lg active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-3.5 cursor-pointer"
        >
          <span>Vamos começar a organizar!</span>
          <ArrowRight className="w-5.5 h-5.5" />
        </motion.button>
        <p className="text-[10px] text-[#636E72] font-mono tracking-wider uppercase mt-2">Dê o primeiro passo para o controle financeiro</p>
      </div>

    </div>
  );
}

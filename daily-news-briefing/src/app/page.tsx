'use client';

import { useState } from 'react';
import { useConfig } from '@/hooks/useConfig';
import SettingsModal from '@/components/SettingsModal';
import { Settings, RefreshCw, FileText, ExternalLink, CheckSquare, Square } from 'lucide-react';
import { generatePPTX } from '@/lib/pptGenerator';

export default function Home() {
  const { config, saveConfig, isLoaded } = useConfig();
  const [showSettings, setShowSettings] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [ownNews, setOwnNews] = useState<any[]>([]);
  const [competitorNews, setCompetitorNews] = useState<any[]>([]);

  // 현재 날짜
  const today = new Date().toISOString().split('T')[0];

  if (!isLoaded || !config) return <div className="p-8 text-center">Loading...</div>;

  const isConfigured = !!config.clientBrand;

  const handleFetchNews = async () => {
    if (!isConfigured) return;
    setIsFetching(true);
    try {
      const res = await fetch('/api/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config })
      });
      const data = await res.json();
      if (data.error) {
        alert('뉴스 수집 중 오류가 발생했습니다: ' + data.error);
      } else {
        setOwnNews(data.ownNews || []);
        setCompetitorNews(data.competitorNews || []);
      }
    } catch (e) {
      console.error(e);
      alert('서버 통신 오류가 발생했습니다.');
    } finally {
      setIsFetching(false);
    }
  };

  const handleGeneratePPTX = async () => {
    setIsGenerating(true);
    try {
      await generatePPTX(config, ownNews, competitorNews, today);
    } catch (e) {
      console.error('PPT Error:', e);
      alert('PPT 생성 중 오류가 발생했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleSelection = (id: string | number, isOwn: boolean) => {
    if (isOwn) {
      setOwnNews(prev => prev.map((n, i) => i === id ? { ...n, selected: !n.selected } : n));
    } else {
      setCompetitorNews(prev => prev.map((n, i) => i === id ? { ...n, selected: !n.selected } : n));
    }
  };

  const NewsItem = ({ news, index, isOwn }: { news: any, index: number, isOwn: boolean }) => (
    <div className={`p-4 mb-3 rounded-lg border ${news.selected ? 'bg-white border-blue-200 shadow-sm' : 'bg-gray-50 border-gray-100 opacity-60'} transition-all`}>
      <div className="flex gap-3">
        <button onClick={() => toggleSelection(index, isOwn)} className="mt-1 text-gray-500 hover:text-blue-600">
          {news.selected ? <CheckSquare className="text-blue-600" size={20} /> : <Square size={20} />}
        </button>
        <div className="flex-1">
          <div className="flex items-start justify-between mb-1">
            <h3 className="font-semibold text-gray-800 line-clamp-1 flex-1 pr-2">
              <span className={`text-xs font-bold px-2 py-1 rounded text-white mr-2 ${news.source === '뉴스' ? 'bg-blue-500' : news.source === '유튜브' ? 'bg-red-500' : 'bg-pink-500'}`}>
                {news.source}
              </span>
              <span className="text-xs font-bold px-2 py-1 bg-gray-200 rounded text-gray-700 mr-2">{news.brand}</span>
              {news.title}
            </h3>
            <a href={news.link} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-blue-500">
              <ExternalLink size={16} />
            </a>
          </div>
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">{news.summary}</p>
          <div className="flex items-center gap-2 text-xs">
            <span className={`px-2 py-0.5 rounded font-medium ${
              news.sentiment === '부정' ? 'bg-red-100 text-red-700' : 
              news.sentiment === '긍정' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
            }`}>
              {news.sentiment}
            </span>
            <span className="text-gray-400">점수: {news.score}</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* 헤더 */}
        <header className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 tracking-tight">데일리 뉴스 브리핑 생성기</h1>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              <span className="font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded">광고주: {config.clientBrand || '미설정'}</span>
              <span>기준일: {today}</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={() => setShowSettings(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition"
            >
              <Settings size={18} />
              설정
            </button>
            <button 
              onClick={handleFetchNews}
              className={`flex items-center gap-2 px-4 py-2 text-white rounded-lg font-medium transition ${isConfigured && !isFetching ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-400 cursor-not-allowed'}`}
              disabled={!isConfigured || isFetching}
            >
              <RefreshCw size={18} className={isFetching ? 'animate-spin' : ''} />
              {isFetching ? '수집 중...' : '뉴스 수집'}
            </button>
            <button 
              onClick={handleGeneratePPTX}
              className={`flex items-center gap-2 px-4 py-2 text-white rounded-lg font-medium transition ${(ownNews.length > 0 || competitorNews.length > 0) && !isGenerating ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-400 cursor-not-allowed'}`}
              disabled={(ownNews.length === 0 && competitorNews.length === 0) || isGenerating}
            >
              <FileText size={18} className={isGenerating ? 'animate-pulse' : ''} />
              {isGenerating ? '생성 중...' : 'PPT 생성'}
            </button>
          </div>
        </header>

        {/* 본문 영역 */}
        {!isConfigured ? (
          <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-100 text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">설정이 필요합니다</h2>
            <p className="text-gray-500 mb-6">오른쪽 상단의 [설정] 버튼을 눌러 기준 브랜드와 API 키를 먼저 입력해주세요.</p>
            <button 
              onClick={() => setShowSettings(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-bold shadow-md hover:bg-blue-700 transition"
            >
              ⚙️ 지금 설정하기
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col max-h-[75vh]">
              <h2 className="text-lg font-bold text-indigo-900 border-b pb-3 mb-4 flex justify-between items-center sticky top-0 bg-white z-10">
                <span>■ 경쟁사 뉴스</span>
                <span className="text-sm font-normal text-gray-500">
                  {competitorNews.length > 0 ? `선택됨: ${competitorNews.filter(n => n.selected).length} / ${competitorNews.length}건` : '수집 대기 중'}
                </span>
              </h2>
              <div className="overflow-y-auto flex-1 pr-2">
                {competitorNews.length === 0 ? (
                  <div className="text-gray-400 text-center py-10">상단의 [뉴스 수집] 버튼을 눌러주세요.</div>
                ) : (
                  competitorNews.map((news, i) => <NewsItem key={`comp-${i}`} news={news} index={i} isOwn={false} />)
                )}
              </div>
            </section>

            <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col max-h-[75vh]">
              <h2 className="text-lg font-bold text-red-900 border-b pb-3 mb-4 flex justify-between items-center sticky top-0 bg-white z-10">
                <span>■ 자사 이슈 뉴스</span>
                <span className="text-sm font-normal text-gray-500">
                  {ownNews.length > 0 ? `부정 뉴스 우선 정렬 (${ownNews.filter(n => n.selected).length}건 선택됨)` : '수집 대기 중'}
                </span>
              </h2>
              <div className="overflow-y-auto flex-1 pr-2">
                {ownNews.length === 0 ? (
                  <div className="text-gray-400 text-center py-10">상단의 [뉴스 수집] 버튼을 눌러주세요.</div>
                ) : (
                  ownNews.map((news, i) => <NewsItem key={`own-${i}`} news={news} index={i} isOwn={true} />)
                )}
              </div>
            </section>
          </div>
        )}

      </div>

      {showSettings && (
        <SettingsModal 
          config={config} 
          onSave={saveConfig} 
          onClose={() => setShowSettings(false)} 
        />
      )}
    </div>
  );
}

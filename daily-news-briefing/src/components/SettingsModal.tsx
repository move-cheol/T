import { useState, useEffect } from 'react';
import { AppConfig } from '@/hooks/useConfig';
import { X } from 'lucide-react';

interface Props {
  config: AppConfig;
  onSave: (config: AppConfig) => void;
  onClose: () => void;
}

export default function SettingsModal({ config, onSave, onClose }: Props) {
  const [form, setForm] = useState<AppConfig>(config);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-gray-800">⚙️ 환경 설정</h2>
          <button onClick={onClose} className="text-gray-500 hover:bg-gray-100 p-2 rounded-full">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <section>
            <h3 className="text-lg font-semibold text-blue-800 mb-4 pb-2 border-b">1. 브랜드 설정 (필수)</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">우리 브랜드 (기준 광고주)</label>
                <input
                  type="text"
                  required
                  placeholder="예: A화장품"
                  className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                  value={form.clientBrand}
                  onChange={e => setForm({ ...form, clientBrand: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">경쟁사 브랜드 (쉼표로 구분, 최대 10개 권장)</label>
                <input
                  type="text"
                  placeholder="예: B화장품, C뷰티, D코스메틱"
                  className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                  value={form.competitors}
                  onChange={e => setForm({ ...form, competitors: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">자사 뉴스 필터링용 부정 키워드 (쉼표로 구분)</label>
                <input
                  type="text"
                  placeholder="예: 논란, 리콜, 소송"
                  className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                  value={form.negativeKeywords}
                  onChange={e => setForm({ ...form, negativeKeywords: e.target.value })}
                />
              </div>
            </div>
          </section>



          <div className="flex justify-end pt-4 sticky bottom-0 bg-white">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 bg-gray-100 rounded mr-2 hover:bg-gray-200">취소</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-bold shadow">설정 저장</button>
          </div>
        </form>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { LessonRateSettings, LessonRates, LessonType, LESSON_TYPES, LESSON_TYPE_NAMES, LocationRateProfile } from '../types';
import ArrowLeftIcon from './icons/ArrowLeftIcon';

interface LessonRateSetupProps {
  onSave: (profile: Omit<LocationRateProfile, 'id'>) => void;
  onCancel: () => void;
  existingProfile: LocationRateProfile | null;
}

const initialRates: LessonRates = LESSON_TYPES.reduce((acc, type) => {
    acc[type] = { type: 'hourly', amount: 0 };
    return acc;
}, {} as LessonRates);

const RateInputRow: React.FC<{
  lessonType: LessonType;
  rates: LessonRates;
  onRateChange: (lessonType: LessonType, newRate: any) => void;
}> = ({ lessonType, rates, onRateChange }) => {
  const rate = rates[lessonType];
  const incomeType = 'hourly';
  const amount = rate?.amount || 0;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numericValue = parseInt(e.target.value.replace(/,/g, ''), 10) || 0;
    onRateChange(lessonType, { ...rate, type: incomeType, amount: numericValue });
  };

  return (
    <div className="py-3 border-b last:border-0 border-gray-100">
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-gray-800">{LESSON_TYPE_NAMES[lessonType]}</label>
        <div className="flex items-center space-x-1">
          <span className={`px-3 py-1 text-xs rounded-full border bg-[#ff5710] text-white border-[#ff5710]`}>시급</span>
        </div>
      </div>
      <div className="relative">
        <input
          type="text"
          inputMode="numeric"
          value={amount === 0 ? '' : amount.toLocaleString('ko-KR')}
          onChange={handleAmountChange}
          placeholder="0"
          className="w-full bg-gray-100 text-gray-800 text-right pr-10 py-2 rounded-md border border-gray-200 focus:ring-[#ff5710] focus:border-[#ff5710] text-sm"
        />
        <span className="absolute inset-y-0 right-3 flex items-center text-sm text-gray-500 pointer-events-none">원</span>
      </div>
    </div>
  );
};


const LessonRateSetup: React.FC<LessonRateSetupProps> = ({ onSave, onCancel, existingProfile }) => {
  const [activeTab, setActiveTab] = useState<'weekday' | 'weekend'>('weekday');
  const [name, setName] = useState('');
  const [settings, setSettings] = useState<LessonRateSettings>({ 
    weekday: { ...initialRates }, 
    weekend: { ...initialRates } 
  });

  const isEditing = !!existingProfile;

  useEffect(() => {
    if (existingProfile) {
        setName(existingProfile.name);
        const mergedSettings = {
          weekday: {...initialRates, ...existingProfile.rates.weekday},
          weekend: {...initialRates, ...existingProfile.rates.weekend},
        }
        setSettings(mergedSettings);
    }
  }, [existingProfile]);


  const handleRateChange = (dayType: 'weekday' | 'weekend') => (lessonType: LessonType, newRate: any) => {
    setSettings(prev => ({
      ...prev,
      [dayType]: {
        ...prev[dayType],
        [lessonType]: newRate
      }
    }));
  };
  
  const handleSave = () => {
     if (!name.trim()) {
        alert('지점명을 입력해주세요.');
        return;
    }
    onSave({ name, rates: settings });
  };

  return (
    <div className="fixed inset-0 bg-gray-50 z-30 animate-fade-in flex flex-col max-w-xs mx-auto pb-16">
      <header className="bg-white sticky top-0 z-10 p-4 border-b flex items-center justify-center h-16 flex-shrink-0">
        <button onClick={onCancel} className="absolute left-4 p-2 -ml-2 text-gray-500 hover:text-gray-800"><ArrowLeftIcon /></button>
        <h1 className="text-lg font-bold text-gray-900">{isEditing ? '지점 정보 수정' : '새 지점 등록'}</h1>
      </header>

      <main className="flex-grow p-4 overflow-y-auto min-h-0">
        <p className="text-xs text-gray-600 mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          레슨 수익을 자동으로 계산하기 위해, 지점별로 레슨 단가를 설정해주세요. 이 설정은 언제든지 변경할 수 있습니다.
        </p>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
           <div className="mb-4">
            <label htmlFor="location-name" className="inline-block text-sm font-bold text-gray-700 mb-2">지점명</label>
            <input 
              type="text" 
              id="location-name" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              className="w-full bg-gray-100 text-gray-800 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#ff5710] focus:border-[#ff5710] text-sm" 
              placeholder="예: 강남 테니스장"
            />
          </div>
          <div className="flex border-b mb-4">
            <button onClick={() => setActiveTab('weekday')} className={`flex-1 py-2 text-sm font-semibold ${activeTab === 'weekday' ? 'border-b-2 border-[#ff5710] text-[#ff5710]' : 'text-gray-500'}`}>평일</button>
            <button onClick={() => setActiveTab('weekend')} className={`flex-1 py-2 text-sm font-semibold ${activeTab === 'weekend' ? 'border-b-2 border-[#ff5710] text-[#ff5710]' : 'text-gray-500'}`}>주말</button>
          </div>
          <div>
            {activeTab === 'weekday' && LESSON_TYPES.map(type => (
              <RateInputRow key={type} lessonType={type} rates={settings.weekday} onRateChange={handleRateChange('weekday')} />
            ))}
            {activeTab === 'weekend' && LESSON_TYPES.map(type => (
              <RateInputRow key={type} lessonType={type} rates={settings.weekend} onRateChange={handleRateChange('weekend')} />
            ))}
          </div>
        </div>
      </main>

      <footer className="p-4 bg-white border-t flex-shrink-0">
        <button onClick={handleSave} className="w-full bg-[#ff5710] text-white font-bold py-3 rounded-lg hover:bg-[#e64e0e] transition-colors">
          {isEditing ? '수정 완료' : '저장하고 수익 등록하기'}
        </button>
      </footer>
    </div>
  );
};

export default LessonRateSetup;
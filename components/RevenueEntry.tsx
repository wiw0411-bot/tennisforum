import React, { useState, useMemo } from 'react';
import { LocationRateProfile, LessonCounts, DailyRevenue, LessonType, LESSON_TYPES, LESSON_TYPE_NAMES } from '../types';
import ArrowLeftIcon from './icons/ArrowLeftIcon';

interface RevenueEntryProps {
  selectedDate: Date;
  locationProfile: LocationRateProfile;
  existingData: DailyRevenue | null;
  onSave: (date: string, data: DailyRevenue) => void;
  onCancel: () => void;
}

const RevenueEntry: React.FC<RevenueEntryProps> = ({ selectedDate, locationProfile, existingData, onSave, onCancel }) => {
  const [counts, setCounts] = useState<LessonCounts>(
    existingData?.counts || LESSON_TYPES.reduce((acc, type) => ({ ...acc, [type]: 0 }), {} as LessonCounts)
  );
  const [lessonDuration, setLessonDuration] = useState<20 | 30 | 60>(existingData?.duration || 60);
  
  const handleCountChange = (lessonType: LessonType, value: string) => {
    const newCount = parseInt(value, 10) || 0;
    setCounts(prev => ({...prev, [lessonType]: newCount}));
  };

  const dayOfWeek = selectedDate.getDay(); // 0 for Sunday, 6 for Saturday
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  const applicableRates = useMemo(() => {
    const { weekday, weekend } = locationProfile.rates;
    return isWeekend ? weekend : weekday;
  }, [isWeekend, locationProfile.rates]);

  const totalRevenue = useMemo(() => {
    const multiplier = lessonDuration / 60.0;
    
    let total = 0;
    for (const type of LESSON_TYPES) {
        const count = counts[type] || 0;
        const hourlyRate = applicableRates[type]?.amount ?? 0;
        
        if (count > 0 && hourlyRate > 0) {
            total += count * multiplier * hourlyRate;
        }
    }
    
    return Math.round(total);
  }, [counts, applicableRates, lessonDuration]);
  
  const handleSave = () => {
    const dateKey = `${selectedDate.getFullYear()}-${(selectedDate.getMonth() + 1).toString().padStart(2, '0')}-${selectedDate.getDate().toString().padStart(2, '0')}`;
    onSave(dateKey, { 
      locationId: locationProfile.id,
      locationName: locationProfile.name,
      counts, 
      total: totalRevenue,
      duration: lessonDuration
    });
  };
  
  const formattedDate = `${selectedDate.getFullYear()}년 ${selectedDate.getMonth() + 1}월 ${selectedDate.getDate()}일`;

  return (
    <div className="fixed inset-0 bg-gray-50 z-40 animate-fade-in flex flex-col max-w-xs mx-auto pb-16">
       <header className="bg-white sticky top-0 z-10 p-4 border-b flex items-center justify-center h-16 flex-shrink-0">
        <button onClick={onCancel} className="absolute left-4 p-2 -ml-2 text-gray-500 hover:text-gray-800"><ArrowLeftIcon /></button>
        <h1 className="text-lg font-bold text-gray-900">수익 등록 ({locationProfile.name})</h1>
      </header>

      <main className="flex-grow p-4 overflow-y-auto min-h-0">
        <div className="text-center mb-4">
          <p className="font-bold text-gray-800">{formattedDate}</p>
        </div>

        <div className="p-3 bg-gray-100 rounded-lg mb-4">
            <label className="text-sm font-medium text-gray-700 mb-2 block text-center">레슨 시간</label>
            <div className="flex items-center justify-center space-x-2">
                {([20, 30, 60] as const).map(d => (
                    <button
                        key={d}
                        type="button"
                        onClick={() => setLessonDuration(d)}
                        className={`flex-1 px-2 py-2 text-sm rounded-lg border transition-colors font-semibold ${
                            lessonDuration === d
                                ? 'bg-[#ff5710] text-white border-[#ff5710]'
                                : 'bg-white text-gray-700 border-gray-300 hover:border-[#ff5710]'
                        }`}
                    >
                        {d}분
                    </button>
                ))}
            </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-100">
          {LESSON_TYPES.map(type => (
            <div key={type} className="flex items-center justify-between py-3">
              <label htmlFor={`count-${type}`} className="text-sm font-medium text-gray-800">{LESSON_TYPE_NAMES[type]}</label>
              <div className="relative w-28">
                <input
                  id={`count-${type}`}
                  type="number"
                  value={counts[type] === 0 ? '' : counts[type]}
                  onChange={e => handleCountChange(type, e.target.value)}
                  className="w-full bg-gray-100 text-gray-800 text-right pr-8 py-2 rounded-md border border-gray-200 focus:ring-[#ff5710] focus:border-[#ff5710] text-sm"
                  placeholder="0"
                />
                 <span className="absolute inset-y-0 right-3 flex items-center text-sm text-gray-500 pointer-events-none">개</span>
              </div>
            </div>
          ))}
        </div>
      </main>
      
      <footer className="flex-shrink-0 p-4 bg-white border-t space-y-3">
        <div className="flex justify-between items-center text-lg">
          <span className="font-medium text-gray-600">합계</span>
          <span className="font-bold text-[#ff5710]">{totalRevenue.toLocaleString('ko-KR')}원</span>
        </div>
        <button onClick={handleSave} className="w-full bg-[#ff5710] text-white font-bold py-3 rounded-lg hover:bg-[#e64e0e] transition-colors">
          저장하기
        </button>
      </footer>
    </div>
  );
};

export default RevenueEntry;
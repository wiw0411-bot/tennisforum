import React, { useState, useEffect } from 'react';
import { PROVINCES, LOCATIONS } from '../data/locations';
import XIcon from './icons/XIcon';
import ChevronRightIcon from './icons/ChevronRightIcon';
import ChevronLeftIcon from './icons/ChevronLeftIcon';

interface LocationSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (location: string) => void;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({ isOpen, onClose, onSelect }) => {
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);

  useEffect(() => {
    // Reset state when modal is closed
    if (!isOpen) {
      setSelectedProvince(null);
    }
  }, [isOpen]);

  const handleProvinceSelect = (province: string) => {
    setSelectedProvince(province);
  };
  
  const handleCitySelect = (city: string) => {
    if (selectedProvince === '세종특별자치시' && city === '세종시') {
      onSelect('세종특별자치시');
    } else {
      onSelect(`${selectedProvince} ${city}`);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-xs h-3/4 flex flex-col" onClick={e => e.stopPropagation()}>
        <header className="relative flex items-center justify-center p-4 border-b flex-shrink-0">
          {selectedProvince && (
            <button
              onClick={() => setSelectedProvince(null)}
              className="absolute left-4 p-2 -ml-2 text-gray-500 hover:text-gray-800"
              aria-label="뒤로가기"
            >
              <ChevronLeftIcon />
            </button>
          )}
          <h2 className="text-lg font-bold text-gray-900">{selectedProvince || '지역 선택'}</h2>
          <button onClick={onClose} className="absolute right-4 p-2 -mr-2 text-gray-500 hover:text-gray-800">
            <XIcon />
          </button>
        </header>
        
        <main className="flex-grow overflow-y-auto hide-scrollbar">
          {!selectedProvince ? (
            <ul>
              {PROVINCES.map((province) => (
                <li key={province}>
                  <button
                    onClick={() => handleProvinceSelect(province)}
                    className="w-full text-left px-4 py-3 text-sm flex justify-between items-center text-gray-800 hover:bg-gray-50 transition-colors"
                  >
                    <span>{province}</span>
                    <ChevronRightIcon />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <ul>
              {/* Option to select the whole province */}
              <li key={`${selectedProvince}-all`}>
                <button
                    onClick={() => onSelect(`${selectedProvince} 전체`)}
                    className="w-full text-left px-4 py-3 text-sm font-bold text-[#ff5710] hover:bg-gray-50 transition-colors"
                >
                    {selectedProvince} 전체
                </button>
              </li>
              {(LOCATIONS[selectedProvince] || []).map((city) => (
                <li key={city}>
                  <button
                    onClick={() => handleCitySelect(city)}
                    className="w-full text-left px-4 py-3 text-sm text-gray-800 hover:bg-gray-50 transition-colors"
                  >
                    {city}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </main>
      </div>
    </div>
  );
};

// FIX: Added default export for the component.
export default LocationSelector;
import React from 'react';
import { LocationRateProfile } from '../types';
import XIcon from './icons/XIcon';
import PlusIcon from './icons/PlusIcon';
import PencilSquareIcon from './icons/PencilSquareIcon';
import TrashIcon from './icons/TrashIcon';


interface LocationSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  locations: LocationRateProfile[];
  onSelectLocation: (locationId: string) => void;
  onAddNewLocation: () => void;
  onEditLocation: (locationId: string) => void;
  onDeleteLocation: (locationId: string) => void;
}

const LocationSelectorModal: React.FC<LocationSelectorModalProps> = ({
  isOpen,
  onClose,
  locations,
  onSelectLocation,
  onAddNewLocation,
  onEditLocation,
  onDeleteLocation,
}) => {
  if (!isOpen) return null;
  
  const handleEditClick = (e: React.MouseEvent, locationId: string) => {
    e.stopPropagation();
    onEditLocation(locationId);
  };

  const handleDeleteClick = (e: React.MouseEvent, locationId: string) => {
    e.stopPropagation();
    onDeleteLocation(locationId);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-30 flex items-end" onClick={onClose}>
      <div 
        className="bg-white w-full rounded-t-2xl max-w-xs mx-auto transform transition-transform duration-300 translate-y-0 mb-16" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-bold">지점 선택</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 p-1">
            <XIcon />
          </button>
        </div>
        <div className="p-4 max-h-64 overflow-y-auto bg-gray-50">
          {locations.length > 0 ? (
            <ul className="space-y-2">
              {locations.map(loc => (
                <li key={loc.id} onClick={() => onSelectLocation(loc.id)} className="bg-white rounded-lg p-3 pr-2 cursor-pointer border border-gray-200 shadow-sm hover:shadow-md hover:border-[#ff5710] transition-all flex justify-between items-center">
                  <span className="font-bold text-base text-gray-800">{loc.name}</span>
                  <div className="flex items-center space-x-1">
                    <button onClick={(e) => handleEditClick(e, loc.id)} className="p-2 text-gray-400 hover:text-blue-500 rounded-full hover:bg-gray-100">
                        <PencilSquareIcon/>
                    </button>
                    <button onClick={(e) => handleDeleteClick(e, loc.id)} className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100">
                        <TrashIcon/>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8">
                <p className="text-sm text-gray-500">등록된 지점이 없습니다.</p>
                <p className="text-xs text-gray-400 mt-1">아래 버튼을 눌러 새 지점을 등록해주세요.</p>
            </div>
          )}
        </div>
        <div className="p-4 border-t bg-gray-50 rounded-b-2xl">
          <button onClick={onAddNewLocation} className="w-full flex items-center justify-center bg-white text-gray-800 font-bold py-3 rounded-lg hover:bg-gray-100 border border-gray-200 shadow-sm">
            <PlusIcon />
            <span className="ml-2 text-sm">새 지점 등록</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationSelectorModal;
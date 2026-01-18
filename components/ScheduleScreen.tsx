import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { User, LocationRateProfile, RevenueData, DailyRevenue, NotesData, DailyNote, NoteType, NOTE_TYPES, NOTE_TYPE_NAMES } from '../types';
import LessonRateSetup from './LessonRateSetup';
import RevenueEntry from './RevenueEntry';
import LocationSelectorModal from './LocationSelectorModal';
import PencilSquareIcon from './icons/PencilSquareIcon';
import TrashIcon from './icons/TrashIcon';
import { isHoliday } from '../data/holidays';
import { db } from '../firebase';
// FIX: The project seems to be using Firebase v8 SDK.
// Removed v9 modular imports and will use v8 namespaced API.

interface ScheduleScreenProps {
  currentUser: User | null;
}

const ScheduleScreen: React.FC<ScheduleScreenProps> = ({ currentUser }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(new Date().getDate());

  useEffect(() => {
    const today = new Date();
    if (
        currentDate.getFullYear() === today.getFullYear() &&
        currentDate.getMonth() === today.getMonth() &&
        selectedDay === null
    ) {
        setSelectedDay(today.getDate());
    }
  }, [currentDate, selectedDay]);

  const [locationProfiles, setLocationProfiles] = useState<LocationRateProfile[]>([]);
  const [revenues, setRevenues] = useState<RevenueData>({});
  const [notes, setNotes] = useState<NotesData>({});
  const [isLoading, setIsLoading] = useState(true);
  
  const [isRateSetupVisible, setIsRateSetupVisible] = useState(false);
  const [isRevenueEntryVisible, setIsRevenueEntryVisible] = useState(false);
  const [isLocationSelectorVisible, setIsLocationSelectorVisible] = useState(false);
  const [selectedLocationIdForEntry, setSelectedLocationIdForEntry] = useState<string | null>(null);
  const [profileToEdit, setProfileToEdit] = useState<LocationRateProfile | null>(null);
  
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [currentNote, setCurrentNote] = useState<{id: string | null, type: NoteType, memo: string}>({ id: null, type: 'work', memo: '' });

  useEffect(() => {
    if (!currentUser) {
      setLocationProfiles([]);
      setRevenues({});
      setNotes({});
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [profilesSnapshot, revenuesSnapshot, notesSnapshot] = await Promise.all([
          // FIX: Use v8 collection/get syntax
          db.collection(`users/${currentUser.id}/rateProfiles`).get(),
          db.collection(`users/${currentUser.id}/revenues`).get(),
          db.collection(`users/${currentUser.id}/notes`).get()
        ]);

        const profiles = profilesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LocationRateProfile));
        setLocationProfiles(profiles);

        const revenueData: RevenueData = {};
        revenuesSnapshot.forEach(doc => {
          revenueData[doc.id] = doc.data().entries as DailyRevenue[];
        });
        setRevenues(revenueData);

        const notesData: NotesData = {};
        notesSnapshot.forEach(doc => {
          notesData[doc.id] = doc.data().entries as DailyNote[];
        });
        setNotes(notesData);

      } catch (error) {
        console.error("Error fetching schedule data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentUser]);

  const selectedDateObj = useMemo(() => {
    if (selectedDay !== null) {
      return new Date(currentDate.getFullYear(), currentDate.getMonth(), selectedDay);
    }
    return null;
  }, [currentDate, selectedDay]);
  
  const dateKeyForSelectedDay = useMemo(() => {
    if (!selectedDateObj) return '';
    return `${selectedDateObj.getFullYear()}-${(selectedDateObj.getMonth() + 1).toString().padStart(2, '0')}-${selectedDateObj.getDate().toString().padStart(2, '0')}`;
  }, [selectedDateObj]);
  
  const notesForDay = useMemo(() => notes[dateKeyForSelectedDay] || [], [notes, dateKeyForSelectedDay]);
  
  useEffect(() => {
    setIsEditingNote(false);
  }, [selectedDay, currentDate]);

  const handleAddNoteClick = () => {
    setCurrentNote({ id: null, type: 'work', memo: '' });
    setIsEditingNote(true);
  };
  
  const handleEditNoteClick = (note: DailyNote) => {
    setCurrentNote(note);
    setIsEditingNote(true);
  };
  
  const handleSaveNote = async () => {
    if (!dateKeyForSelectedDay || !currentUser || !currentNote.memo.trim()) return;
    
    let updatedNotesForDay = [...notesForDay];

    if (currentNote.id) { // Editing existing note
      updatedNotesForDay = updatedNotesForDay.map(n => n.id === currentNote.id ? { ...n, type: currentNote.type, memo: currentNote.memo } : n);
    } else { // Adding new note
      const newNote: DailyNote = {
        id: `note-${Date.now()}`,
        type: currentNote.type,
        memo: currentNote.memo,
      };
      updatedNotesForDay.push(newNote);
    }

    try {
        // FIX: Use v8 doc/set syntax
        const noteRef = db.collection(`users/${currentUser.id}/notes`).doc(dateKeyForSelectedDay);
        await noteRef.set({ entries: updatedNotesForDay });
        setNotes(prev => ({ ...prev, [dateKeyForSelectedDay]: updatedNotesForDay }));
        setIsEditingNote(false);
    } catch (error) {
        console.error("Error saving note:", error);
        alert("메모 저장에 실패했습니다.");
    }
  };

  const handleDeleteNote = async (noteIdToDelete: string) => {
    if (!dateKeyForSelectedDay || !currentUser) return;
    if (window.confirm('정말 이 메모를 삭제하시겠습니까?')) {
        const updatedNotesForDay = notesForDay.filter(n => n.id !== noteIdToDelete);
        // FIX: Use v8 doc syntax
        const noteRef = db.collection(`users/${currentUser.id}/notes`).doc(dateKeyForSelectedDay);
        
        try {
            if (updatedNotesForDay.length === 0) {
                // FIX: Use v8 delete syntax
                await noteRef.delete();
                setNotes(prev => {
                    const newNotes = {...prev};
                    delete newNotes[dateKeyForSelectedDay];
                    return newNotes;
                });
            } else {
                // FIX: Use v8 set syntax
                await noteRef.set({ entries: updatedNotesForDay });
                setNotes(prev => ({...prev, [dateKeyForSelectedDay]: updatedNotesForDay }));
            }
        } catch (error) {
            console.error("Error deleting note:", error);
            alert("메모 삭제에 실패했습니다.");
        }
    }
  };


  const revenuesForSelectedDay = revenues[dateKeyForSelectedDay] || [];
  const totalRevenueForDay = useMemo(() => revenuesForSelectedDay.reduce((sum, rev) => sum + rev.total, 0), [revenuesForSelectedDay]);

  const handleSaveRateProfile = async (profileData: Omit<LocationRateProfile, 'id'>) => {
    if (!currentUser) return;

    try {
        if (profileToEdit) { // Editing existing profile
            // FIX: Use v8 doc/update syntax
            const profileRef = db.collection(`users/${currentUser.id}/rateProfiles`).doc(profileToEdit.id);
            await profileRef.update(profileData);
            setLocationProfiles(prev => prev.map(p => p.id === profileToEdit.id ? { ...p, ...profileData } : p));
        } else { // Adding new profile
            // FIX: Use v8 collection/add syntax
            const profilesCollection = db.collection(`users/${currentUser.id}/rateProfiles`);
            const docRef = await profilesCollection.add(profileData);
            const newProfile = { id: docRef.id, ...profileData };
            setLocationProfiles(prev => [...prev, newProfile]);
        }
        setProfileToEdit(null);
        setIsRateSetupVisible(false);
    } catch (error) {
        console.error("Error saving rate profile:", error);
        alert("지점 정보 저장에 실패했습니다.");
    }
  };

  const handleDeleteRateProfile = async (profileId: string) => {
    if (!currentUser) return;
    if (window.confirm('정말로 이 지점을 삭제하시겠습니까? 모든 관련 수익 데이터도 삭제될 수 있습니다.')) {
        try {
            // FIX: Use v8 doc/delete syntax
            const profileRef = db.collection(`users/${currentUser.id}/rateProfiles`).doc(profileId);
            await profileRef.delete();
            setLocationProfiles(prev => prev.filter(p => p.id !== profileId));
        } catch (error) {
            console.error("Error deleting rate profile:", error);
            alert("지점 정보 삭제에 실패했습니다.");
        }
    }
  };

  const handleSaveRevenue = async (dateKey: string, revenueData: DailyRevenue) => {
    if (!currentUser) return;

    const existingRevenues = revenues[dateKey] || [];
    const updatedRevenues = [...existingRevenues.filter(r => r.locationId !== revenueData.locationId), revenueData];
    
    try {
        // FIX: Use v8 doc/set syntax
        const revenueRef = db.collection(`users/${currentUser.id}/revenues`).doc(dateKey);
        await revenueRef.set({ entries: updatedRevenues });
        setRevenues(prev => ({...prev, [dateKey]: updatedRevenues }));
        setIsRevenueEntryVisible(false);
        setSelectedLocationIdForEntry(null);
    } catch (error) {
        console.error("Error saving revenue:", error);
        alert("수익 정보 저장에 실패했습니다.");
    }
  };

  const handleDeleteRevenueForLocation = async (locationId: string) => {
    if (!dateKeyForSelectedDay || !currentUser) return;
    if (window.confirm('정말 이 지점의 수익 기록을 삭제하시겠습니까?')) {
        const updatedRevenues = (revenues[dateKeyForSelectedDay] || []).filter(r => r.locationId !== locationId);
        // FIX: Use v8 doc syntax
        const revenueRef = db.collection(`users/${currentUser.id}/revenues`).doc(dateKeyForSelectedDay);
        
        try {
            if (updatedRevenues.length === 0) {
                // FIX: Use v8 delete syntax
                await revenueRef.delete();
                setRevenues(prev => {
                    const newRevs = {...prev};
                    delete newRevs[dateKeyForSelectedDay];
                    return newRevs;
                });
            } else {
                // FIX: Use v8 set syntax
                await revenueRef.set({ entries: updatedRevenues });
                setRevenues(prev => ({...prev, [dateKeyForSelectedDay]: updatedRevenues }));
            }
        } catch (error) {
            console.error("Error deleting revenue:", error);
            alert("수익 기록 삭제에 실패했습니다.");
        }
    }
  };

  const monthStartDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const monthEndDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const startDay = monthStartDate.getDay(); // 0 for Sunday
  const daysInMonth = monthEndDate.getDate();

  const totalRevenueForMonth = useMemo(() => {
    const monthKey = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}`;
    return Object.entries(revenues)
      .filter(([date]) => date.startsWith(monthKey))
      // FIX: Ensure dailyRevs is an array before calling reduce to prevent runtime errors with malformed data.
      .reduce((total, [, dailyRevs]) => total + (Array.isArray(dailyRevs) ? dailyRevs.reduce((dailyTotal, rev) => dailyTotal + rev.total, 0) : 0), 0);
  }, [revenues, currentDate]);

  const changeMonth = (delta: number) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(1); // Avoid issues with different month lengths
      newDate.setMonth(newDate.getMonth() + delta);
      return newDate;
    });
    setSelectedDay(null);
  };
  
  const handleEditLocation = useCallback((locationId: string) => {
    const profile = locationProfiles.find(p => p.id === locationId);
    if (profile) {
      setProfileToEdit(profile);
      setIsLocationSelectorVisible(false);
      setIsRateSetupVisible(true);
    }
  }, [locationProfiles]);
  
  const selectedProfileForEntry = useMemo(() => {
      return locationProfiles.find(p => p.id === selectedLocationIdForEntry);
  }, [locationProfiles, selectedLocationIdForEntry]);
  
  const existingRevenueForEntry = useMemo(() => {
    if (!selectedLocationIdForEntry || !selectedDay) return null;
    const dateKey = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${selectedDay.toString().padStart(2, '0')}`;
    return (revenues[dateKey] || []).find(r => r.locationId === selectedLocationIdForEntry) || null;
  }, [revenues, selectedDay, currentDate, selectedLocationIdForEntry]);
  
  const renderCalendar = () => {
    const calendarDays = [];
    // empty cells for start of month
    for (let i = 0; i < startDay; i++) {
      calendarDays.push(<div key={`empty-${i}`} className="h-20"></div>);
    }
    // cells for each day
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dateKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      const dayOfWeek = date.getDay();
      const isToday = new Date().toDateString() === date.toDateString();
      const isSelected = selectedDay === day;
      const holiday = isHoliday(date.getFullYear(), date.getMonth() + 1, day);

      let textColor = 'text-gray-800';
      if (dayOfWeek === 0 || holiday) textColor = 'text-red-500';
      if (dayOfWeek === 6) textColor = 'text-blue-500';

      const dailyTotal = (revenues[dateKey] || []).reduce((sum, r) => sum + r.total, 0);
      const hasNote = (notes[dateKey] || []).length > 0;

      calendarDays.push(
        <div key={day} onClick={() => setSelectedDay(day)} className={`relative p-2 h-20 border-t border-l cursor-pointer transition-colors ${isSelected ? 'bg-[#ff5710]/10' : 'bg-white hover:bg-gray-50'}`}>
          <span className={`text-sm font-semibold ${isToday ? 'bg-[#ff5710] text-white rounded-full w-6 h-6 flex items-center justify-center' : textColor}`}>{day}</span>
          {dailyTotal > 0 && (
            <p className="text-[10px] text-blue-600 font-bold mt-1 truncate">
              {dailyTotal.toLocaleString('ko-KR')}
            </p>
          )}
          {hasNote && <div className="absolute bottom-2 right-2 w-1.5 h-1.5 bg-green-500 rounded-full"></div>}
        </div>
      );
    }
    return calendarDays;
  };

  if (isLoading) {
    return (
      <div className="animate-fade-in h-full flex items-center justify-center bg-gray-50">
          <p className="text-gray-500">스케줄 데이터를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in h-full flex flex-col">
      <header className="bg-white sticky top-0 z-10 p-4 border-b flex items-center justify-center h-16 flex-shrink-0">
        <h1 className="text-lg font-bold text-gray-900">스케줄</h1>
      </header>
      <main className="flex-grow bg-gray-50 overflow-y-auto hide-scrollbar pb-16">
        <div className="p-4 bg-white">
          <div className="flex justify-between items-center mb-4">
            <button onClick={() => changeMonth(-1)} className="p-2 text-gray-600">&lt;</button>
            <h2 className="text-lg font-bold text-gray-800">{currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월</h2>
            <button onClick={() => changeMonth(1)} className="p-2 text-gray-600">&gt;</button>
          </div>
          <div className="grid grid-cols-7 text-center text-xs text-gray-500 mb-2">
            {['일', '월', '화', '수', '목', '금', '토'].map(day => <div key={day}>{day}</div>)}
          </div>
          <div className="grid grid-cols-7 border-r border-b">{renderCalendar()}</div>
        </div>
        
        {selectedDay && selectedDateObj && (
          <div className="p-4 mt-2 space-y-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-bold text-gray-800">월간 합계</h3>
                <span className="font-bold text-lg text-[#ff5710]">{totalRevenueForMonth.toLocaleString('ko-KR')}원</span>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-base font-bold text-gray-800">
                      {selectedDateObj.getMonth() + 1}월 {selectedDay}일 수익
                      {totalRevenueForDay > 0 && <span className="text-sm font-semibold text-blue-600 ml-2">({totalRevenueForDay.toLocaleString('ko-KR')}원)</span>}
                    </h3>
                    <button onClick={() => setIsLocationSelectorVisible(true)} className="px-3 py-1 bg-[#ff5710] text-white text-xs font-bold rounded-full">수익 등록</button>
                </div>
                {revenuesForSelectedDay.length > 0 ? (
                  <ul className="space-y-2">
                    {revenuesForSelectedDay.map(rev => (
                      <li key={rev.locationId} className="flex justify-between items-center p-2 rounded-lg bg-gray-50">
                        <span className="text-sm font-medium text-gray-700">{rev.locationName}</span>
                        <div className="flex items-center space-x-2">
                           <span className="text-sm font-bold text-gray-800">{rev.total.toLocaleString('ko-KR')}원</span>
                           <button onClick={() => handleDeleteRevenueForLocation(rev.locationId)} className="text-gray-400 hover:text-red-500"><TrashIcon /></button>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : <p className="text-sm text-center text-gray-500 py-4">등록된 수익이 없습니다.</p>}
            </div>

             <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-base font-bold text-gray-800">{selectedDateObj.getMonth() + 1}월 {selectedDay}일 메모</h3>
                    {!isEditingNote && <button onClick={handleAddNoteClick} className="px-3 py-1 bg-[#ff5710] text-white text-xs font-bold rounded-full">메모 추가</button>}
                </div>
                {isEditingNote ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-center space-x-1">
                      {NOTE_TYPES.map(type => (
                          <button key={type} onClick={() => setCurrentNote(prev => ({...prev, type}))} className={`px-3 py-1.5 text-xs rounded-full border ${currentNote.type === type ? 'bg-[#ff5710] text-white font-semibold border-[#ff5710]' : 'bg-white text-gray-600'}`}>{NOTE_TYPE_NAMES[type]}</button>
                      ))}
                    </div>
                    <textarea value={currentNote.memo} onChange={e => setCurrentNote(prev => ({...prev, memo: e.target.value}))} className="w-full bg-gray-100 p-2 rounded-md border text-sm" rows={3} placeholder="메모 내용 입력..."></textarea>
                    <div className="flex justify-end space-x-2">
                       <button onClick={() => setIsEditingNote(false)} className="px-4 py-1.5 bg-gray-200 text-gray-800 text-xs font-semibold rounded-md">취소</button>
                       <button onClick={handleSaveNote} className="px-4 py-1.5 bg-blue-500 text-white text-xs font-semibold rounded-md">저장</button>
                    </div>
                  </div>
                ) : (
                    notesForDay.length > 0 ? (
                        <ul className="space-y-2">
                            {notesForDay.map(note => (
                                <li key={note.id} className="p-2 rounded-lg bg-gray-50 flex justify-between items-start">
                                    <div>
                                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full text-white ${
                                            note.type === 'work' ? 'bg-blue-500' :
                                            note.type === 'noShow' ? 'bg-red-500' :
                                            note.type === 'makeupClass' ? 'bg-green-500' : 'bg-purple-500'
                                        }`}>{NOTE_TYPE_NAMES[note.type]}</span>
                                        <p className="text-sm text-gray-700 mt-1.5 whitespace-pre-wrap">{note.memo}</p>
                                    </div>
                                    <div className="flex flex-col items-center space-y-1 flex-shrink-0 ml-2">
                                        <button onClick={() => handleEditNoteClick(note)} className="text-gray-400 hover:text-blue-500 p-1"><PencilSquareIcon/></button>
                                        <button onClick={() => handleDeleteNote(note.id)} className="text-gray-400 hover:text-red-500 p-1"><TrashIcon/></button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : <p className="text-sm text-center text-gray-500 py-4">등록된 메모가 없습니다.</p>
                )}
            </div>
          </div>
        )}
      </main>

      {isLocationSelectorVisible && (
        <LocationSelectorModal
          isOpen={isLocationSelectorVisible}
          onClose={() => setIsLocationSelectorVisible(false)}
          locations={locationProfiles}
          onSelectLocation={(locId) => {
            setSelectedLocationIdForEntry(locId);
            setIsLocationSelectorVisible(false);
            setIsRevenueEntryVisible(true);
          }}
          onAddNewLocation={() => {
            setProfileToEdit(null);
            setIsLocationSelectorVisible(false);
            setIsRateSetupVisible(true);
          }}
          onEditLocation={handleEditLocation}
          onDeleteLocation={handleDeleteRateProfile}
        />
      )}

      {isRateSetupVisible && (
        <LessonRateSetup
          onSave={handleSaveRateProfile}
          onCancel={() => { setIsRateSetupVisible(false); setProfileToEdit(null); }}
          existingProfile={profileToEdit}
        />
      )}
      
      {isRevenueEntryVisible && selectedProfileForEntry && selectedDateObj && (
        <RevenueEntry 
          selectedDate={selectedDateObj}
          locationProfile={selectedProfileForEntry}
          existingData={existingRevenueForEntry}
          onSave={handleSaveRevenue}
          onCancel={() => setIsRevenueEntryVisible(false)}
        />
      )}
    </div>
  );
};

export default ScheduleScreen;
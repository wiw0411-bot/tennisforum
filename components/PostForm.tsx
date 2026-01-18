import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Post, Category, FreeBoardSubCategory } from '../types';
import { CATEGORIES } from '../constants';
import LocationSelector from './LocationSelector';
import ChevronRightIcon from './icons/ChevronRightIcon';
import ImageIcon from './icons/ImageIcon';
import PaperClipIcon from './icons/PaperClipIcon';
import XIcon from './icons/XIcon';
import ArrowLeftIcon from './icons/ArrowLeftIcon';
import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

type NewPostData = Omit<Post, 'id' | 'createdAt' | 'views'>;

interface PostFormProps {
  onSubmit: (post: NewPostData) => void;
  onCancel: () => void;
  activeCategory: Category;
  postToEdit?: Post | null;
}

const jobSeekingContentTemplate = `입상경력:\n기타사항:\n\n연락처: `;
const jobPostingContentTemplate = `-담당업무:\n-필요한자격:\n-기타 안내사항:\n\n연락처: `;
const courtTransferContentTemplate = `상세 내용을 입력해주세요.\n기타사항:\n\n연락처: `;
const defaultContentTemplate = `상세 내용을 입력해주세요.`;

const getInitialContent = (cat: Category) => {
    if (cat === Category.JOB_SEEKING) return jobSeekingContentTemplate;
    if (cat === Category.JOB_POSTING) return jobPostingContentTemplate;
    if (cat === Category.COURT_TRANSFER) return courtTransferContentTemplate;
    return defaultContentTemplate;
}


const PostForm: React.FC<PostFormProps> = ({ onSubmit, onCancel, activeCategory, postToEdit }) => {
  const isEditing = !!postToEdit;
  
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isRepImageUploading, setIsRepImageUploading] = useState(false);
  const [category, setCategory] = useState<Category>(activeCategory);
  const [content, setContent] = useState(getInitialContent(category));
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Free Board state
  const [subCategory, setSubCategory] = useState<FreeBoardSubCategory | null>(null);

  // Job Posting / Seeking state
  const [recruitmentField, setRecruitmentField] = useState<'테니스' | '피클볼' | null>(null);

  // Job Seeking states
  const [field, setField] = useState<'테니스' | '소프트테니스' | '동호인' | null>(null);
  const [playerCareer, setPlayerCareer] = useState('');
  const [hasLessonCareer, setHasLessonCareer] = useState<boolean | null>(null);
  const [lessonCareer, setLessonCareer] = useState('');
  const [memberManagementSkill, setMemberManagementSkill] = useState<'상' | '중' | '하' | null>(null);
  const [counselingSkill, setCounselingSkill] = useState<'가능' | '불가능' | null>(null);

  const [workingType, setWorkingType] = useState<Post['workingType'] | null>(null);
  const [workingDays, setWorkingDays] = useState<string[]>([]);
  const [isDaysNegotiable, setIsDaysNegotiable] = useState(false);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('18:00');
  const [isTimeNegotiable, setIsTimeNegotiable] = useState(false);
  const [salaryType, setSalaryType] = useState<'월급' | '시급' | '비율'>('월급');
  const [salaryAmount, setSalaryAmount] = useState('');
  const [isSalaryNegotiable, setIsSalaryNegotiable] = useState(false);
  
  // Court Transfer states
  const [courtType, setCourtType] = useState<Post['courtType'] | null>(null);
  const [fullCourtCount, setFullCourtCount] = useState('');
  const [halfCourtCount, setHalfCourtCount] = useState('');
  const [ballMachineCount, setBallMachineCount] = useState('');
  const [premiumAmount, setPremiumAmount] = useState('');
  const [isPremiumNegotiable, setIsPremiumNegotiable] = useState(false);
  const [isPremiumFree, setIsPremiumFree] = useState(false);
  const [area, setArea] = useState('');
  const [monthlyRent, setMonthlyRent] = useState('');
  const [maintenanceFee, setMaintenanceFee] = useState('');
  const [isMaintenanceFeePrivate, setIsMaintenanceFeePrivate] = useState(false);
  const [activeMembers, setActiveMembers] = useState('');
  const [isActiveMembersPrivate, setIsActiveMembersPrivate] = useState(false);
  const [averageRevenue, setAverageRevenue] = useState('');
  const [isAverageRevenuePrivate, setIsAverageRevenuePrivate] = useState(false);


  const [commentsAllowed, setCommentsAllowed] = useState(true);
  const [consentChecked, setConsentChecked] = useState(false);
  
  // Content images state
  const [contentImages, setContentImages] = useState<string[]>([]);
  const [isContentImageUploading, setIsContentImageUploading] = useState(false);
  const contentFileInputRef = useRef<HTMLInputElement>(null);
  
  const isJobPosting = category === Category.JOB_POSTING;
  const isJobSeeking = category === Category.JOB_SEEKING;
  const isJobRelated = isJobPosting || isJobSeeking;
  const isCourtTransfer = category === Category.COURT_TRANSFER;
  const isFreeBoard = category === Category.FREE_BOARD;
  
  useEffect(() => {
    if (!isEditing) {
        setContent(getInitialContent(category));
    }
  }, [category, isEditing]);

  useEffect(() => {
    if (!isEditing || !postToEdit) return;

    const parseAmount = (str: string | undefined, unit: string) => str ? str.replace(unit, '').replace(/,/g, '').trim() : '';
    const parseAmountWithSuffix = (str: string | undefined, unit: string) => str ? str.replace(unit, '').replace(/~/g, '').replace(/,/g, '').trim() : '';
    
    setTitle(postToEdit.title || '');
    setLocation(postToEdit.location || '');
    setImageUrl(postToEdit.imageUrl || null);
    setCategory(postToEdit.category);
    setContent(postToEdit.content || '');
    setContentImages(postToEdit.contentImages || []);
    setCommentsAllowed(postToEdit.commentsAllowed);
    setRecruitmentField(postToEdit.recruitmentField || null);
    setWorkingType(postToEdit.workingType || null);

    if (postToEdit.workingHours === '시간 협의') {
        setIsTimeNegotiable(true);
    } else if (postToEdit.workingHours) {
        const [start, end] = postToEdit.workingHours.split('~').map(s => s.trim());
        setStartTime(start || '09:00');
        setEndTime(end || '18:00');
        setIsTimeNegotiable(false);
    }

    if (postToEdit.workingDays?.includes('요일 협의')) {
        setIsDaysNegotiable(true);
        setWorkingDays([]);
    } else {
        setWorkingDays(postToEdit.workingDays || []);
        setIsDaysNegotiable(false);
    }
    
    if (postToEdit.salary === '급여 협의') {
        setIsSalaryNegotiable(true);
    } else if (postToEdit.salary) {
        const parts = postToEdit.salary.split(' ');
        const type = parts[0] as '월급' | '시급' | '비율';
        if (['월급', '시급', '비율'].includes(type)) {
            setSalaryType(type);
            const unit = type === '월급' ? '만원' : type === '시급' ? '원' : '';
            const amountStr = parts.slice(1).join('');
            setSalaryAmount(parseAmountWithSuffix(amountStr, unit));
        }
        setIsSalaryNegotiable(false);
    }

    setField(postToEdit.field || null);
    setPlayerCareer(postToEdit.playerCareer || '');
    setHasLessonCareer(postToEdit.hasLessonCareer ?? null);
    setLessonCareer(postToEdit.lessonCareer || '');
    setMemberManagementSkill(postToEdit.memberManagementSkill || null);
    setCounselingSkill(postToEdit.counselingSkill || null);
    
    setCourtType(postToEdit.courtType || null);
    setFullCourtCount(String(postToEdit.fullCourtCount || ''));
    setHalfCourtCount(String(postToEdit.halfCourtCount || ''));
    setBallMachineCount(String(postToEdit.ballMachineCount || ''));
    setArea(parseAmount(postToEdit.area, '평'));
    setMonthlyRent(parseAmount(postToEdit.monthlyRent, '만원'));

    if (postToEdit.premium === '무권리') { setIsPremiumFree(true); }
    else if (postToEdit.premium === '권리금 협의') { setIsPremiumNegotiable(true); }
    else { setPremiumAmount(parseAmount(postToEdit.premium, '만원')); }

    if (postToEdit.maintenanceFee === '비공개') { setIsMaintenanceFeePrivate(true); }
    else { setMaintenanceFee(parseAmount(postToEdit.maintenanceFee, '만원')); }

    if (postToEdit.activeMembers === '비공개') { setIsActiveMembersPrivate(true); }
    else { setActiveMembers(parseAmount(postToEdit.activeMembers, '명')); }

    if (postToEdit.averageRevenue === '비공개') { setIsAverageRevenuePrivate(true); }
    else { setAverageRevenue(parseAmount(postToEdit.averageRevenue, '만원')); }

    setSubCategory(postToEdit.subCategory || null);

  }, [isEditing, postToEdit]);


  const handleRepImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsRepImageUploading(true);
      try {
        const storageRef = ref(storage, `posts/rep/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);
        setImageUrl(downloadURL);
      } catch (error: any) {
        console.error("Representative image upload failed:", error);
        alert("대표 이미지 업로드에 실패했습니다.");
      } finally {
        setIsRepImageUploading(false);
      }
    }
  };
  
  const handleContentImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsContentImageUploading(true);
      try {
        const uploadPromises = Array.from(e.target.files).map(async (file) => {
          const storageRef = ref(storage, `posts/content/${Date.now()}_${file.name}`);
          await uploadBytes(storageRef, file);
          return getDownloadURL(storageRef);
        });
        const urls = await Promise.all(uploadPromises);
        setContentImages(prev => [...prev, ...urls]);
      } catch (error) {
        console.error("Content images upload failed:", error);
        alert("본문 이미지 업로드에 실패했습니다.");
      } finally {
        setIsContentImageUploading(false);
      }
    }
  };

  const removeContentImage = (index: number) => {
    setContentImages(prev => prev.filter((_, i) => i !== index));
  };


  const handleDayToggle = (day: string) => {
    setWorkingDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleSalaryNegotiableChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setIsSalaryNegotiable(checked);
    if (checked) {
      setSalaryAmount('');
    }
  };
  
  const handleSalaryAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    if (salaryType === '월급' || salaryType === '시급') {
      const onlyNums = value.replace(/[^0-9]/g, '');
      setSalaryAmount(onlyNums);
    } else {
      setSalaryAmount(value);
    }
  };

  const handlePremiumNegotiableChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setIsPremiumNegotiable(checked);
    if (checked) {
        setIsPremiumFree(false);
        setPremiumAmount('');
    }
  };

  const handlePremiumFreeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const checked = e.target.checked;
      setIsPremiumFree(checked);
      if (checked) {
          setIsPremiumNegotiable(false);
          setPremiumAmount('');
      }
  };
  
  const formattedSalaryAmount = useMemo(() => {
    if ((salaryType === '월급' || salaryType === '시급') && salaryAmount) {
        const num = parseInt(salaryAmount, 10);
        if (!isNaN(num)) {
            return num.toLocaleString('ko-KR');
        }
    }
    return salaryAmount;
  }, [salaryAmount, salaryType]);

  const handleRegister = () => {
    if (isJobRelated && !recruitmentField) {
        alert('모집분야를 선택해주세요.');
        return;
    }
    if (isJobPosting) {
        if (!title.trim()) {
            alert('테니스장명을 입력해주세요.');
            return;
        }
    }

    if (isJobSeeking) {
        if (!field || !playerCareer) {
            alert('필수 경력 정보를 입력해주세요.');
            return;
        }
    } else if (isCourtTransfer) {
        if (!location.trim() || !courtType) {
            alert('필수 항목(지역, 시설 종류)을 입력해주세요.');
            return;
        }
    } else if (isFreeBoard) {
        if (!title.trim() || !subCategory) {
            alert('필수 항목(말머리, 제목)을 입력해주세요.');
            return;
        }
    } else if (!location.trim() || !title.trim()) {
        alert('필수 항목(지역, 제목)을 입력해주세요.');
        return;
    }
    
    let postData: Partial<NewPostData> = { category, location, content, contentImages, commentsAllowed };
    if (isFreeBoard) {
        postData.location = '';
    }

    if (isJobSeeking) {
        let generatedTitle = `[${field}] 선수 ${playerCareer}년`;
        if (hasLessonCareer && lessonCareer) {
            generatedTitle += `, 레슨 ${lessonCareer}년이상`;
        }
        generatedTitle += ' 코치 구직';

        postData.title = generatedTitle;
        postData.field = field!;
        postData.playerCareer = playerCareer;
        postData.hasLessonCareer = hasLessonCareer ?? false;
        postData.lessonCareer = hasLessonCareer ? lessonCareer : undefined;
        postData.memberManagementSkill = memberManagementSkill!;
        postData.counselingSkill = counselingSkill!;
    } else if (isCourtTransfer) {
        postData.title = `[${location}] ${courtType} 테니스장 양도`;
    } else {
        postData.title = title;
    }


    if (isJobRelated) {
      postData.recruitmentField = recruitmentField!;
      postData.workingType = workingType!;
      if (workingType !== '협의') {
        postData.workingHours = isTimeNegotiable ? '시간 협의' : `${startTime} ~ ${endTime}`;
        postData.workingDays = isDaysNegotiable ? ['요일 협의'] : workingDays;
      } else {
        postData.workingHours = '시간 협의';
        postData.workingDays = ['요일 협의'];
      }

      const salaryUnit = salaryType === '월급' ? '만원' : salaryType === '시급' ? '원' : '';
      const salarySuffix = isJobSeeking && (salaryType === '월급' || salaryType === '시급') ? '~' : '';
      
      postData.salary = isSalaryNegotiable 
          ? '급여 협의' 
          : salaryAmount 
              ? `${salaryType} ${formattedSalaryAmount}${salaryUnit}${salarySuffix}` 
              : '급여 협의';

    } else if (isCourtTransfer) {
        postData.courtType = courtType!;
        postData.fullCourtCount = Number(fullCourtCount) || 0;
        postData.halfCourtCount = Number(halfCourtCount) || 0;
        postData.ballMachineCount = Number(ballMachineCount) || 0;

        if (isPremiumFree) {
            postData.premium = '무권리';
        } else if (isPremiumNegotiable) {
            postData.premium = '권리금 협의';
        } else if (premiumAmount) {
            const num = parseInt(premiumAmount, 10);
            postData.premium = `${num.toLocaleString('ko-KR')}만원`;
        } else {
             postData.premium = '권리금 협의';
        }

        postData.area = area ? `${parseInt(area, 10).toLocaleString('ko-KR')}평` : undefined;
        postData.monthlyRent = monthlyRent ? `${parseInt(monthlyRent, 10).toLocaleString('ko-KR')}만원` : undefined;
        postData.maintenanceFee = isMaintenanceFeePrivate ? '비공개' : (maintenanceFee ? `${parseInt(maintenanceFee, 10).toLocaleString('ko-KR')}만원` : undefined);
        postData.activeMembers = isActiveMembersPrivate ? '비공개' : (activeMembers ? `${parseInt(activeMembers, 10).toLocaleString('ko-KR')}명` : undefined);
        postData.averageRevenue = isAverageRevenuePrivate ? '비공개' : (averageRevenue ? `${parseInt(averageRevenue, 10).toLocaleString('ko-KR')}만원` : undefined);
    } else if (isFreeBoard) {
        postData.subCategory = subCategory!;
    }
    
    const defaultImageUrl = 'https://i.imgur.com/K2H1KaY.png';
    if (isJobPosting || isCourtTransfer || isJobSeeking) {
        postData.imageUrl = imageUrl || defaultImageUrl;
    } else {
        // For FREE_BOARD, keep original behavior (optional image).
        postData.imageUrl = imageUrl ?? undefined;
    }

    onSubmit(postData as NewPostData);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleRegister();
  };

  const handleConsentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConsentChecked(e.target.checked);
  };
  
  const handleContentFocus = () => {
    if (content === courtTransferContentTemplate || content === defaultContentTemplate) {
      setContent('');
    }
  };

  const isFormValid = useMemo(() => {
    if (!consentChecked && !isEditing) return false;

    if (isJobSeeking) {
        const workingDaysCondition = workingType === '협의' || (workingDays.length > 0 || isDaysNegotiable);
        return (
            location.trim() !== '' &&
            recruitmentField !== null &&
            field !== null &&
            playerCareer.trim() !== '' &&
            hasLessonCareer !== null &&
            (!hasLessonCareer || (hasLessonCareer && lessonCareer.trim() !== '')) &&
            memberManagementSkill !== null &&
            counselingSkill !== null &&
            workingType !== null &&
            workingDaysCondition &&
            (isSalaryNegotiable || salaryAmount.trim() !== '')
        );
    }
    
    if (isJobPosting) {
        const workingDaysCondition = workingType === '협의' || (workingDays.length > 0 || isDaysNegotiable);
        return (
            location.trim() !== '' &&
            title.trim() !== '' &&
            recruitmentField !== null &&
            workingType !== null &&
            workingDaysCondition &&
            (isSalaryNegotiable || salaryAmount.trim() !== '')
        );
    }
    
    if (isCourtTransfer) {
        const isPremiumSet = isPremiumFree || isPremiumNegotiable || premiumAmount.trim() !== '';
        return (
            location.trim() !== '' &&
            courtType !== null &&
            area.trim() !== '' &&
            monthlyRent.trim() !== '' &&
            (maintenanceFee.trim() !== '' || isMaintenanceFeePrivate) &&
            (activeMembers.trim() !== '' || isActiveMembersPrivate) &&
            (averageRevenue.trim() !== '' || isAverageRevenuePrivate) &&
            isPremiumSet
        );
    }

    if (isFreeBoard) {
        return title.trim() !== '' && subCategory !== null;
    }
    
    // Other categories
    return location.trim() !== '' && title.trim() !== '';
  }, [
      consentChecked, isEditing, isJobSeeking, isJobPosting, isCourtTransfer, isFreeBoard, location, title, 
      field, playerCareer, hasLessonCareer, lessonCareer, memberManagementSkill, counselingSkill,
      workingType, workingDays, isDaysNegotiable, salaryAmount, isSalaryNegotiable, 
      courtType, area, monthlyRent, maintenanceFee, isMaintenanceFeePrivate, activeMembers, isActiveMembersPrivate,
      averageRevenue, isAverageRevenuePrivate, premiumAmount, isPremiumNegotiable, isPremiumFree,
      subCategory, recruitmentField
  ]);

  const titleLabel = isJobPosting ? '테니스장명' : '제목';
  const titlePlaceholder = isJobPosting ? '테니스장 이름을 입력하세요' : '제목을 입력하세요';
  const locationLabel = isJobSeeking ? '선호지역' : '지역';

  const weekDays = ['월', '화', '수', '목', '금', '토', '일'];
  const timeOptions = Array.from({ length: 48 }, (_, i) => {
      const hour = Math.floor(i / 2).toString().padStart(2, '0');
      const minute = (i % 2 === 0) ? '00' : '30';
      return `${hour}:${minute}`;
  });
  
  const freeBoardSubCategories: FreeBoardSubCategory[] = ['질문', '정보 공유', '중고마켓', '자유이야기'];

  const CountInput: React.FC<{label:string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, id:string}> = ({ label, value, onChange, id }) => (
    <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-xs font-medium text-gray-700">{label}</label>
        <div className="relative w-24">
            <input type="number" id={id} value={value} onChange={onChange}
              className="w-full bg-white pl-3 pr-8 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#ff5710] focus:border-[#ff5710] text-gray-900 text-xs text-right"
              placeholder="0"
            />
            <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-500 pointer-events-none">개</span>
        </div>
    </div>
  );

  const renderJobSeekingForm = () => (
    <>
      <div>
        <label className="inline-block bg-[#ff5710] text-white text-xs font-bold px-2.5 py-1 rounded-full mb-2">
            출신분야
        </label>
        <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
                <button
                    type="button"
                    onClick={() => setField('테니스')}
                    className={`w-1/2 px-3 py-1 text-xs rounded-full border transition-colors ${
                        field === '테니스' ? 'bg-[#ff5710] text-white border-[#ff5710] font-semibold' : 'bg-white text-gray-700 border-gray-300 hover:border-[#ff5710]'
                    }`}
                >
                    테니스
                </button>
                <button
                    type="button"
                    onClick={() => setField('소프트테니스')}
                    className={`w-1/2 px-3 py-1 text-xs rounded-full border transition-colors ${
                        field === '소프트테니스' ? 'bg-[#ff5710] text-white border-[#ff5710] font-semibold' : 'bg-white text-gray-700 border-gray-300 hover:border-[#ff5710]'
                    }`}
                >
                    소프트테니스
                </button>
            </div>
            <div>
                <button
                    type="button"
                    onClick={() => setField('동호인')}
                    className={`w-full px-3 py-1 text-xs rounded-full border transition-colors ${
                        field === '동호인' ? 'bg-[#ff5710] text-white border-[#ff5710] font-semibold' : 'bg-white text-gray-700 border-gray-300 hover:border-[#ff5710]'
                    }`}
                >
                    동호인
                </button>
            </div>
        </div>
      </div>
      <div>
            <label className="inline-block bg-[#ff5710] text-white text-xs font-bold px-2.5 py-1 rounded-full mb-2">
                선수(활동)경력
            </label>
            <div className="relative">
                <input type="number" value={playerCareer} onChange={(e) => setPlayerCareer(e.target.value)}
                  className="w-full bg-white pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#ff5710] focus:border-[#ff5710] text-gray-900 text-xs"
                  placeholder="숫자만 입력"
                />
                <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-500">년</span>
            </div>
      </div>
      <div>
            <label className="inline-block bg-[#ff5710] text-white text-xs font-bold px-2.5 py-1 rounded-full mb-2">
                레슨경력
            </label>
            <div className="flex items-center space-x-2">
                <button type="button" onClick={() => setHasLessonCareer(false)}
                  className={`px-4 py-1 text-xs rounded-full border w-full transition-colors ${
                    hasLessonCareer === false ? 'bg-[#ff5710] text-white border-[#ff5710] font-semibold' : 'bg-white text-gray-700 border-gray-300 hover:border-[#ff5710]'
                  }`}
                >없음</button>
                <button type="button" onClick={() => setHasLessonCareer(true)}
                  className={`px-4 py-1 text-xs rounded-full border w-full transition-colors ${
                    hasLessonCareer === true ? 'bg-[#ff5710] text-white border-[#ff5710] font-semibold' : 'bg-white text-gray-700 border-gray-300 hover:border-[#ff5710]'
                  }`}
                >있음</button>
            </div>
            {hasLessonCareer && (
                <div className="relative mt-2 animate-fade-in">
                    <input type="number" value={lessonCareer} onChange={e => setLessonCareer(e.target.value)}
                        className="w-full bg-white pl-3 pr-16 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#ff5710] focus:border-[#ff5710] text-gray-900 text-xs"
                        placeholder="숫자만 입력"
                    />
                    <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-500">년 이상</span>
                </div>
            )}
      </div>
      <div>
          <label className="inline-block bg-[#ff5710] text-white text-xs font-bold px-2.5 py-1 rounded-full mb-2">
              레슨 외 사항
          </label>
          <div className="space-y-3 p-3 bg-gray-50 rounded-md border">
              <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-700">회원관리</span>
                  <div className="flex items-center space-x-1">
                      {(['상', '중', '하'] as const).map(level => (
                           <button type="button" key={level} onClick={() => setMemberManagementSkill(level)}
                           className={`px-4 py-1.5 text-xs rounded-full border transition-colors ${
                             memberManagementSkill === level ? 'bg-[#ff5710] text-white border-[#ff5710] font-semibold' : 'bg-white text-gray-700 border-gray-300 hover:border-[#ff5710]'
                           }`}
                         >{level}</button>
                      ))}
                  </div>
              </div>
               <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-700">회원상담</span>
                  <div className="flex items-center space-x-1">
                      {(['가능', '불가능'] as const).map(type => (
                           <button type="button" key={type} onClick={() => setCounselingSkill(type)}
                           className={`px-4 py-1.5 text-xs rounded-full border transition-colors ${
                            counselingSkill === type ? 'bg-[#ff5710] text-white border-[#ff5710] font-semibold' : 'bg-white text-gray-700 border-gray-300 hover:border-[#ff5710]'
                           }`}
                         >{type}</button>
                      ))}
                  </div>
              </div>
          </div>
      </div>
    </>
  );

  return (
    <>
      <div className="h-full flex flex-col bg-white animate-fade-in">
        <header className="relative flex items-center justify-center p-4 border-b flex-shrink-0 h-16">
            <button
              type="button"
              onClick={onCancel}
              className="absolute left-4 p-2 -ml-2 text-gray-500 hover:text-gray-800"
              aria-label="뒤로가기"
            >
              <ArrowLeftIcon />
            </button>
            <h2 className="text-lg font-bold text-gray-800">
                {isEditing ? '게시글 수정' : `${CATEGORIES.find(c => c.id === category)?.name} 게시글 작성`}
            </h2>
        </header>

        <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto hide-scrollbar pb-24">
          <main className="p-6 space-y-6">
            <div>
                <label htmlFor="category" className="block text-xs font-medium text-gray-700 mb-1">
                카테고리
                </label>
                <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                disabled={isEditing}
                className="w-full bg-white px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#ff5710] focus:border-[#ff5710] text-gray-900 text-xs disabled:bg-gray-100 disabled:text-gray-500"
                >
                {CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                    {cat.name}
                    </option>
                ))}
                </select>
            </div>
            
            {isJobRelated && (
                <div>
                <label className="inline-block bg-[#ff5710] text-white text-xs font-bold px-2.5 py-1 rounded-full mb-2">
                    {isJobSeeking ? '지원분야' : '모집분야'}
                </label>
                <div className="flex items-center space-x-2">
                    <button
                        type="button"
                        onClick={() => setRecruitmentField('테니스')}
                        className={`flex-1 px-2 py-1 text-xs rounded-full border transition-colors ${
                            recruitmentField === '테니스'
                                ? 'bg-[#ff5710] text-white border-[#ff5710] font-semibold'
                                : 'bg-white text-gray-700 border-gray-300 hover:border-[#ff5710]'
                        }`}
                    >
                        테니스
                    </button>
                    <button
                        type="button"
                        onClick={() => setRecruitmentField('피클볼')}
                        className={`flex-1 px-2 py-1 text-xs rounded-full border transition-colors ${
                            recruitmentField === '피클볼'
                                ? 'bg-[#ff5710] text-white border-[#ff5710] font-semibold'
                                : 'bg-white text-gray-700 border-gray-300 hover:border-[#ff5710]'
                        }`}
                    >
                        피클볼
                    </button>
                </div>
                </div>
            )}

            {isFreeBoard && (
                <div>
                <label className="inline-block bg-[#ff5710] text-white text-xs font-bold px-2.5 py-1 rounded-full mb-2">
                    말머리
                </label>
                <div className="flex flex-wrap gap-2">
                    {freeBoardSubCategories.map((sub) => (
                    <button
                        type="button"
                        key={sub}
                        onClick={() => setSubCategory(sub)}
                        className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                        subCategory === sub
                            ? 'bg-[#ff5710] text-white border-[#ff5710] font-semibold'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-[#ff5710]'
                        }`}
                    >
                        {sub}
                    </button>
                    ))}
                </div>
                </div>
            )}

            {!isJobSeeking && (
                <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                    대표 이미지 (선택)
                </label>
                <div 
                    className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:border-[#ff5710]"
                    onClick={() => fileInputRef.current?.click()}
                >
                    {imageUrl ? (
                    <div className="relative w-full">
                        <img src={imageUrl} alt="Preview" className="w-40 h-40 rounded-lg object-cover mx-auto" />
                    </div>
                    ) : (
                    <div className="space-y-1 text-center">
                        {isRepImageUploading ? (
                            <div className="text-xs text-gray-500">업로드 중...</div>
                        ) : (
                            <>
                            <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <div className="flex text-xs text-gray-600">
                                <p className="pl-1">썸네일 이미지 업로드 (1:1 권장)</p>
                            </div>
                            <p className="text-xs text-gray-500">PNG, JPG 파일</p>
                            </>
                        )}
                    </div>
                    )}
                </div>
                <input 
                    type="file" 
                    accept="image/png, image/jpeg"
                    ref={fileInputRef} 
                    onChange={handleRepImageSelect}
                    className="hidden" 
                    disabled={isRepImageUploading}
                />
                </div>
            )}

            {!isFreeBoard && (
                <div>
                <label htmlFor="location" className="inline-block bg-[#ff5710] text-white text-xs font-bold px-2.5 py-1 rounded-full mb-2">
                    {locationLabel}
                </label>
                <button
                    type="button"
                    id="location"
                    onClick={() => setIsLocationModalOpen(true)}
                    className="w-full bg-white px-3 py-2 border border-gray-300 rounded-md shadow-sm text-left flex justify-between items-center text-xs"
                >
                    <span className={location ? 'text-gray-900' : 'text-gray-400'}>{location || '지역을 선택해주세요'}</span>
                    <ChevronRightIcon />
                </button>
                </div>
            )}

            {!isJobSeeking && !isCourtTransfer && (
                <div>
                    <label htmlFor="title" className="inline-block bg-[#ff5710] text-white text-xs font-bold px-2.5 py-1 rounded-full mb-2">
                    {titleLabel}
                    </label>
                    <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-white px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#ff5710] focus:border-[#ff5710] placeholder-gray-400 text-gray-900 text-xs"
                    placeholder={titlePlaceholder}
                    required
                    />
                </div>
            )}
            
            {isJobSeeking && renderJobSeekingForm()}
            
            {isJobRelated && (
                <>
                <div>
                    <label className="inline-block bg-[#ff5710] text-white text-xs font-bold px-2.5 py-1 rounded-full mb-2">
                        {isJobPosting ? '근무형태' : '희망 근무형태'}
                    </label>
                    <div className="flex items-center space-x-2">
                    {(['풀타임', '파트타임', '협의'] as const).map((type) => (
                        <button
                        type="button"
                        key={type}
                        onClick={() => setWorkingType(type)}
                        className={`flex-1 px-2 py-1 text-xs rounded-full border transition-colors ${
                            workingType === type
                            ? 'bg-[#ff5710] text-white border-[#ff5710] font-semibold'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-[#ff5710]'
                        }`}
                        >
                        {type}
                        </button>
                    ))}
                    </div>
                </div>
                
                {isJobRelated && workingType && workingType !== '협의' && (
                    <div className="space-y-6 animate-fade-in">
                        <div>
                        <label className="inline-block bg-[#ff5710] text-white text-xs font-bold px-2.5 py-1 rounded-full mb-2">
                            {isJobPosting ? '근무요일' : '가능 요일'}
                        </label>
                        <div className="flex items-center justify-between">
                            <div className="flex flex-wrap gap-1">
                                {weekDays.map(day => (
                                    <button
                                        type="button"
                                        key={day}
                                        onClick={() => handleDayToggle(day)}
                                        disabled={isDaysNegotiable}
                                        className={`w-9 h-9 text-xs rounded-full border transition-colors ${
                                            workingDays.includes(day)
                                                ? 'bg-[#ff5710] text-white border-[#ff5710] font-semibold'
                                                : 'bg-white text-gray-700 border-gray-300'
                                        } ${isDaysNegotiable ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#ff5710]/10'}`}
                                    >
                                        {day}
                                    </button>
                                ))}
                            </div>
                            <div className="flex items-center pl-2">
                                <input
                                    type="checkbox"
                                    id="daysNegotiable"
                                    checked={isDaysNegotiable}
                                    onChange={(e) => setIsDaysNegotiable(e.target.checked)}
                                    className="h-4 w-4 text-[#ff5710] bg-white border border-gray-300 rounded focus:ring-[#ff5710] focus:ring-offset-0"
                                />
                                <label htmlFor="daysNegotiable" className="ml-2 text-xs text-gray-700 whitespace-nowrap">
                                    협의
                                </label>
                            </div>
                        </div>
                        </div>
                        
                        <div>
                        <label className="inline-block bg-[#ff5710] text-white text-xs font-bold px-2.5 py-1 rounded-full mb-2">
                            {isJobPosting ? '근무시간' : '가능 시간'}
                        </label>
                        <div className="flex items-center space-x-2">
                            <select
                                value={startTime}
                                onChange={e => setStartTime(e.target.value)}
                                disabled={isTimeNegotiable}
                                className="flex-1 bg-white px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#ff5710] focus:border-[#ff5710] disabled:opacity-50 disabled:bg-gray-50 text-gray-900 text-xs"
                            >
                                {timeOptions.map(time => <option key={`start-${time}`} value={time}>{time}</option>)}
                            </select>
                            <span className="text-gray-500">~</span>
                            <select
                                value={endTime}
                                onChange={e => setEndTime(e.target.value)}
                                disabled={isTimeNegotiable}
                                className="flex-1 bg-white px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#ff5710] focus:border-[#ff5710] disabled:opacity-50 disabled:bg-gray-50 text-gray-900 text-xs"
                            >
                                {timeOptions.map(time => <option key={`end-${time}`} value={time}>{time}</option>)}
                            </select>
                            <div className="flex items-center pl-2">
                                <input
                                    type="checkbox"
                                    id="timeNegotiable"
                                    checked={isTimeNegotiable}
                                    onChange={(e) => setIsTimeNegotiable(e.target.checked)}
                                    className="h-4 w-4 text-[#ff5710] bg-white border border-gray-300 rounded focus:ring-[#ff5710] focus:ring-offset-0"
                                />
                                <label htmlFor="timeNegotiable" className="ml-2 text-xs text-gray-700 whitespace-nowrap">
                                    협의
                                </label>
                            </div>
                        </div>
                        </div>
                    </div>
                )}
                
                <div>
                    <label className="inline-block bg-[#ff5710] text-white text-xs font-bold px-2.5 py-1 rounded-full mb-2">
                    {isJobPosting ? '급여' : '희망 급여'}
                    </label>
                    <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                        {(['월급', '시급', '비율'] as const).map((type) => (
                            <button
                            type="button"
                            key={type}
                            onClick={() => setSalaryType(type)}
                            className={`px-2 py-1 text-xs rounded-full border transition-colors ${
                                salaryType === type
                                ? 'bg-[#ff5710] text-white border-[#ff5710] font-semibold'
                                : 'bg-white text-gray-700 border-gray-300 hover:border-[#ff5710]'
                            }`}
                            >
                            {type}
                            </button>
                        ))}
                        </div>
                        <div className="flex items-center pl-2">
                            <input
                                type="checkbox"
                                id="salaryNegotiable"
                                checked={isSalaryNegotiable}
                                onChange={handleSalaryNegotiableChange}
                                className="h-4 w-4 text-[#ff5710] bg-white border border-gray-300 rounded focus:ring-[#ff5710] focus:ring-offset-0"
                            />
                            <label htmlFor="salaryNegotiable" className="ml-2 text-xs text-gray-700 whitespace-nowrap">
                                협의
                            </label>
                        </div>
                    </div>
                    <div className="relative">
                        <input
                        type="text"
                        value={formattedSalaryAmount}
                        onChange={handleSalaryAmountChange}
                        disabled={isSalaryNegotiable}
                        className="w-full bg-white pl-3 pr-20 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#ff5710] focus:border-[#ff5710] placeholder-gray-400 disabled:opacity-50 disabled:bg-gray-50 text-gray-900 text-xs"
                        placeholder={
                            isJobSeeking && (salaryType === '월급' || salaryType === '시급') ? '희망 시작 금액 (숫자만)' :
                            salaryType === '월급' ? '예: 300' :
                            salaryType === '시급' ? '예: 40,000' :
                            '예: 5:5 또는 50%'
                        }
                        required={!isSalaryNegotiable}
                        />
                        <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-500">
                        {
                            salaryType === '월급' ? `만원${isJobSeeking ? ' ~' : ''}` :
                            salaryType === '시급' ? `원${isJobSeeking ? ' ~' : ''}` :
                            ''
                        }
                        </span>
                    </div>
                    </div>
                </div>
                </>
            )}

            {isCourtTransfer && (
                <div className="space-y-6">
                <div>
                    <label className="inline-block bg-[#ff5710] text-white text-xs font-bold px-2.5 py-1 rounded-full mb-2">
                        시설 종류
                    </label>
                    <div className="flex items-center space-x-2">
                    {(['실내', '실외', '실내/외'] as const).map((type) => (
                        <button
                        type="button"
                        key={type}
                        onClick={() => setCourtType(type)}
                        className={`flex-1 px-2 py-1 text-xs rounded-full border transition-colors ${
                            courtType === type
                            ? 'bg-[#ff5710] text-white border-[#ff5710] font-semibold'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-[#ff5710]'
                        }`}
                        >
                        {type}
                        </button>
                    ))}
                    </div>
                </div>

                {courtType && (
                    <div className="space-y-3 p-3 bg-gray-50 rounded-md border animate-fade-in">
                        <CountInput id="fullCourtCount" label="풀코트" value={fullCourtCount} onChange={e => setFullCourtCount(e.target.value)} />
                        <CountInput id="halfCourtCount" label="하프코트" value={halfCourtCount} onChange={e => setHalfCourtCount(e.target.value)} />
                        <CountInput id="ballMachineCount" label="볼머신기" value={ballMachineCount} onChange={e => setBallMachineCount(e.target.value)} />
                    </div>
                )}

                <div>
                    <label htmlFor="area" className="inline-block bg-[#ff5710] text-white text-xs font-bold px-2.5 py-1 rounded-full mb-2">
                        평수
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            id="area"
                            value={area.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            onChange={e => setArea(e.target.value.replace(/\D/g, ''))}
                            className="w-full bg-white pl-3 pr-24 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#ff5710] focus:border-[#ff5710] placeholder-gray-400 text-gray-900 text-xs"
                            placeholder="숫자만 입력"
                        />
                        <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-500 pointer-events-none">평(전용면적)</span>
                    </div>
                </div>
                
                <div>
                    <label htmlFor="monthlyRent" className="inline-block bg-[#ff5710] text-white text-xs font-bold px-2.5 py-1 rounded-full mb-2">
                        월세
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            id="monthlyRent"
                            value={monthlyRent.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            onChange={e => setMonthlyRent(e.target.value.replace(/\D/g, ''))}
                            className="w-full bg-white pl-3 pr-12 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#ff5710] focus:border-[#ff5710] placeholder-gray-400 text-gray-900 text-xs"
                            placeholder="숫자만 입력"
                        />
                        <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-500 pointer-events-none">만원</span>
                    </div>
                </div>

                <div>
                    <label className="inline-block bg-[#ff5710] text-white text-xs font-bold px-2.5 py-1 rounded-full mb-2">
                    평균관리비
                    </label>
                    <div className="flex items-center space-x-2">
                        <div className="relative flex-grow">
                            <input
                                type="text"
                                value={maintenanceFee.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                onChange={e => setMaintenanceFee(e.target.value.replace(/\D/g, ''))}
                                disabled={isMaintenanceFeePrivate}
                                className="w-full bg-white pl-3 pr-12 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#ff5710] focus:border-[#ff5710] placeholder-gray-400 disabled:opacity-50 disabled:bg-gray-50 text-gray-900 text-xs"
                                placeholder="숫자만 입력"
                            />
                            <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-500 pointer-events-none">만원</span>
                        </div>
                        <div className="flex items-center">
                            <input type="checkbox" id="maintenanceFeePrivate" checked={isMaintenanceFeePrivate} onChange={(e) => { setIsMaintenanceFeePrivate(e.target.checked); if(e.target.checked) setMaintenanceFee(''); }} className="h-4 w-4 text-[#ff5710] border-gray-300 rounded focus:ring-[#ff5710]" />
                            <label htmlFor="maintenanceFeePrivate" className="ml-1.5 text-xs text-gray-700 whitespace-nowrap">비공개</label>
                        </div>
                    </div>
                </div>

                <div>
                    <label className="inline-block bg-[#ff5710] text-white text-xs font-bold px-2.5 py-1 rounded-full mb-2">
                    유효회원수
                    </label>
                    <div className="flex items-center space-x-2">
                        <div className="relative flex-grow">
                            <input
                                type="text"
                                value={activeMembers.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                onChange={e => setActiveMembers(e.target.value.replace(/\D/g, ''))}
                                disabled={isActiveMembersPrivate}
                                className="w-full bg-white pl-3 pr-12 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#ff5710] focus:border-[#ff5710] placeholder-gray-400 disabled:opacity-50 disabled:bg-gray-50 text-gray-900 text-xs"
                                placeholder="숫자만 입력"
                            />
                            <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-500 pointer-events-none">명</span>
                        </div>
                        <div className="flex items-center">
                            <input type="checkbox" id="activeMembersPrivate" checked={isActiveMembersPrivate} onChange={(e) => { setIsActiveMembersPrivate(e.target.checked); if(e.target.checked) setActiveMembers(''); }} className="h-4 w-4 text-[#ff5710] border-gray-300 rounded focus:ring-[#ff5710]" />
                            <label htmlFor="activeMembersPrivate" className="ml-1.5 text-xs text-gray-700 whitespace-nowrap">비공개</label>
                        </div>
                    </div>
                </div>

                <div>
                    <label className="inline-block bg-[#ff5710] text-white text-xs font-bold px-2.5 py-1 rounded-full mb-2">
                    월 평균매출
                    </label>
                    <div className="flex items-center space-x-2">
                        <div className="relative flex-grow">
                            <input
                                type="text"
                                value={averageRevenue.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                onChange={e => setAverageRevenue(e.target.value.replace(/\D/g, ''))}
                                disabled={isAverageRevenuePrivate}
                                className="w-full bg-white pl-3 pr-12 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#ff5710] focus:border-[#ff5710] placeholder-gray-400 disabled:opacity-50 disabled:bg-gray-50 text-gray-900 text-xs"
                                placeholder="숫자만 입력"
                            />
                            <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-500 pointer-events-none">만원</span>
                        </div>
                        <div className="flex items-center">
                            <input type="checkbox" id="averageRevenuePrivate" checked={isAverageRevenuePrivate} onChange={(e) => { setIsAverageRevenuePrivate(e.target.checked); if(e.target.checked) setAverageRevenue(''); }} className="h-4 w-4 text-[#ff5710] border-gray-300 rounded focus:ring-[#ff5710]" />
                            <label htmlFor="averageRevenuePrivate" className="ml-1.5 text-xs text-gray-700 whitespace-nowrap">비공개</label>
                        </div>
                    </div>
                </div>
                
                <div>
                    <label className="inline-block bg-[#ff5710] text-white text-xs font-bold px-2.5 py-1 rounded-full mb-2">
                    권리금/양도금액
                    </label>
                    <div className="space-y-2">
                        <div className="relative">
                            <input
                                type="text"
                                value={premiumAmount.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                onChange={e => setPremiumAmount(e.target.value.replace(/\D/g, ''))}
                                disabled={isPremiumNegotiable || isPremiumFree}
                                className="w-full bg-white pl-3 pr-12 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#ff5710] focus:border-[#ff5710] placeholder-gray-400 disabled:opacity-50 disabled:bg-gray-50 text-gray-900 text-xs"
                                placeholder="숫자만 입력"
                            />
                            <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-500 pointer-events-none">만원</span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center">
                                <input type="checkbox" id="premiumNegotiable" checked={isPremiumNegotiable} onChange={handlePremiumNegotiableChange} className="h-4 w-4 text-[#ff5710] border-gray-300 rounded focus:ring-[#ff5710]" />
                                <label htmlFor="premiumNegotiable" className="ml-1.5 text-xs text-gray-700">협의</label>
                            </div>
                            <div className="flex items-center">
                                <input type="checkbox" id="premiumFree" checked={isPremiumFree} onChange={handlePremiumFreeChange} className="h-4 w-4 text-[#ff5710] border-gray-300 rounded focus:ring-[#ff5710]" />
                                <label htmlFor="premiumFree" className="ml-1.5 text-xs text-gray-700">무권리</label>
                            </div>
                        </div>
                    </div>
                </div>
                </div>
            )}

            <div>
                <label htmlFor="content" className="inline-block bg-[#ff5710] text-white text-xs font-bold px-2.5 py-1 rounded-full mb-2">
                내용
                </label>
                <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onFocus={handleContentFocus}
                rows={8}
                className="w-full bg-white px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#ff5710] focus:border-[#ff5710] text-gray-900 text-xs"
                />
            </div>

            <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-700">
                    본문 이미지 (파일 첨부)
                </label>
                <div className="grid grid-cols-3 gap-2">
                    {contentImages.map((src, index) => (
                    <div key={index} className="relative">
                        <img src={src} alt={`content-upload-${index}`} className="aspect-square w-full object-cover rounded-md" />
                        <button
                        type="button"
                        onClick={() => removeContentImage(index)}
                        className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full p-0.5"
                        >
                        <XIcon />
                        </button>
                    </div>
                    ))}
                    <button
                    type="button"
                    onClick={() => contentFileInputRef.current?.click()}
                    disabled={isContentImageUploading}
                    className="aspect-square flex flex-col items-center justify-center border-2 border-gray-300 border-dashed rounded-md text-gray-500 hover:border-[#ff5710] hover:text-[#ff5710] disabled:opacity-50"
                    >
                    {isContentImageUploading ? (
                        <span className="text-xs">업로드 중...</span>
                    ) : (
                        <>
                        <PaperClipIcon />
                        <span className="text-xs mt-1">사진 추가</span>
                        </>
                    )}
                    </button>
                </div>
                <input 
                    type="file" 
                    accept="image/png, image/jpeg"
                    ref={contentFileInputRef} 
                    onChange={handleContentImageChange}
                    className="hidden"
                    multiple
                    disabled={isContentImageUploading}
                />
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <label htmlFor="commentsAllowed" className="flex items-start cursor-pointer">
                          <input
                              id="commentsAllowed"
                              type="checkbox"
                              checked={commentsAllowed}
                              onChange={(e) => setCommentsAllowed(e.target.checked)}
                              className="h-4 w-4 mt-1 text-[#ff5710] bg-white border border-gray-300 rounded focus:ring-[#ff5710] focus:ring-offset-0"
                          />
                          <span className="ml-3 text-xs text-gray-700">
                              댓글 허용
                          </span>
                      </label>
                  </div>

              {!isEditing && (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <label htmlFor="consent" className="flex items-start cursor-pointer">
                        <input
                            id="consent"
                            type="checkbox"
                            checked={consentChecked}
                            onChange={handleConsentChange}
                            className="h-4 w-4 mt-1 text-[#ff5710] bg-white border border-gray-300 rounded focus:ring-[#ff5710] focus:ring-offset-0"
                        />
                        <span className="ml-3 text-xs text-gray-700 whitespace-pre-line">
        {isCourtTransfer ?
        `본 게시판은 테니스장(코트) 양도에 대한 정보 공유 공간입니다.
        실제 거래 및 이용에 따른 책임은 게시자와 이용자 당사자에게 있으며,
        테니스포럼은 거래 과정 및 결과에 대해 어떠한 책임도 지지 않습니다.
        양도 조건, 결제 방식, 이용 가능 여부 등은 반드시 당사자 간 직접 확인하시기 바랍니다.`
        : isFreeBoard ?
        `자유게시판은
        작성자 본인의 책임 하에
        자유롭게 글을 작성하는 공간입니다.

        타인의 명예를 훼손하거나
        법적 문제가 발생할 수 있는 내용에 대해서는
        작성자 본인에게 책임이 있습니다.`
        :
        `본 글은
        구인·구직 목적의 정보 전달 글이며,
        게시판 성격에 맞지 않는 경우
        사전 안내 없이 정리 될 수 있음에 동의합니다.`
        }
                        </span>
                    </label>
                </div>
              )}
            </div>
          </main>
          <footer className="p-4 bg-white border-t">
              <div className="flex justify-end space-x-4">
                  <button
                  type="button"
                  onClick={onCancel}
                  className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors text-xs font-medium"
                  >
                  취소
                  </button>
                  <button
                  type="submit"
                  disabled={!isFormValid}
                  className="px-6 py-2 bg-[#ff5710] text-white rounded-md hover:bg-[#e64e0e] transition-colors text-xs font-medium disabled:bg-[#ffc2aa] disabled:cursor-not-allowed"
                  >
                  {isEditing ? '수정' : '등록'}
                  </button>
              </div>
          </footer>
        </form>
      </div>

      <LocationSelector
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        onSelect={(selectedLocation) => {
          setLocation(selectedLocation);
          setIsLocationModalOpen(false);
        }}
      />
    </>
  );
};

export default PostForm;
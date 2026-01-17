import React from 'react';
import ArrowLeftIcon from './icons/ArrowLeftIcon';

interface PrivacyPolicyProps {
  onBack: () => void;
}

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBack }) => {
  return (
    <div className="h-full flex flex-col">
      <header className="bg-white sticky top-0 z-10 p-4 border-b flex items-center justify-center h-16 flex-shrink-0">
         <button
            onClick={onBack}
            className="absolute left-4 p-2 -ml-2 text-gray-500 hover:text-gray-800"
            aria-label="뒤로가기"
        >
            <ArrowLeftIcon />
        </button>
        <h1 className="text-lg font-bold text-gray-900">개인정보처리방침</h1>
      </header>

      <main className="flex-grow overflow-y-auto hide-scrollbar p-6 bg-white text-xs text-gray-700 leading-relaxed">
        <p className="mb-4">
          테니스포럼(이하 '회사')은 개인정보 보호법 제30조에 따라 정보주체의 개인정보를 보호하고 이와 관련한 고충을 신속하고 원활하게 처리할 수 있도록 하기 위하여 다음과 같이 개인정보 처리지침을 수립, 공개합니다.
        </p>

        <h2 className="text-base font-bold text-gray-800 mt-6 mb-2">제1조(개인정보의 처리목적)</h2>
        <p>
          회사는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 개인정보 보호법 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
        </p>
        <ol className="list-decimal list-inside space-y-1 mt-2 pl-2">
            <li>회원 가입 및 관리: 회원 가입의사 확인, 회원제 서비스 제공에 따른 본인 식별·인증, 회원자격 유지·관리, 서비스 부정이용 방지, 각종 고지·통지 등을 목적으로 개인정보를 처리합니다.</li>
            <li>서비스 제공: 맞춤 서비스 제공, 콘텐츠 제공, 본인인증 등 서비스 제공과 관련한 목적으로 개인정보를 처리합니다.</li>
        </ol>

        <h2 className="text-base font-bold text-gray-800 mt-6 mb-2">제2조(개인정보의 처리 및 보유기간)</h2>
        <p>
          ① 회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에 동의 받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.
        </p>
        <p className="mt-2">
          ② 각각의 개인정보 처리 및 보유 기간은 다음과 같습니다.
        </p>
        <ol className="list-decimal list-inside space-y-1 mt-2 pl-2">
            <li>회원 가입 및 관리: 회원 탈퇴 시까지. 다만, 다음의 사유에 해당하는 경우에는 해당 사유 종료 시까지 보유합니다.
                <ul className="list-disc list-inside ml-4">
                    <li>관계 법령 위반에 따른 수사·조사 등이 진행 중인 경우, 해당 수사·조사 종료 시까지</li>
                    <li>서비스 이용에 따른 채권·채무관계 잔존 시, 해당 채권·채무관계 정산 시까지</li>
                </ul>
            </li>
        </ol>

        <h2 className="text-base font-bold text-gray-800 mt-6 mb-2">제3조(정보주체와 법정대리인의 권리·의무 및 행사방법)</h2>
        <p>
          정보주체는 회사에 대해 언제든지 개인정보 열람·정정·삭제·처리정지 요구 등의 권리를 행사할 수 있습니다.
        </p>

        <h2 className="text-base font-bold text-gray-800 mt-6 mb-2">제4조(처리하는 개인정보 항목)</h2>
        <p>
          회사는 다음의 개인정보 항목을 처리하고 있습니다.
        </p>
        <ul className="list-disc list-inside mt-2 pl-2">
            <li>필수항목: 이메일, 닉네임, 프로필 사진 등 소셜 로그인 제공 정보</li>
            <li>선택항목: 위치 정보, 경력 정보 등 사용자가 직접 입력하는 정보</li>
        </ul>

        <h2 className="text-base font-bold text-gray-800 mt-6 mb-2">제5조(개인정보의 파기)</h2>
        <p>
          회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체없이 해당 개인정보를 파기합니다.
        </p>

        <h2 className="text-base font-bold text-gray-800 mt-6 mb-2">제6조(개인정보의 안전성 확보조치)</h2>
        <p>
          회사는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다: 관리적 조치(내부관리계획 수립·시행 등), 기술적 조치(개인정보처리시스템 등의 접근권한 관리, 접근통제시스템 설치, 고유식별정보 등의 암호화)
        </p>
        
        <h2 className="text-base font-bold text-gray-800 mt-6 mb-2">제7조(개인정보 처리방침 변경)</h2>
        <p>
          이 개인정보처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경내용의 추가, 삭제 및 정정이 있는 경우에는 변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.
        </p>
        
        <p className="mt-6 text-gray-500">
            시행일자: 2025년 1월 1일
        </p>
      </main>
    </div>
  );
};

export default PrivacyPolicy;
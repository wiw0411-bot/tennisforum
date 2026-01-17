import React from 'react';
import ArrowLeftIcon from './icons/ArrowLeftIcon';

interface TermsOfServiceProps {
  onBack: () => void;
}

const TermsOfService: React.FC<TermsOfServiceProps> = ({ onBack }) => {
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
        <h1 className="text-lg font-bold text-gray-900">이용약관</h1>
      </header>

      <main className="flex-grow overflow-y-auto hide-scrollbar p-6 bg-white text-xs text-gray-700 leading-relaxed">
        <h2 className="text-base font-bold text-gray-800 mt-6 mb-2">제1조 (목적)</h2>
        <p>
          이 약관은 테니스포럼(이하 '회사')이 제공하는 구인·구직 및 커뮤니티 관련 서비스(이하 '서비스')의 이용과 관련하여 회사와 회원 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
        </p>

        <h2 className="text-base font-bold text-gray-800 mt-6 mb-2">제2조 (정의)</h2>
        <ol className="list-decimal list-inside space-y-1 mt-2 pl-2">
            <li>'서비스'라 함은 회사가 제공하는 모든 구인·구직 정보, 시설 양도 정보, 커뮤니티 게시판 등의 온라인 서비스를 의미합니다.</li>
            <li>'회원'이라 함은 회사의 서비스에 접속하여 이 약관에 따라 회사와 이용계약을 체결하고 회사가 제공하는 서비스를 이용하는 고객을 말합니다.</li>
            <li>'게시물'이라 함은 회원이 서비스를 이용함에 있어 서비스상에 게시한 부호, 문자, 음성, 화상 또는 동영상 등의 정보 형태의 글, 사진, 동영상 및 각종 파일과 링크 등을 의미합니다.</li>
        </ol>

        <h2 className="text-base font-bold text-gray-800 mt-6 mb-2">제3조 (약관의 명시와 개정)</h2>
        <p>
            ① 회사는 이 약관의 내용을 회원이 쉽게 알 수 있도록 서비스 초기 화면에 게시합니다.
        </p>
         <p className="mt-2">
            ② 회사는 '약관의 규제에 관한 법률', '정보통신망 이용촉진 및 정보보호 등에 관한 법률(이하 '정보통신망법')' 등 관련법을 위배하지 않는 범위에서 이 약관을 개정할 수 있습니다.
        </p>

        <h2 className="text-base font-bold text-gray-800 mt-6 mb-2">제4조 (회원가입)</h2>
        <p>
          이용계약은 회원이 되고자 하는 자(이하 '가입신청자')가 약관의 내용에 대하여 동의를 한 다음 회원가입신청을 하고 회사가 이러한 신청에 대하여 승낙함으로써 체결됩니다.
        </p>

        <h2 className="text-base font-bold text-gray-800 mt-6 mb-2">제5조 (회원의 의무)</h2>
        <ol className="list-decimal list-inside space-y-1 mt-2 pl-2">
            <li>회원은 관계법, 이 약관의 규정, 이용안내 및 서비스와 관련하여 공지한 주의사항, 회사가 통지하는 사항 등을 준수하여야 하며, 기타 회사의 업무에 방해되는 행위를 하여서는 안 됩니다.</li>
            <li>회원은 허위 사실을 기재하거나, 타인의 정보를 도용하여서는 안됩니다.</li>
            <li>회원은 구인·구직, 시설 양도 등 거래와 관련하여 게시한 정보에 대해 스스로 책임을 져야 합니다.</li>
        </ol>

        <h2 className="text-base font-bold text-gray-800 mt-6 mb-2">제6조 (게시물의 저작권)</h2>
        <p>
          회원이 서비스 내에 게시한 게시물의 저작권은 해당 게시물의 저작자에게 귀속됩니다. 단, 회사는 서비스의 운영, 전시, 전송, 배포, 홍보의 목적으로 회원의 별도의 허락 없이 무상으로 저작권법에 규정하는 공정한 관행에 합치되는 범위 내에서 회원이 등록한 게시물을 사용할 수 있습니다.
        </p>
        
        <h2 className="text-base font-bold text-gray-800 mt-6 mb-2">제7조 (서비스의 제공 및 변경)</h2>
        <p>
            회사는 컴퓨터 등 정보통신설비의 보수점검, 교체 및 고장, 통신두절 또는 운영상 상당한 이유가 있는 경우 서비스의 제공을 일시적으로 중단할 수 있습니다.
        </p>
        
        <h2 className="text-base font-bold text-gray-800 mt-6 mb-2">제8조 (책임 제한)</h2>
        <ol className="list-decimal list-inside space-y-1 mt-2 pl-2">
            <li>회사는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 서비스 제공에 관한 책임이 면제됩니다.</li>
            <li>회사는 회원 간 또는 회원과 제3자 상호간에 서비스를 매개로 하여 거래 등을 한 경우에는 책임이 면제됩니다. 회사는 정보의 중개자로서, 실제 거래에 대한 어떠한 법적 책임도 지지 않습니다.</li>
            <li>회사는 회원이 서비스와 관련하여 게재한 정보, 자료, 사실의 신뢰도, 정확성 등의 내용에 관하여는 책임을 지지 않습니다.</li>
        </ol>

        <h2 className="text-base font-bold text-gray-800 mt-6 mb-2">제9조 (준거법 및 재판관할)</h2>
        <p>
            회사와 회원 간에 발생한 분쟁에 대하여는 대한민국법을 준거법으로 합니다. 회사와 회원간 발생한 분쟁에 관한 소송은 민사소송법 상의 관할법원에 제소합니다.
        </p>

        <p className="mt-6 text-gray-500">
            시행일자: 2025년 1월 1일
        </p>
      </main>
    </div>
  );
};

export default TermsOfService;
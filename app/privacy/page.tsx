import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white px-6 py-12">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 mb-8 inline-block">← 돌아가기</Link>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">개인정보처리방침</h1>
        <p className="text-sm text-gray-400 mb-10">시행일: 2026년 3월 10일</p>

        <div className="space-y-8 text-sm text-gray-700 leading-relaxed">
          <section>
            <h2 className="font-bold text-gray-900 mb-2">1. 수집하는 개인정보 항목</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>필수: 이메일 주소, 비밀번호(암호화 저장)</li>
              <li>결제 시: 카드 정보(토스페이먼츠를 통해 처리, 회사는 저장하지 않음)</li>
              <li>자동 수집: 서비스 이용 기록(요약 횟수 등)</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-gray-900 mb-2">2. 개인정보 수집 및 이용 목적</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>회원 가입 및 서비스 제공</li>
              <li>유료 구독 결제 및 관리</li>
              <li>서비스 이용 현황 파악 및 개선</li>
              <li>고객 문의 응대</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-gray-900 mb-2">3. 개인정보 보유 및 이용 기간</h2>
            <p>회원 탈퇴 시까지 보유합니다. 단, 관계 법령에 따라 일정 기간 보관이 필요한 경우 해당 기간 동안 보관합니다.</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>전자상거래 계약·청약철회 기록: 5년 (전자상거래법)</li>
              <li>소비자 불만·분쟁 처리 기록: 3년 (전자상거래법)</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-gray-900 mb-2">4. 개인정보 제3자 제공</h2>
            <p>회사는 원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다. 다만, 결제 처리를 위해 토스페이먼츠에 필요 최소한의 정보를 제공합니다.</p>
          </section>

          <section>
            <h2 className="font-bold text-gray-900 mb-2">5. 개인정보 처리 위탁</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>Supabase Inc. — 회원 인증 및 데이터 저장</li>
              <li>토스페이먼츠(주) — 결제 처리</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-gray-900 mb-2">6. 이용자의 권리</h2>
            <p>이용자는 언제든지 개인정보 조회, 수정, 삭제, 처리 정지를 요청할 수 있습니다. 회원 탈퇴를 통해 개인정보 삭제를 요청할 수 있습니다.</p>
          </section>

          <section>
            <h2 className="font-bold text-gray-900 mb-2">7. 개인정보 보호책임자</h2>
            <p>성명: 박찬울</p>
            <p>연락처: 010-7655-0390</p>
          </section>
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white px-6 py-12">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 mb-8 inline-block">← 돌아가기</Link>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">이용약관</h1>
        <p className="text-sm text-gray-400 mb-10">시행일: 2026년 3월 10일</p>

        <div className="space-y-8 text-sm text-gray-700 leading-relaxed">
          <section>
            <h2 className="font-bold text-gray-900 mb-2">제1조 (목적)</h2>
            <p>이 약관은 집계산(이하 "회사")이 운영하는 Snapcast 서비스(이하 "서비스")의 이용과 관련하여 회사와 이용자 간의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.</p>
          </section>

          <section>
            <h2 className="font-bold text-gray-900 mb-2">제2조 (서비스 내용)</h2>
            <p>서비스는 유튜브 영상의 자막을 분석하여 AI 기반 요약을 제공하는 기능을 포함합니다. 무료 회원은 월 5회, 유료 구독(Pro) 회원은 무제한으로 이용할 수 있습니다.</p>
          </section>

          <section>
            <h2 className="font-bold text-gray-900 mb-2">제3조 (회원 가입 및 계정)</h2>
            <p>이용자는 이메일 주소와 비밀번호를 등록하여 회원 가입할 수 있습니다. 회원은 본인의 계정 정보를 제3자에게 공유하거나 양도할 수 없습니다.</p>
          </section>

          <section>
            <h2 className="font-bold text-gray-900 mb-2">제4조 (유료 서비스 및 결제)</h2>
            <p>Pro 구독 서비스는 월 9,900원이며, 매월 자동 결제됩니다. 결제는 토스페이먼츠를 통해 처리됩니다. 구독은 언제든지 취소 가능하며, 취소 시 현재 결제 기간 만료 후 무료 요금제로 전환됩니다.</p>
          </section>

          <section>
            <h2 className="font-bold text-gray-900 mb-2">제5조 (서비스 이용 제한)</h2>
            <p>다음 각 호에 해당하는 경우 이용을 제한할 수 있습니다.</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>타인의 계정을 무단으로 사용한 경우</li>
              <li>서비스의 정상적인 운영을 방해하는 행위</li>
              <li>불법적인 목적으로 서비스를 이용하는 경우</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-gray-900 mb-2">제6조 (면책 조항)</h2>
            <p>회사는 AI가 생성한 요약의 정확성을 보장하지 않습니다. 요약 결과는 참고용으로만 사용하시기 바랍니다. 천재지변, 기술적 장애 등 불가항력으로 서비스가 중단될 경우 책임을 지지 않습니다.</p>
          </section>

          <section>
            <h2 className="font-bold text-gray-900 mb-2">제7조 (약관 변경)</h2>
            <p>회사는 약관을 변경할 수 있으며, 변경 시 서비스 내 공지를 통해 사전 안내합니다. 변경된 약관에 동의하지 않을 경우 서비스 이용을 중단하고 탈퇴할 수 있습니다.</p>
          </section>

          <section>
            <h2 className="font-bold text-gray-900 mb-2">제8조 (문의)</h2>
            <p>이용약관에 관한 문의는 아래로 연락 주시기 바랍니다.</p>
            <p className="mt-1">전화: 010-7655-0390</p>
            <p>주소: 서울시 동작구 현충로 151 (우) 06904</p>
          </section>
        </div>
      </div>
    </div>
  );
}

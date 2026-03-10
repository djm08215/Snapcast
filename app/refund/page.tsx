import Link from "next/link";

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-white px-6 py-12">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 mb-8 inline-block">← 돌아가기</Link>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">환불정책</h1>
        <p className="text-sm text-gray-400 mb-10">시행일: 2026년 3월 10일</p>

        <div className="space-y-8 text-sm text-gray-700 leading-relaxed">
          <section>
            <h2 className="font-bold text-gray-900 mb-2">구독 취소 및 환불 원칙</h2>
            <p>Snapcast Pro 구독은 월 단위 자동 결제 서비스입니다. 구독 취소는 언제든지 가능하며, 취소 후 현재 결제 기간이 만료되는 시점까지 Pro 서비스를 이용할 수 있습니다.</p>
          </section>

          <section>
            <h2 className="font-bold text-gray-900 mb-2">환불 가능 조건</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>
                <span className="font-medium">결제 후 7일 이내</span>이며, 서비스를 전혀 이용하지 않은 경우 전액 환불이 가능합니다.
              </li>
              <li>
                서비스 이용 이력이 있는 경우(요약 기능 사용), 결제 금액에서 이용 일수를 제외한 금액을 환불해드립니다.
              </li>
              <li>
                회사의 귀책 사유로 서비스가 정상 제공되지 않은 경우 이용 불가 기간에 비례하여 환불해드립니다.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-gray-900 mb-2">환불 불가 조건</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>결제 후 7일이 경과한 경우</li>
              <li>이용약관 위반으로 이용이 제한된 경우</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-gray-900 mb-2">환불 신청 방법</h2>
            <p>환불을 원하시는 경우 아래 연락처로 문의해 주세요. 신청 후 영업일 기준 3~5일 이내에 처리됩니다.</p>
            <p className="mt-2 font-medium">전화: 010-7655-0390</p>
          </section>

          <section>
            <h2 className="font-bold text-gray-900 mb-2">청약철회</h2>
            <p>전자상거래 등에서의 소비자보호에 관한 법률에 따라, 디지털 콘텐츠 서비스는 이용 개시 후 청약 철회가 제한될 수 있습니다. 단, 서비스 미이용 시 결제일로부터 7일 이내 청약 철회가 가능합니다.</p>
          </section>
        </div>
      </div>
    </div>
  );
}

export function Footer() {
  return (
    <footer style={{
      borderTop: "1px solid #e5e7eb",
      background: "#fafafa",
      padding: "32px 24px",
      marginTop: 48,
    }}>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        {/* 링크 */}
        <div style={{ display: "flex", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
          {[
            { label: "이용약관", href: "/terms" },
            { label: "개인정보처리방침", href: "/privacy" },
            { label: "환불정책", href: "/refund" },
          ].map(({ label, href }) => (
            <a
              key={href}
              href={href}
              style={{ fontSize: 13, color: "#6b7280", textDecoration: "none" }}
            >
              {label}
            </a>
          ))}
        </div>

        {/* 사업자 정보 */}
        <div style={{ fontSize: 12, color: "#9ca3af", lineHeight: 1.9 }}>
          <p style={{ fontWeight: 600, color: "#6b7280", marginBottom: 4 }}>집계산</p>
          <p>대표자 박찬울 &nbsp;|&nbsp; 사업자등록번호 279-37-01504</p>
          <p>서울시 동작구 현충로 151 (우) 06904 110동 1306호</p>
          <p>고객센터 010-7655-0390</p>
          <p style={{ marginTop: 12 }}>© 2026 집계산. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

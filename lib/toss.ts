export const TOSS_SECRET_KEY = process.env.TOSS_SECRET_KEY!;
export const TOSS_API_BASE = "https://api.tosspayments.com";

export const PRO_PRICE = 9900; // 월 9,900원
export const PRO_ORDER_NAME = "Snapcast Pro 월 구독";

function getAuthHeader() {
  const encoded = Buffer.from(`${TOSS_SECRET_KEY}:`).toString("base64");
  return `Basic ${encoded}`;
}

export async function issueBillingKey(authKey: string, customerKey: string) {
  const res = await fetch(
    `${TOSS_API_BASE}/v1/billing/authorizations/${authKey}`,
    {
      method: "POST",
      headers: {
        Authorization: getAuthHeader(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ customerKey }),
    }
  );
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message ?? "빌링키 발급 실패");
  }
  return res.json() as Promise<{ billingKey: string; customerKey: string }>;
}

export async function chargeBilling({
  billingKey,
  customerKey,
  customerEmail,
  orderId,
}: {
  billingKey: string;
  customerKey: string;
  customerEmail: string;
  orderId: string;
}) {
  const res = await fetch(`${TOSS_API_BASE}/v1/billing/${billingKey}`, {
    method: "POST",
    headers: {
      Authorization: getAuthHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      customerKey,
      amount: PRO_PRICE,
      orderId,
      orderName: PRO_ORDER_NAME,
      customerEmail,
    }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message ?? "결제 실패");
  }
  return res.json();
}

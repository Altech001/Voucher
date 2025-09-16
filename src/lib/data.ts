
export type WifiPlan = {
  id: string;
  name: string;
  price: string;
  description: string;
  profileName: string;
};

export type Voucher = {
  id: string;
  code: string;
  is_used?: boolean;
};

export const wifiPlans: WifiPlan[] = [
  {
    id: "daily",
    name: "Luco-Day Plan",
    price: "UGX 1,000",
    description: "24 hours of unlimited internet access.",
    profileName: "Luco-Day",
  },
  {
    id: "weekly",
    name: "Luco-Week Plan",
    price: "UGX 5,000",
    description: "7 days of unlimited internet access.",
    profileName: "Luco-Week",
  },
  {
    id: "monthly",
    name: "Luco-Month Plan",
    price: "UGX 20,000",
    description: "30 days of unlimited internet access.",
    profileName: "Luco-Month",
  },
];

export const vouchers: Voucher[] = [];

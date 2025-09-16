
"use client";

import { type Voucher } from "@/lib/data";
import React, { createContext, useContext, useState } from "react";

type CategorizedVouchers = Record<string, Voucher[]>;

interface VoucherContextType {
  vouchers: CategorizedVouchers;
  handleVoucherUpload: (planId: string, newVouchers: Voucher[]) => void;
  getVoucher: (voucherId: string) => Voucher | null;
}

const VoucherContext = createContext<VoucherContextType | undefined>(undefined);

const initialVouchers: CategorizedVouchers = {};


export function VoucherProvider({ children }: { children: React.ReactNode }) {
  const [vouchers, setVouchers] = useState<CategorizedVouchers>(initialVouchers);

  const handleVoucherUpload = (planId: string, newVouchers: Voucher[]) => {
    setVouchers((prev) => {
        const updatedPlanVouchers = [...(prev[planId] || []), ...newVouchers];
        return {
            ...prev,
            [planId]: updatedPlanVouchers,
        };
    });
  };

  const getVoucher = (voucherId: string): Voucher | null => {
    for (const planId in vouchers) {
      const foundVoucher = vouchers[planId as keyof typeof vouchers].find(v => v.id === voucherId);
      if (foundVoucher) {
        // In a real app, you would also remove the voucher from the list
        // setVouchers(prev => ({
        //   ...prev,
        //   [planId]: prev[planId as keyof typeof prev].filter(v => v.id !== voucherId)
        // }));
        return foundVoucher;
      }
    }
    return null;
  };

  return (
    <VoucherContext.Provider value={{ vouchers, handleVoucherUpload, getVoucher }}>
      {children}
    </VoucherContext.Provider>
  );
}

export function useVouchers() {
  const context = useContext(VoucherContext);
  if (context === undefined) {
    throw new Error("useVouchers must be used within a VoucherProvider");
  }
  return context;
}

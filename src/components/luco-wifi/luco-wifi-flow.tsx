
"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { PhoneNumberForm } from "@/components/connect-ug/phone-number-form";
import { WifiPlansDialog } from "./wifi-plans-dialog";
import { VouchersDialog } from "./vouchers-dialog";
import { FinalVoucherDialog } from "./final-voucher-dialog";
import type { WifiPlan } from "@/lib/data";
import { Voucher } from "@/lib/data";
import { getVouchersForPlan, purchaseVoucher, getActiveVoucherForPhone } from "@/app/actions";
import { ActiveVoucherDialog } from "./active-voucher-dialog";
import { useToast } from "@/hooks/use-toast";

type FlowStep = "phone" | "activeVoucher" | "plans" | "vouchers" | "final";

type ActiveVoucherInfo = {
    code: string;
    planName: string;
    expiresAt: string;
}

export function LucoWifiFlow() {
  const [step, setStep] = useState<FlowStep>("phone");
  const [isLoading, setIsLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<WifiPlan | null>(null);
  const [availableVouchers, setAvailableVouchers] = useState<Voucher[]>([]);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [activeVouchers, setActiveVouchers] = useState<ActiveVoucherInfo[] | null>(null);
  const { toast } = useToast();

  const handlePhoneSubmit = async ({ phoneNumber }: { phoneNumber: string }) => {
    setIsLoading(true);
    setPhoneNumber(phoneNumber);
    
    const existingVouchers = await getActiveVoucherForPhone(phoneNumber);
    if (existingVouchers) {
        setActiveVouchers(existingVouchers);
        setStep("activeVoucher");
    } else {
        setStep("plans");
    }
    setIsLoading(false);
  };

  const handleProceedToPurchase = () => {
    setActiveVouchers(null);
    setStep("plans");
  }

  const handlePlanSelect = async (plan: WifiPlan) => {
    setIsLoading(true);
    setSelectedPlan(plan);
    const vouchers = await getVouchersForPlan(plan.id);
    setAvailableVouchers(vouchers);
    setIsLoading(false);
    setStep("vouchers");
  };

  const handleVoucherSelect = async (voucher: Voucher) => {
    setIsLoading(true);
    const purchased = await purchaseVoucher(voucher.id, phoneNumber);
    if (purchased) {
      setSelectedVoucher(purchased);
      setStep("final");
    } else {
        toast({
            variant: "destructive",
            title: "Purchase Failed",
            description: "Could not purchase the voucher. It might already be taken. Please try another one.",
        });
        // Force a reload of vouchers by going back to plans and then forward again.
        if (selectedPlan) {
            handlePlanSelect(selectedPlan);
        } else {
            setStep("plans");
        }
    }
    setIsLoading(false);
  };

  const handleReset = () => {
    setStep("phone");
    setPhoneNumber("");
    setSelectedPlan(null);
    setSelectedVoucher(null);
    setActiveVouchers(null);
    setAvailableVouchers([]);
    setIsLoading(false);
  };

  return (
    <AnimatePresence mode="wait">
      {step === "phone" && (
        <PhoneNumberForm
          onSubmit={handlePhoneSubmit}
          isLoading={isLoading}
        />
      )}
      {step === "activeVoucher" && activeVouchers && (
        <ActiveVoucherDialog 
            vouchers={activeVouchers}
            onReset={handleReset}
            onProceed={handleProceedToPurchase}
        />
      )}
      {step === "plans" && <WifiPlansDialog onPlanSelect={handlePlanSelect} onBack={handleReset} isLoading={isLoading} />}
      {step === "vouchers" && selectedPlan && (
        <VouchersDialog
          plan={selectedPlan}
          availableVouchers={availableVouchers}
          onVoucherSelect={handleVoucherSelect}
          onBack={() => setStep("plans")}
          isLoading={isLoading}
        />
      )}
      {step === "final" && selectedPlan && selectedVoucher && (
        <FinalVoucherDialog
          plan={selectedPlan}
          voucher={selectedVoucher}
          phoneNumber={phoneNumber}
          onReset={handleReset}
        />
      )}
    </AnimatePresence>
  );
}

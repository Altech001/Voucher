
"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Ticket, ShieldX, Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { type Voucher, type WifiPlan } from "@/lib/data";

interface VouchersDialogProps {
  plan: WifiPlan;
  availableVouchers: Voucher[];
  onVoucherSelect: (voucher: Voucher) => void;
  onBack: () => void;
  isLoading: boolean;
}

export function VouchersDialog({ plan, availableVouchers, onVoucherSelect, onBack, isLoading }: VouchersDialogProps) {
    const cardVariants = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 },
    };

  return (
    <motion.div
      key="vouchers"
      variants={cardVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden bg-card">
        <CardHeader className="p-6">
            <div className="flex items-center gap-4">
               <Button variant="ghost" size="icon" onClick={onBack}>
                  <ArrowLeft />
               </Button>
              <div>
                  <CardTitle className="text-2xl font-headline">Select a Voucher</CardTitle>
                  <CardDescription>For your <span className="font-semibold text-primary">{plan.name}</span></CardDescription>
              </div>
            </div>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          {isLoading ? (
            <div className="flex justify-center items-center py-16">
                <Loader2 className="w-12 h-12 animate-spin" />
            </div>
          ) : availableVouchers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {availableVouchers.map((voucher, index) => (
                <button
                    key={voucher.id}
                    className="w-full text-left p-4 rounded-lg border hover:bg-muted/50 transition-colors flex items-center gap-3"
                    onClick={() => onVoucherSelect(voucher)}
                    disabled={isLoading}
                >
                    <Ticket className="w-6 h-6 text-primary" />
                    <span className="font-mono text-lg select-none">Voucher #{index + 1}</span>
                </button>
                ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-16 border rounded-lg flex flex-col items-center gap-4">
                <ShieldX className="w-12 h-12" />
                <p className="font-semibold">No Vouchers Available</p>
                <p className="text-sm max-w-xs">There are currently no vouchers for the {plan.name}. Please ask the administrator to upload more.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

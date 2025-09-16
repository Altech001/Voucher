"use client";

import { motion } from "framer-motion";
import { CheckCircle, Copy, CopyCheck } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { type Voucher, type WifiPlan } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import * as React from "react";

interface FinalVoucherDialogProps {
  plan: WifiPlan;
  voucher: Voucher;
  phoneNumber: string;
  onReset: () => void;
}

export function FinalVoucherDialog({
  plan,
  voucher,
  phoneNumber,
  onReset,
}: FinalVoucherDialogProps) {
  const { toast } = useToast();
  const [isCopied, setIsCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(voucher.code);
    toast({
      title: "Copied to clipboard!",
      description: "The voucher code has been copied.",
    });
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  return (
    <motion.div
      key="final"
      variants={cardVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden bg-card">
        <CardHeader className="text-center p-8">
            <CheckCircle
              className="mx-auto h-16 w-16"
              style={{ color: "hsl(var(--chart-2))" }}
            />
          <CardTitle className="font-headline text-2xl mt-4">
            Payment Successful!
          </CardTitle>
          <CardDescription>Your voucher code is ready.</CardDescription>
        </CardHeader>
        <CardContent className="p-6 pt-0 text-center">
            <p className="text-muted-foreground mb-4">
                Your voucher for the <span className="font-bold text-foreground">{plan.name}</span> has been sent to <span className="font-bold text-foreground">{phoneNumber}</span>.
            </p>
          <div className="rounded-lg border bg-muted/30 p-4 text-center">
            <p className="text-sm text-muted-foreground">Voucher Code</p>
            <div className="flex items-center justify-center gap-4 mt-2">
              <p className="text-3xl font-mono font-bold text-primary">{voucher.code}</p>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopy}
                aria-label="Copy voucher code"
              >
                {isCopied ? <CopyCheck className="text-primary" /> : <Copy />}
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="p-6 pt-0">
            <Button onClick={onReset} variant="outline" className="w-full">
                Start Over
            </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}

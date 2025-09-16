
"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Wifi } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { wifiPlans, type WifiPlan } from "@/lib/data";

interface WifiPlansDialogProps {
  onPlanSelect: (plan: WifiPlan) => void;
  onBack: () => void;
  isLoading: boolean;
}

export function WifiPlansDialog({ onPlanSelect, onBack, isLoading }: WifiPlansDialogProps) {
  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  return (
    <motion.div
      key="plans"
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
                <CardTitle className="text-2xl font-headline">Available WIFI Plans</CardTitle>
                <CardDescription>Select a plan to continue.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="space-y-4">
            {wifiPlans.map((plan) => (
              <button
                key={plan.id}
                className="w-full text-left p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                onClick={() => onPlanSelect(plan)}
                disabled={isLoading}
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">{plan.name}</h3>
                   <div className="flex items-center gap-2">
                    {isLoading && <Loader2 className="animate-spin" />}
                    <p className="font-bold text-primary">{plan.price}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {plan.description}
                </p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

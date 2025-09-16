
"use client";

import { motion } from "framer-motion";
import { Ticket, CalendarClock, PlusCircle, Copy, CopyCheck } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow, parseISO } from "date-fns";
import * as React from "react";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "../ui/separator";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel";

interface ActiveVoucher {
  code: string;
  planName: string;
  expiresAt: string;
}

interface ActiveVoucherDialogProps {
  vouchers: ActiveVoucher[];
  onReset: () => void;
  onProceed: () => void;
}

function getExpirationMessage(expiresAt: string) {
    try {
      const expiresDate = parseISO(expiresAt);
      if (expiresDate > new Date()) {
        return `Expires in ${formatDistanceToNow(expiresDate)}`;
      }
      return "Expired";
    } catch (e) {
      return "Invalid date";
    }
  };

function VoucherItem({ voucher }: { voucher: ActiveVoucher }) {
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
  
  return (
    <div className="p-1">
        <div className="rounded-lg border bg-muted/30 p-4">
            <div className="flex flex-col items-center justify-center space-y-2">
                <p className="text-sm text-muted-foreground">Voucher Code</p>
                <div className="flex items-center justify-center gap-2">
                    <p className="text-3xl font-mono font-bold text-primary">{voucher.code}</p>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleCopy}
                        aria-label="Copy voucher code"
                        className="h-8 w-8"
                    >
                        {isCopied ? <CopyCheck className="text-primary" /> : <Copy />}
                    </Button>
                </div>
            </div>
            <Separator className="my-4 bg-border/50" />
            <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                    <p className="text-sm font-medium text-muted-foreground">Plan</p>
                    <p className="font-semibold text-foreground">{voucher.planName}</p>
                </div>
                <div>
                    <p className="text-sm font-medium text-muted-foreground">Validity</p>
                    <div className="flex items-center justify-center gap-1.5 text-foreground font-semibold">
                        <CalendarClock className="w-4 h-4 text-muted-foreground"/>
                        <span>{getExpirationMessage(voucher.expiresAt)}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}

export function ActiveVoucherDialog({
  vouchers,
  onReset,
  onProceed,
}: ActiveVoucherDialogProps) {
  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  const [api, setApi] = React.useState<CarouselApi>()

  return (
    <motion.div
      key="activeVoucher"
      variants={cardVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden bg-card">
        <CardHeader className="text-center p-8">
          <Ticket
            className="mx-auto h-16 w-16"
            style={{ color: "hsl(var(--chart-2))" }}
          />
          <CardTitle className="font-headline text-2xl mt-4">
            You Have Active Vouchers
          </CardTitle>
          <CardDescription>Here are your current voucher details. You can add on if you wish.</CardDescription>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <Carousel setApi={setApi} className="w-full">
            <CarouselContent>
              {vouchers.map((voucher) => (
                <CarouselItem key={voucher.code}>
                  <VoucherItem voucher={voucher} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="absolute left-0 top-1/2 -translate-y-1/2" />
            <CarouselNext className="absolute right-0 top-1/2 -translate-y-1/2" />
          </Carousel>
        </CardContent>
        <CardFooter className="p-6 pt-0 flex flex-col sm:flex-row gap-4">
          <Button onClick={onProceed} className="w-full">
            <PlusCircle />
            Add On (Buy New Voucher)
          </Button>
          <Button onClick={onReset} variant="outline" className="w-full">
            Start Over
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}

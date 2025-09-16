
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle, Loader2, Send, Smartphone, XCircle } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LucoWifiLogo } from "@/components/icons/luco-wifi-logo";

const formSchema = z.object({
  phoneNumber: z
    .string()
    .trim()
    .min(1, "Please enter a phone number."),
});

type FormValues = z.infer<typeof formSchema>;

interface PhoneNumberFormProps {
  onSubmit: (data: FormValues) => void;
  isLoading: boolean;
}

export function PhoneNumberForm({ onSubmit, isLoading }: PhoneNumberFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phoneNumber: "",
    },
  });

  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  return (
    <Card className="overflow-hidden shadow-2xl bg-card shadow-primary/10">
        <motion.div
            key="form"
            variants={cardVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            <CardHeader className="text-center p-8">
              <div className="mx-auto bg-primary/10 p-2 rounded-full w-fit">
                <LucoWifiLogo className="h-14 w-14" />
              </div>
              <CardTitle className="font-headline text-3xl mt-4">
                Luco WIFI
              </CardTitle>
              <CardDescription className="pt-1">
                Enter your phone number to get started.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input
                              placeholder="e.g., 0712345678"
                              className="pl-10"
                              type="tel"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <>
                        <Send />
                        Get WIFI Plans
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
        </motion.div>
    </Card>
  );
}

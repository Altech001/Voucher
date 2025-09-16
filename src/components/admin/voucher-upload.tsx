
"use client";

import * as React from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { wifiPlans } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, FileUp } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  planId: z.string().min(1, "Please select a plan."),
  csvFile: z
    .any()
    .refine((files) => files?.length === 1, "CSV file is required.")
    .refine(
      (files) => files?.[0]?.type === "text/csv",
      "File must be a CSV."
    ),
});

type FormValues = z.infer<typeof formSchema>;

interface VoucherUploadProps {
    onVoucherUpload: () => void;
    preselectedPlanId?: string;
}

export function VoucherUpload({ onVoucherUpload, preselectedPlanId }: VoucherUploadProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      planId: preselectedPlanId || "",
      csvFile: undefined,
    },
  });

  React.useEffect(() => {
    if (preselectedPlanId) {
        form.setValue("planId", preselectedPlanId);
    }
  }, [preselectedPlanId, form]);

  const fileList = useWatch({ control: form.control, name: "csvFile" });
  
  const fileRef = form.register("csvFile");

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      form.setValue("csvFile", e.dataTransfer.files);
    }
  };


  const onSubmit = (values: FormValues) => {
    setIsLoading(true);
    const file = values.csvFile[0];
    const reader = new FileReader();

    reader.onload = async (e) => {
      const text = e.target?.result as string;
      if (!text) {
        toast({
            variant: "destructive",
            title: "Error reading file",
            description: "Could not read the uploaded file.",
        });
        setIsLoading(false);
        return;
      }

      // Simple CSV parser
      const lines = text.split("\n").filter(line => line.trim() !== '');
      if (lines.length < 2) {
          toast({
              variant: "destructive",
              title: "Invalid CSV file",
              description: "The CSV file is empty or missing headers.",
          });
          setIsLoading(false);
          return;
      }
      
      const headers = lines[0].split(",").map(h => h.trim().replace(/"/g, ''));
      
      const usernameIndex = headers.findIndex(h => h.toLowerCase() === 'username');

      if (usernameIndex === -1) {
          toast({
              variant: "destructive",
              title: "Invalid CSV format",
              description: "CSV must contain a 'Username' column.",
          });
          setIsLoading(false);
          return;
      }
      
      const newVouchers: { code: string; plan_id: string }[] = [];

      const selectedPlan = wifiPlans.find(p => p.id === values.planId);
       if (!selectedPlan) {
        toast({
            variant: "destructive",
            title: "Invalid Plan",
            description: "The selected WIFI plan is not valid.",
        });
        setIsLoading(false);
        return;
      }

      for (let i = 1; i < lines.length; i++) {
          const data = lines[i].split(",").map(d => d.trim().replace(/"/g, ''));
          if (data.length > usernameIndex) {
            const username = data[usernameIndex];
            if (username) {
                newVouchers.push({ code: username, plan_id: values.planId });
            }
          }
      }

      if (newVouchers.length > 0) {
        const { error } = await supabase.from('vouchers').insert(newVouchers);

        if (error) {
            toast({
                variant: "destructive",
                title: "Database Error",
                description: error.message,
            });
        } else {
            toast({
              title: "Upload Successful",
              description: `${newVouchers.length} vouchers have been added to the '${selectedPlan.name}'.`,
            });
            onVoucherUpload();
        }
      } else {
        toast({
            variant: "destructive",
            title: "No Vouchers Found",
            description: `No voucher codes found in the 'Username' column of the file.`,
        });
      }

      form.reset();
      setIsLoading(false);
    };

    reader.onerror = () => {
        toast({
            variant: "destructive",
            title: "File Read Error",
            description: "There was an error reading the file.",
        });
        setIsLoading(false);
    };

    reader.readAsText(file);
  };

  return (
    <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
            control={form.control}
            name="planId"
            render={({ field }) => (
                <FormItem>
                <FormLabel>WIFI Plan</FormLabel>
                <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isLoading || !!preselectedPlanId}
                >
                    <FormControl>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a plan" />
                    </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                    {wifiPlans.map((plan) => (
                        <SelectItem key={plan.id} value={plan.id}>
                        {plan.name}
                        </SelectItem>
                    ))}
                    </SelectContent>
                </Select>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="csvFile"
            render={() => (
                <FormItem>
                <FormLabel>CSV File</FormLabel>
                    <FormControl>
                    <div
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        className={cn(
                            "relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:border-primary/50 transition-colors",
                            isDragging && "border-primary bg-primary/10",
                            form.formState.errors.csvFile && "border-destructive"
                        )}
                    >
                        <Input
                            type="file"
                            accept=".csv"
                            className="absolute w-full h-full opacity-0 cursor-pointer"
                            {...fileRef}
                            disabled={isLoading}
                        />
                        {fileList && fileList.length > 0 ? (
                            <div className="text-center">
                                <FileUp className="w-8 h-8 mx-auto text-primary" />
                                <p className="font-semibold">{fileList[0].name}</p>
                                <p className="text-xs text-muted-foreground">{Math.round(fileList[0].size / 1024)} KB</p>
                            </div>
                        ) : (
                            <div className="text-center text-muted-foreground">
                                <Upload className="w-8 h-8 mx-auto" />
                                <p className="font-semibold">Drag & drop or click to upload</p>
                                <p className="text-xs">CSV file from Mikhmon</p>
                            </div>
                        )}
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
            <Upload />
            )}
            Upload Vouchers
        </Button>
        </form>
    </Form>
  );
}

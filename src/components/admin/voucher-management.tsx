
"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { wifiPlans, type WifiPlan } from "@/lib/data";
import { VoucherUpload } from "./voucher-upload";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/lib/supabase/client";
import { CheckCircle, Loader2, ShieldX, Ticket, Upload } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "../ui/button";

// Define the shape of a voucher based on the database schema
type Voucher = {
  id: string;
  code: string;
  plan_id: string;
  is_used: boolean;
};

type CategorizedVouchers = Record<string, Voucher[]>;

interface VoucherStats {
    total: number;
    used: number;
    available: number;
    byPlan: Record<string, { total: number; used: number; available: number }>;
}

export function VoucherManagement() {
  const [vouchers, setVouchers] = React.useState<CategorizedVouchers>({});
  const [stats, setStats] = React.useState<VoucherStats | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = React.useState(false);
  const [preselectedPlanId, setPreselectedPlanId] = React.useState<string | undefined>(undefined);


  const openUploadDialog = (planId?: string) => {
    setPreselectedPlanId(planId);
    setIsUploadDialogOpen(true);
  }
  
  const fetchVouchers = React.useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('vouchers')
      .select('id, code, plan_id, is_used');
    
    if (error) {
        console.error(error);
        setIsLoading(false);
        return;
    }
    
    const categorized = data.reduce((acc, voucher) => {
        const planId = voucher.plan_id;
        if (!acc[planId]) {
            acc[planId] = [];
        }
        acc[planId].push(voucher);
        return acc;
    }, {} as CategorizedVouchers);

    const totalVouchers = data.length;
    const usedVouchers = data.filter(v => v.is_used).length;
    
    const byPlanStats: VoucherStats['byPlan'] = {};

    wifiPlans.forEach(plan => {
      const planVouchers = categorized[plan.id] || [];
      const total = planVouchers.length;
      const used = planVouchers.filter(v => v.is_used).length;
      byPlanStats[plan.id] = { total, used, available: total - used };
    });

    setVouchers(categorized);
    setStats({
        total: totalVouchers,
        used: usedVouchers,
        available: totalVouchers - usedVouchers,
        byPlan: byPlanStats
    });
    setIsLoading(false);
  }, []);

  React.useEffect(() => {
    fetchVouchers();
  }, [fetchVouchers]);

  if (isLoading) {
    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <div className="space-y-6">
        <header className="flex items-center justify-end gap-4">
            <div className="flex items-center gap-2">
                <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => openUploadDialog()}>
                            <Upload />
                            Upload Vouchers
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Upload Vouchers</DialogTitle>
                            <DialogDescription>
                                Select a plan and upload a CSV from Mikhmon.
                            </DialogDescription>
                        </DialogHeader>
                        <VoucherUpload 
                            onVoucherUpload={() => {
                                fetchVouchers();
                                setIsUploadDialogOpen(false);
                            }} 
                            preselectedPlanId={preselectedPlanId}
                        />
                    </DialogContent>
                </Dialog>
            </div>
        </header>

        <div className="grid gap-4 md:grid-cols-3">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Vouchers</CardTitle>
                    <Ticket className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    {isLoading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">{stats?.total ?? 0}</div>}
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Vouchers Used</CardTitle>
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    {isLoading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">{stats?.used ?? 0}</div>}
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Vouchers Available</CardTitle>
                    <ShieldX className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    {isLoading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">{stats?.available ?? 0}</div>}
                </CardContent>
            </Card>
        </div>
        
        <Card>
            <CardHeader>
                <CardTitle>Voucher Lists by Plan</CardTitle>
                    <CardDescription>Click on a plan to view its vouchers or upload more.</CardDescription>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {wifiPlans.map((plan) => (
                    <div key={plan.id} className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors flex flex-col justify-between">
                        <div>
                             <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="font-semibold">{plan.name}</h3>
                                    <p className="text-sm text-muted-foreground">{plan.price}</p>
                                </div>
                                <div className="text-right">
                                    {isLoading ? <Skeleton className="h-5 w-16" /> : <p className="font-bold text-primary">{stats?.byPlan[plan.id]?.available ?? 0} <span className="font-normal text-muted-foreground">/ {stats?.byPlan[plan.id]?.total ?? 0}</span></p> }
                                    <p className="text-xs text-muted-foreground">Available</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 mt-4">
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="outline" className="w-full">View Vouchers</Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-lg bg-card">
                                    <DialogHeader>
                                        <DialogTitle>{plan.name} Vouchers</DialogTitle>
                                        <DialogDescription>List of all vouchers for the {plan.name} plan.</DialogDescription>
                                    </DialogHeader>
                                    <VoucherTable plan={plan} vouchers={vouchers[plan.id]} isLoading={isLoading} />
                                </DialogContent>
                            </Dialog>
                            <Button className="w-full" onClick={() => openUploadDialog(plan.id)}>
                                <Upload className="w-4 h-4 mr-2" />
                                Upload
                            </Button>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    </div>
  );
}

function VoucherTable({ plan, vouchers, isLoading }: { plan: WifiPlan, vouchers: Voucher[], isLoading: boolean }) {
    if (isLoading) {
        return (
            <div className="space-y-2 mt-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
        )
    }
    
    if (!vouchers || vouchers.length === 0) {
        return (
            <div className="text-center text-muted-foreground py-16 border rounded-lg mt-4">
                <p>No vouchers uploaded for the {plan.name} plan yet.</p>
            </div>
        )
    }
  return (
    <div className="rounded-lg border mt-4">
        <Table>
            <TableHeader>
            <TableRow>
                <TableHead>Voucher Code</TableHead>
                <TableHead className="text-right">Status</TableHead>
            </TableRow>
            </TableHeader>
        </Table>
        <ScrollArea className="h-72">
            <Table>
                <TableBody>
                {vouchers.map((voucher) => (
                    <TableRow key={voucher.id} data-state={voucher.is_used ? 'selected' : undefined}>
                    <TableCell className="font-mono">{voucher.code}</TableCell>
                    <TableCell className="text-right">{voucher.is_used ? 'Used' : 'Available'}</TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
        </ScrollArea>
    </div>
  );
}

    
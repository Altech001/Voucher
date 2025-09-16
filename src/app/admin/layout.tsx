
"use client";

import { AdminAuthProvider, useAdminAuth } from "@/context/admin-auth-context";
import { AdminLogin } from "@/components/admin/admin-login";
import { LucoWifiLogo } from "@/components/icons/luco-wifi-logo";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading, logout } = useAdminAuth();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <AdminLogin />;
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur-sm">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
                    <div className="flex items-center gap-3">
                        <LucoWifiLogo className="h-7 w-7 text-primary" />
                        <h1 className="text-xl font-bold tracking-tight">Luco WIFI</h1>
                    </div>
                     <Button onClick={logout} variant="outline">Logout</Button>
                </div>
            </header>
            <main className="container mx-auto p-4 sm:p-6 lg:p-8">
                {children}
            </main>
        </div>
    );
}


export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <AdminAuthProvider>
            <AdminLayoutContent>{children}</AdminLayoutContent>
        </AdminAuthProvider>
    )
}

    
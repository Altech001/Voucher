
"use client";

import { LucoWifiFlow } from "@/components/luco-wifi/luco-wifi-flow";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { UserCog } from "lucide-react";
import * as React from 'react';

export default function Home() {
  return (
    <main 
      className="flex min-h-screen flex-col items-center justify-center relative bg-cover bg-center"
      style={{ backgroundImage: "url('https://storage.googleapis.com/aip-dev-images-dev-0/public/6a5a3a72-a70c-4421-aa05-49277f978051.png')" }}
    >
      <div className="w-full max-w-md">
        <LucoWifiFlow />
      </div>
      <div className="absolute bottom-4 right-4">
        <Button asChild variant="outline">
          <Link href="/admin/vouchers">
            <UserCog />
            Admin
          </Link>
        </Button>
      </div>
    </main>
  );
}

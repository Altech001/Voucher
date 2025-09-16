
"use client";

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useAdminAuth } from '@/context/admin-auth-context';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { LucoWifiLogo } from '../icons/luco-wifi-logo';

const formSchema = z.object({
  username: z.string().min(1, 'Username is required.'),
  password: z.string().min(1, 'Password is required.'),
});

type FormValues = z.infer<typeof formSchema>;

export function AdminLogin() {
  const { login, isLoading } = useAdminAuth();
  const { toast } = useToast();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { username: '', password: '' },
  });

  const onSubmit = async (values: FormValues) => {
    const success = await login(values.username, values.password);
    if (!success) {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: 'Invalid username or password.',
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
            <div className="mx-auto">
                <LucoWifiLogo className="h-14 w-14" />
            </div>
          <CardTitle className="text-2xl mt-4">Admin Login</CardTitle>
          <CardDescription>
            Access the Luco WIFI dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="admin" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="animate-spin" />}
                Sign In
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

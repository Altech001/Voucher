
"use server";

import { supabase } from "@/lib/supabase/client";
import { revalidatePath } from "next/cache";
import { wifiPlans } from "@/lib/data";

// Helper function to format phone number
function formatPhoneNumber(phoneNumber: string): string {
  // Remove any spaces, dashes or other characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // If number starts with 0, replace it with +256
  if (cleaned.startsWith('0')) {
    return '+256' + cleaned.substring(1);
  }
  
  // If number starts with 256, add +
  if (cleaned.startsWith('256')) {
    return '+' + cleaned;
  }
  
  // If number doesn't start with any of the above, assume it needs full prefix
  if (!cleaned.startsWith('+256')) {
    return '+256' + cleaned;
  }
  
  return cleaned;
}

async function sendSMS(phoneNumber: string, message: string) {
  const url = 'https://lucosms-api.onrender.com/api/v1/client/send-sms';
  const apiKey = 'Luco_0gStE1K11IqewVsR9brZY76GfIK2rzve';

  // Format the phone number to include +256
  const formattedNumber = formatPhoneNumber(phoneNumber);
  
  console.log('Sending SMS to:', formattedNumber);
  console.log('Message content:', message);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json',
        'X-API-Key': apiKey
      },
      body: JSON.stringify({
        message: message,
        recipients: [formattedNumber]
      })
    });

    if (!response.ok) {
      console.error('SMS API error:', {
        status: response.status,
        statusText: response.statusText
      });
      return false;
    }

    const data = await response.json();
    console.log('SMS API response:', data);
    
    if (data.status !== 'success') {
      console.error('SMS sending failed:', data);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('SMS sending error:', error);
    return false;
  }
}

async function sendVoucherSMS(phoneNumber: string, voucherCode: string, planName: string) {
  const message = `Your Luco WIFI voucher for ${planName} plan is: ** ${voucherCode}.**\n Thank you for choosing Luco WIFI!`;
  return sendSMS(phoneNumber, message);
}

async function sendActiveVouchersSMS(phoneNumber: string, activeVouchers: Array<{ code: string; planName: string; expiresAt: string }>) {
  const codes = activeVouchers.map(v => v.code).join(',');
  const message = `Active Luco WIFI codes: ${codes}`;
  return sendSMS(phoneNumber, message);
}

export async function getActiveVoucherForPhone(phoneNumber: string) {
    console.log('Checking active vouchers for phone:', phoneNumber);
    
    const { data, error } = await supabase
        .from('purchased_vouchers')
        .select(`
            expires_at,
            voucher_id,
            vouchers (
                code,
                plan_id
            )
        `)
        .eq('phone_number', phoneNumber)
        .gt('expires_at', new Date().toISOString())
        .order('expires_at', { ascending: false });
    
    if (error) {
        console.error('Error fetching active vouchers:', error);
        return null;
    }
    
    if (!data || data.length === 0) {
        console.log('No active vouchers found');
        return null;
    }
    
    console.log('Found active vouchers:', data.length);
    
    const activeVouchers = data
        .map(item => {
            // Ensure we have voucher data
            if (!item.vouchers) {
                console.log('Missing voucher data for:', item.voucher_id);
                return null;
            }

            const voucherData = Array.isArray(item.vouchers) ? item.vouchers[0] : item.vouchers;
            if (!voucherData || !voucherData.code || !voucherData.plan_id) {
                console.log('Invalid voucher data:', voucherData);
                return null;
            }

            const plan = wifiPlans.find(p => p.id === voucherData.plan_id);
            if (!plan) {
                console.log('Plan not found for:', voucherData.plan_id);
                return null;
            }

            return {
                code: voucherData.code,
                planName: plan.name,
                expiresAt: item.expires_at,
            };
        })
        .filter(v => v !== null);

    console.log('Processed active vouchers:', activeVouchers.length);

    if (activeVouchers.length > 0) {
        try {
            console.log('Sending SMS for active vouchers...');
            const smsSent = await sendActiveVouchersSMS(phoneNumber, activeVouchers);
            console.log('SMS send result:', smsSent);
        } catch (error) {
            console.error('Error sending active vouchers SMS:', error);
        }
        return activeVouchers;
    }

    return null;
}


export async function getVouchersForPlan(planId: string) {
    const { data, error } = await supabase
        .from('vouchers')
        .select('id, code, plan_id')
        .eq('plan_id', planId)
        .eq('is_used', false);
    
    if (error) {
        console.error("Error fetching vouchers:", error);
        return [];
    }
    return data;
}

export async function purchaseVoucher(voucherId: string, phoneNumber: string) {
    // First, mark the voucher as used
    const { data: voucher, error: updateError } = await supabase
        .from('vouchers')
        .update({ is_used: true, used_at: new Date().toISOString() })
        .eq('id', voucherId)
        .select()
        .single();
    
    if (updateError || !voucher) {
        console.error("Error updating voucher:", updateError);
        return null;
    }

    // Then, determine the expiration date based on the plan
    const plan = wifiPlans.find(p => p.id === voucher.plan_id);
    if (!plan) {
        console.error("Could not find plan for voucher");
        // Optionally, roll back the update here
        return null;
    }
    
    const purchasedAt = new Date(voucher.used_at!);
    const expiresAt = new Date(purchasedAt);
    if (plan.id === 'daily') expiresAt.setDate(purchasedAt.getDate() + 1);
    else if (plan.id === 'weekly') expiresAt.setDate(purchasedAt.getDate() + 7);
    else if (plan.id === 'monthly') expiresAt.setMonth(purchasedAt.getMonth() + 1);


    // Finally, record the purchase
    const { error: purchaseError } = await supabase
        .from('purchased_vouchers')
        .insert({
            voucher_id: voucher.id,
            phone_number: phoneNumber,
            purchased_at: voucher.used_at,
            expires_at: expiresAt.toISOString(),
        })

    if (purchaseError) {
        console.error("Error inserting purchased voucher:", purchaseError);
        // We might want to roll back the is_used update here in a real app
        await supabase.from('vouchers').update({ is_used: false, used_at: null }).eq('id', voucherId);
        return null;
    }

    revalidatePath('/'); // To update the available vouchers on the main page
    revalidatePath('/admin/vouchers'); // to update the admin view

    // Send SMS with voucher details
    if (plan) {
        await sendVoucherSMS(phoneNumber, voucher.code, plan.name);
    }

    return voucher;
}

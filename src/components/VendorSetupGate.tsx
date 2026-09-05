'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { usePhoolFlowStore } from '@/lib/store';
import { Flower } from 'lucide-react';
import { toast } from 'sonner';

interface FormValues {
  stallNumber: string;
  name: string;
}

export default function VendorSetupGate({ children }: { children: React.ReactNode }) {
  const vendor = usePhoolFlowStore((s) => s.vendor);
  const setVendor = usePhoolFlowStore((s) => s.setVendor);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>();

  if (vendor) return <>{children}</>;

  const onSubmit = (data: FormValues) => {
    setLoading(true);
    setTimeout(() => {
      setVendor({
        id: `vendor-stall${data.stallNumber}`,
        stallNumber: data.stallNumber.trim(),
        name: data.name.trim(),
      });
      toast.success(`Welcome, ${data.name.trim()}! Stall ${data.stallNumber.trim()} is ready.`);
      setLoading(false);
    }, 300);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8 gap-3">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
            <Flower size={32} className="text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Flower Mandi</h1>
            <p className="text-sm text-muted-foreground font-medium">Live Dispatch</p>
          </div>
        </div>

        <div className="bg-card rounded-2xl shadow-sm border border-border p-6">
          <h2 className="text-xl font-bold text-foreground mb-1">Who are you?</h2>
          <p className="text-sm text-muted-foreground mb-6">Enter your stall details to get started. No password needed.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1" htmlFor="stallNumber">
                Stall Number
              </label>
              <input
                id="stallNumber"
                type="number"
                inputMode="numeric"
                placeholder="24"
                className="w-full h-14 text-3xl font-bold text-center rounded-xl border-2 border-border bg-input focus:outline-none focus:border-primary transition-colors font-tabular"
                {...register('stallNumber', {
                  required: 'Stall number is required',
                  min: { value: 1, message: 'Enter a stall number from 1 to 100' },
                  max: { value: 100, message: 'Enter a stall number from 1 to 100' },
                })}
              />
              {errors.stallNumber && (
                <p className="mt-1 text-xs text-red-600 font-medium">{errors.stallNumber.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-1" htmlFor="vendorName">
                Your Name
              </label>
              <input
                id="vendorName"
                type="text"
                placeholder="Ravi"
                className="w-full h-12 text-lg font-semibold px-4 rounded-xl border-2 border-border bg-input focus:outline-none focus:border-primary transition-colors"
                {...register('name', {
                  required: 'Name is required',
                  minLength: { value: 2, message: 'Enter at least 2 characters' },
                })}
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-600 font-medium">{errors.name.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 rounded-xl bg-primary text-white text-lg font-bold tracking-wide flex items-center justify-center gap-2 active:scale-95 transition-all duration-150 disabled:opacity-60 mt-1"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Enter Market'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          Your details are saved on this device only.
        </p>
      </div>
    </div>
  );
}
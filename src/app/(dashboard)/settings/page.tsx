"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { SettingsApi } from "@/modules/settings/api";
import { getErrorMessage } from "@/lib/error-utils";
import { CircleDollarSign, Save } from "lucide-react";

export default function SettingsPage() {
  const [rate, setRate] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCurrencyRate();
  }, []);

  const fetchCurrencyRate = async () => {
    try {
      setLoading(true);
      const response = await SettingsApi.getCurrencyRate();
      setRate(response.data?.rate || "");
    } catch (error: any) {
      if (error.response?.status !== 404) {
        toast.error(getErrorMessage(error, "Failed to fetch currency rate"));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!rate || isNaN(Number(rate))) {
      toast.error("Please enter a valid numeric rate");
      return;
    }

    try {
      setLoading(true);
      await SettingsApi.updateCurrencyRate({ rate: Number(rate) });
      toast.success("Currency rate updated successfully");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to update currency rate"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10 px-4 space-y-8 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-800">System Settings</h1>
        <p className="text-muted-foreground mt-2">Manage your ERP application configuration and preferences.</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-6 rounded-t-xl">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <CircleDollarSign className="w-5 h-5 text-primary" />
              </div>
              <CardTitle className="text-xl">Currency Conversion</CardTitle>
            </div>
            <CardDescription>
              Manage the exchange rate for USD to LKR. This rate is used globally.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2 pt-2">
                <Label htmlFor="usd-rate" className="text-sm font-semibold text-slate-700">1 USD equals (in LKR)</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-slate-500 font-medium">Rs.</span>
                  </div>
                  <Input min={0} id="usd-rate"
                    type="number" step="any"
                    className="pl-10 border-slate-300 focus-visible:ring-primary h-11"
                    placeholder="e.g. 350.00"
                    value={rate}
                    onChange={(e) => setRate(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-slate-50/30 pt-6">
            <Button 
              onClick={handleSave} 
              disabled={loading || !rate}
              className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white font-medium h-10 px-6 shadow-sm"
            >
              {loading ? (
                "Saving..."
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

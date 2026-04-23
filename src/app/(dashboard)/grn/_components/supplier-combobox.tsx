"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/shared/combobox";
import { CustomerApi } from "@/modules/customer/api";
import { CUSTOMER } from "@/modules/customer/types";
import { CustomerType } from "@/config/enum";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/error-utils";
import { getUser } from "@/lib/auth";

interface SupplierComboboxProps {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
}

export function SupplierCombobox({
  value,
  onValueChange,
  disabled,
}: SupplierComboboxProps) {
  const [suppliers, setSuppliers] = React.useState<CUSTOMER[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // New Supplier Form State
  const [newSupplier, setNewSupplier] = React.useState({
    company_name: "",
    phone: "",
    email: "",
  });

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const response = await CustomerApi.getAll();
      if (response.status === 200) {
        const filtered = response.data.filter(
          (c) => c.customer_type === CustomerType.SUPPLIER || c.customer_type === CustomerType.BOTH
        );
        setSuppliers(filtered);
      }
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to fetch suppliers"));
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleAddSupplier = async () => {
    if (!newSupplier.company_name) {
      toast.error("Company name is required");
      return;
    }

    try {
      setIsSubmitting(true);
      const userData = getUser();
      const payload = {
        customer_type: CustomerType.SUPPLIER,
        company_name: newSupplier.company_name,
        phone: newSupplier.phone,
        email: newSupplier.email,
        address: "",
        credit_period: "",
        vat_type: "",
        vat_no: "",
        logo_url: "",
        contact_persons: [],
        created_by: userData?.name || "User",
        updated_by: userData?.name || "User",
        status: "ACTIVE",
      };

      const response = await CustomerApi.create(payload);
      if (response.status === 201 || response.status === 200) {
        toast.success("Supplier added successfully");
        setIsDialogOpen(false);
        const addedSupplierName = newSupplier.company_name;
        setNewSupplier({ company_name: "", phone: "", email: "" });
        await fetchSuppliers();
        // Automatically select the new supplier
        onValueChange(addedSupplierName);
      }
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to add supplier"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const comboboxItems = suppliers.map((s) => ({
    value: s.company_name,
    label: s.company_name,
  }));

  return (
    <>
      <div className="flex gap-2 w-full">
        <div className="flex-1">
          <Combobox
            items={comboboxItems}
            value={value}
            onValueChange={onValueChange}
            placeholder="Select supplier..."
            searchPlaceholder="Search supplier..."
            emptyMessage="No supplier found."
            disabled={disabled || loading}
          />
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => setIsDialogOpen(true)}
          disabled={disabled}
          title="Add New Supplier"
          className="shrink-0"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Supplier</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Company Name*</Label>
              <Input
                id="name"
                value={newSupplier.company_name}
                onChange={(e) =>
                  setNewSupplier({ ...newSupplier, company_name: e.target.value })
                }
                placeholder="Enter company name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={newSupplier.phone}
                onChange={(e) =>
                  setNewSupplier({ ...newSupplier, phone: e.target.value })
                }
                placeholder="Enter phone number"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newSupplier.email}
                onChange={(e) =>
                  setNewSupplier({ ...newSupplier, email: e.target.value })
                }
                placeholder="Enter email address"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              type="button"
              onClick={() => setIsDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleAddSupplier} disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Supplier"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

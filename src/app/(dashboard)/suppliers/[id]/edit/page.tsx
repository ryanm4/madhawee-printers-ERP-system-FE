"use client";

import { getErrorMessage } from "@/lib/error-utils";
import PageTitleWithBreadcrumb from "@/components/shared/page-title-with-breadcrumb";
import { supplierSchema } from "@/modules/supplier/validation";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { FieldPath, useForm, SubmitHandler, useFieldArray } from "react-hook-form";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Loader2, Plus, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CustomerType, VatType } from "@/config/enum";
import { SupplierApi } from "@/modules/supplier/api";
import { toast } from "sonner";
import { getUser } from "@/lib/auth";
import { FullPageLoader } from "@/components/shared/loader";
import { UPDATE_SUPPLIER } from "@/modules/supplier/types";

type SupplierFormValues = z.infer<typeof supplierSchema>;

function EditSupplierRelationship() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<{
    name: string;
    email: string;
  } | null>(null);

  const baseDefaultValues: SupplierFormValues = {
    customer_type: CustomerType.SUPPLIER,
    companyName: "",
    address: "",
    phone: "",
    email: "",
    creditPeriod: "",
    vat_type: "",
    vat_no: "",
    logoUrl: "",
    contactPersons: [
      {
        name: "",
        email: "",
        phone: "",
      },
    ],
    created_by: "",
    status: "Active",
  };

  const form = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierSchema),
    defaultValues: baseDefaultValues,
  });

  const { fields: contactFields, append: appendContact, remove: removeContact } = useFieldArray({
    control: form.control,
    name: "contactPersons",
  });

  useEffect(() => {
    const userData = getUser();
    if (userData) {
      setUser({
        name: userData.name || "User",
        email: userData.email,
      });
    }

    async function fetchSupplierData() {
      try {
        setIsLoading(true);
        const response = await SupplierApi.getById(id);
        const data = response.data;

        form.reset({
          customer_type: data.customer_type,
          companyName: data.company_name,
          address: data.address,
          phone: data.phone,
          email: data.email,
          creditPeriod: data.credit_period,
          vat_type: data.vat_type,
          vat_no: data.vat_no,
          logoUrl: data.logo_url,
          contactPersons: data.contact_persons || [{ name: "", email: "", phone: "" }],
          created_by: data.created_by,
          status: data.status,
        });
      } catch (error) {
        console.error("Failed to fetch supplier:", error);
        toast.error("Failed to load supplier details");
        router.push("/suppliers");
      } finally {
        setIsLoading(false);
      }
    }

    if (id) {
      fetchSupplierData();
    }
  }, [id, form, router]);

  const onSubmit: SubmitHandler<SupplierFormValues> = async (data) => {
    try {
      setIsLoading(true);
      const payload: UPDATE_SUPPLIER = {
        customer_id: Number(id),
        customer_type: data.customer_type as CustomerType,
        company_name: data.companyName,
        address: data.address ?? "",
        phone: data.phone ?? "",
        email: data.email ?? "",
        credit_period: data.creditPeriod ?? "",
        vat_type: data.vat_type ?? "",
        vat_no: data.vat_no ?? "",
        logo_url: data.logoUrl ?? "",
        contact_persons: data.contactPersons.map((cp: any) => ({
          ...(cp.id && { id: cp.id }),
          name: cp.name,
          email: cp.email ?? "",
          phone: cp.phone ?? "",
        })),
        updated_by: user?.name || "User",
        status: data.status ?? "Active",
      };

      const response = await SupplierApi.update(Number(id), payload);

      if (response.status === 200) {
        toast.success("Supplier Updated Successfully");
        router.push("/suppliers");
      }
    } catch (error) {
      console.error("Failed to update supplier:", error);
      toast.error(getErrorMessage(error, "Failed to update supplier. Please try again."));
    } finally {
      setIsLoading(false);
    }
  };

  const renderFormField = <TName extends FieldPath<SupplierFormValues>>(
    name: TName,
    render: Parameters<typeof FormField<SupplierFormValues, TName>>["0"]["render"]
  ) => <FormField control={form.control} name={name} render={render} />;

  return (
    <div className="flex flex-1 flex-col gap-4 p-[24px] pt-0 mt-3">
      {isLoading && <FullPageLoader />}
      <PageTitleWithBreadcrumb
        title="Edit Supplier"
        breadcrumbs={[
          { title: "Dashboard", href: "/dashboard" },
          { title: "Suppliers", href: "/suppliers" },
          { title: "Edit", href: "" },
        ]}
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">


          <div className="grid grid-cols-1 gap-4">
            <Card className="w-full shadow-sm">
              <CardHeader>
                <h3 className="text-md font-medium">Update Supplier Information</h3>
                <p className="text-xs text-muted-foreground">Modify the details for this supplier profile.</p>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {renderFormField("customer_type", ({ field }) => (
                  <FormItem>
                    <FormLabel>Entity Type</FormLabel>
                    <FormControl>
                      <Input readOnly {...field} className="bg-muted cursor-not-allowed" />
                    </FormControl>
                  </FormItem>
                ))}

                <div className="flex flex-row gap-4">
                  {renderFormField("companyName", ({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Company Name <span className="text-red-500">*</span></FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  ))}
                  {renderFormField("phone", ({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Company Phone</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  ))}
                </div>

                {renderFormField("address", ({ field }) => (
                  <FormItem>
                    <FormLabel>Supplier Address</FormLabel>
                    <FormControl><Textarea {...field} className="resize-none" /></FormControl>
                    <FormMessage />
                  </FormItem>
                ))}

                <div className="flex flex-row gap-4">
                  {renderFormField("email", ({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Company Email</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  ))}
                  {renderFormField("creditPeriod", ({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Credit Period (Days)</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  ))}
                </div>

                <div className="flex flex-row gap-4">
                  {renderFormField("vat_type", ({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>VAT Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select VAT Type" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(VatType).map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  ))}
                  {renderFormField("vat_no", ({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>VAT Number</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  ))}
                </div>

                <div className="flex flex-col gap-4 border-t pt-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-md font-medium">Point of Contacts</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => appendContact({ name: "", email: "", phone: "" })}
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" /> Add Contact
                    </Button>
                  </div>

                  <div className="space-y-6">
                    {contactFields.map((field, index) => (
                      <div key={field.id} className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 pr-14 border rounded-lg relative bg-accent/5">
                        {contactFields.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeContact(index)}
                            className="absolute top-4 right-4 text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                        {renderFormField(`contactPersons.${index}.name`, ({ field }) => (
                          <FormItem>
                            <FormLabel>Name <span className="text-red-500">*</span></FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        ))}
                        {renderFormField(`contactPersons.${index}.email`, ({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        ))}
                        {renderFormField(`contactPersons.${index}.phone`, ({ field }) => (
                          <FormItem>
                            <FormLabel>Phone</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="flex items-center justify-end gap-[16px] w-full mt-6">
            <Button
              size="lg"
              variant="outline"
              type="button"
              onClick={() => router.push("/suppliers")}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              size="lg"
              type="submit"
              className="bg-primary text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default EditSupplierRelationship;

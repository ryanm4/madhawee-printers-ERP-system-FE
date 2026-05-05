"use client";

import { getErrorMessage } from "@/lib/error-utils";
import PageTitleWithBreadcrumb from "@/components/shared/page-title-with-breadcrumb";
import { supplierSchema } from "@/modules/supplier/validation";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import {
  FieldPath,
  useForm,
  SubmitHandler,
  useFieldArray,
} from "react-hook-form";
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
import {
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
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
import { CREATE_SUPPLIER } from "@/modules/supplier/types";

type SupplierFormValues = z.infer<typeof supplierSchema>;

function CreateSupplierProfile() {
  const router = useRouter();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<{
    name: string;
    email: string;
    avatar: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const baseDefaultValues: SupplierFormValues = {
    customer_type: CustomerType.SUPPLIER, // Hardcoded for this module
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

  const {
    fields: contactFields,
    append: appendContact,
    remove: removeContact,
  } = useFieldArray({
    control: form.control,
    name: "contactPersons",
  });

  useEffect(() => {
    const userData = getUser();
    if (userData) {
      setUser({
        name: userData.name || "User",
        email: userData.email,
        avatar: "",
      });
    }
  }, []);

  const handleFileSelect = (file: File | null) => {
    if (file) {
      const validTypes = [
        "image/jpeg",
        "image/png",
        "image/svg+xml",
        "application/zip",
      ];
      const maxSize = 10 * 1024 * 1024; // 10MB

      if (validTypes.includes(file.type) && file.size <= maxSize) {
        setUploadedFile(file);
      } else {
        alert(
          "Invalid file type or size. Please upload a .jpg, .png, .svg, or .zip file under 10MB."
        );
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const removeFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onSubmit: SubmitHandler<SupplierFormValues> = async (data) => {
    try {
      setIsLoading(true);

      const payload: CREATE_SUPPLIER = {
        customer_type: data.customer_type as CustomerType,
        company_name: data.companyName,
        address: data.address ?? "",
        phone: data.phone ?? "",
        email: data.email ?? "",
        credit_period: data.creditPeriod ?? "",
        vat_type: data.vat_type ?? "",
        vat_no: data.vat_no ?? "",
        logo_url: data.logoUrl ?? "",
        contact_persons: data.contactPersons.map((cp) => ({
          name: cp.name,
          email: cp.email ?? "",
          phone: cp.phone ?? "",
        })),
        created_by: user?.name || "User",
        status: data.status ?? "Active",
      };

      const response = await SupplierApi.create(payload);

      if (response.status === 201 || response.status === 200) {
        toast.success("Supplier Created Successfully");
        router.push("/suppliers");
      }
    } catch (error) {
      console.error("Failed to create supplier:", error);
      toast.error(
        getErrorMessage(error, "Failed to create supplier. Please try again.")
      );
    } finally {
      setIsLoading(false);
    }
  };

  const renderFormField = <TName extends FieldPath<SupplierFormValues>>(
    name: TName,
    render: Parameters<
      typeof FormField<SupplierFormValues, TName>
    >["0"]["render"]
  ) => <FormField control={form.control} name={name} render={render} />;

  return (
    <div className="flex flex-1 flex-col gap-4 p-[24px] pt-0 mt-3">
      {isLoading && <FullPageLoader />}
      <PageTitleWithBreadcrumb
        title="Create Supplier"
        breadcrumbs={[
          { title: "Dashboard", href: "/dashboard" },
          { title: "Suppliers", href: "/suppliers" },
        ]}
      />

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6  pb-0"
        >
          <div className="grid grid-cols-1 gap-4">
            <Card
              className={cn(
                "w-full shadow-sm hover:shadow-md transition-shadow flex flex-col"
              )}
            >
              <CardHeader className="flex flex-col gap-[0.5px]">
                <h3 className="text-md font-medium mb-2">Supplier Details</h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Core information for the new supplier profile.
                </p>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {renderFormField("customer_type", ({ field }) => (
                  <FormItem>
                    <FormLabel>Entity Type</FormLabel>
                    <FormControl>
                      <Input
                        readOnly
                        {...field}
                        className="bg-muted cursor-not-allowed"
                      />
                    </FormControl>
                  </FormItem>
                ))}

                <div className="flex flex-row gap-4">
                  {renderFormField("companyName", ({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>
                        Company Name <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Enter Company Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  ))}
                  {renderFormField("phone", ({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Company Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter Phone Number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  ))}
                </div>

                {renderFormField("address", ({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter Company Address"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                ))}

                <div className="flex flex-row gap-4">
                  {renderFormField("email", ({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Company Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter Email Address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  ))}
                  {renderFormField("creditPeriod", ({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Credit Period (Days)</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter Credit Period" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  ))}
                </div>

                <div className="flex flex-row gap-4">
                  {renderFormField("vat_type", ({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>VAT Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select VAT Type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(VatType).map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  ))}
                  {renderFormField("vat_no", ({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>VAT Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter VAT Number" {...field} />
                      </FormControl>
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
                      onClick={() =>
                        appendContact({ name: "", email: "", phone: "" })
                      }
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" /> Add Contact
                    </Button>
                  </div>

                  <div className="space-y-6">
                    {contactFields.map((field, index) => (
                      <div
                        key={field.id}
                        className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 pr-14 border rounded-lg relative bg-accent/5"
                      >
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
                        {renderFormField(
                          `contactPersons.${index}.name`,
                          ({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Name <span className="text-red-500">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input placeholder="Contact Name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )
                        )}
                        {renderFormField(
                          `contactPersons.${index}.email`,
                          ({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input placeholder="Contact Email" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )
                        )}
                        {renderFormField(
                          `contactPersons.${index}.phone`,
                          ({ field }) => (
                            <FormItem>
                              <FormLabel>Phone</FormLabel>
                              <FormControl>
                                <Input placeholder="Contact Phone" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )
                        )}
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
                  Creating...
                </>
              ) : (
                "Create"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default CreateSupplierProfile;

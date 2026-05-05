"use client";

import { getErrorMessage } from "@/lib/error-utils";

import PageTitleWithBreadcrumb from "@/components/shared/page-title-with-breadcrumb";
import { customerSchema } from "@/modules/customer/validation";
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
import { CloudUpload, FileArchive, Plus, Trash2, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CustomerType, VatType } from "@/config/enum";
import { CREATE_CUSTOMER } from "@/modules/customer/types";
import { CustomerApi } from "@/modules/customer/api";
import { toast } from "sonner";
import { getUser } from "@/lib/auth";
import { FullPageLoader } from "@/components/shared/loader";

type CustomerFormValues = z.infer<typeof customerSchema>;

function EditCustomerRelationship() {
  const router = useRouter();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<{
    name: string;
    email: string;
    avatar: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const params = useParams();
  const id = params.id as string;

  const baseDefaultValues: CustomerFormValues = {
    customer_type: "",
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

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: baseDefaultValues,
  });

  const { fields: contactFields, append: appendContact, remove: removeContact } = useFieldArray({
    control: form.control,
    name: "contactPersons",
  });

  useEffect(() => {
    const userData = getUser();
    if (userData) {
      const name = userData.name || "User";
      setUser({
        name: name,
        email: userData.email,
        avatar: "",
      });
      form.setValue("updated_by", name);
    }
  }, [form]);

  useEffect(() => {
    async function fetchInventoryData() {
      try {
        setIsLoading(true);
        const response = await CustomerApi.getById(id);
        const data = response.data;

        const contactPersonsArray = Array.isArray(data.contacts) ? data.contacts : [];

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

          // ✅ Safe mapping
          contactPersons:
            contactPersonsArray.length > 0
              ? contactPersonsArray.map((cp) => ({
                id: cp.id || undefined,
                name: cp.name || "",
                email: cp.email || "",
                phone: cp.phone || "",
              }))
              : [{ name: "", email: "", phone: "" }],

          created_by: data.created_by,
        });

      } catch (error) {
        console.error("Failed to fetch customer:", error);
        toast(getErrorMessage(error, "Failed to load customer data"));
        router.push("/customers");
      } finally {
        setIsLoading(false);
      }
    }

    if (id) {
      fetchInventoryData();
    }
  }, [id, form, router]);

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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + sizes[i];
  };

  const onSubmit: SubmitHandler<CustomerFormValues> = async (data) => {
    try {
      setIsLoading(true);
      const payload: CREATE_CUSTOMER = {
        customer_type: CustomerType.CUSTOMER,
        company_name: data.companyName,
        address: data.address ?? "",
        phone: data.phone ?? "",
        email: data.email ?? "",
        credit_period: data.creditPeriod ?? "",
        vat_type: data.vat_type ?? "",
        vat_no: data.vat_no ?? "",
        logo_url: data.logoUrl ?? "",
        contacts: data.contactPersons.map((cp) => ({
          name: cp.name,
          email: cp.email ?? "",
          phone: cp.phone ?? "",
        })),
        created_by: data.created_by || user?.name || "User",
        updated_by: user?.name || "User",
        status: "Updated",
      };
      await CustomerApi.update(id, payload);

      const isSupplier = data.customer_type === CustomerType.SUPPLIER;
      toast(`${isSupplier ? "Supplier" : "Customer"} Updated`, {
        description: `The ${isSupplier ? "supplier" : "customer"} details have been updated successfully.`,
      });
      form.reset(baseDefaultValues);
      form.clearErrors();
      router.push("/customers");
    } catch (error) {
      console.error("Failed to submit entity:", error);
      const isSupplier = form.getValues("customer_type") === CustomerType.SUPPLIER;
      const label = isSupplier ? "Supplier" : "Customer";
      toast(`Failed to Update ${label}`, {
        description: getErrorMessage(error, `An error occurred while updating the ${label.toLowerCase()}. Please try again.`),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderFormField = <TName extends FieldPath<CustomerFormValues>>(
    name: TName,
    render: Parameters<
      typeof FormField<CustomerFormValues, TName>
    >["0"]["render"]
  ) => <FormField control={form.control} name={name} render={render} />;

  const supplierType = form.watch("customer_type");
  useEffect(() => {
    if (supplierType === CustomerType.CUSTOMER) {
      form.setValue("creditPeriod", "");
      form.clearErrors("creditPeriod");
    }
  }, [supplierType, form]);
  return (
    <div className="flex flex-1 flex-col gap-4 p-[24px] pt-0 mt-3">
      {isLoading && <FullPageLoader />}
      <PageTitleWithBreadcrumb
        title={`Edit ${supplierType === CustomerType.SUPPLIER ? "Supplier" : "Customer"}`}
        breadcrumbs={[
          { title: "Dashboard", href: "/dashboard" },
          { title: "Customer / Supplier Management", href: "/customers" },
        ]}
      />

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit, (_errors) => {
            toast("Please fill in all required fields correctly");
          })}
          className="space-y-6  pb-0"
        >
          <div className="flex items-center justify-end gap-[16px] sm:justify-end w-full mt-6">
            <Button
              size="lg"
              variant="outline"
              type="button"
              onClick={() => router.push("/customers")}
            >
              Cancel
            </Button>
            <Button size="lg" type="submit" className="bg-primary text-white">
              Update
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
            <Card
              className={cn(
                "w-full   shadow-sm hover:shadow-md transition-shadow flex flex-col"
              )}
            >
              <CardHeader className="flex flex-col gap-[0.5px]">
                <h3 className="text-md font-medium mb-2">
                  {supplierType === CustomerType.SUPPLIER ? "Supplier" : "Customer"} Details
                </h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Edit your {supplierType === CustomerType.SUPPLIER ? "supplier" : "customer"} details here
                </p>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {renderFormField("customer_type", ({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Customer / Supplier<span className="text-red-500">*</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select Customer" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(CustomerType).map((customer) => (
                          <SelectItem key={customer} value={customer}>
                            {customer.charAt(0).toUpperCase() +
                              customer.slice(1).toLowerCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                ))}
                <div className="flex flex-row gap-4">
                  {renderFormField("companyName", ({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>
                        Company Name<span className="text-red-500">*</span>
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
                        <Input placeholder="Enter Company Phone" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  ))}
                </div>
                {renderFormField("address", ({ field }) => (
                  <FormItem>
                    <FormLabel>{supplierType === CustomerType.SUPPLIER ? "Supplier" : "Customer"} Address</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={`Enter ${supplierType === CustomerType.SUPPLIER ? "Supplier" : "Customer"} Address`}
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
                        <Input placeholder="Enter Company Email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  ))}
                  {renderFormField("creditPeriod", ({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Credit Period (For Suppliers)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter Credit Period"
                          disabled={supplierType === CustomerType.CUSTOMER}
                          className={
                            supplierType === CustomerType.CUSTOMER
                              ? "bg-muted cursor-not-allowed"
                              : ""
                          }
                          {...field}
                        />
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
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Vat Type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(VatType).map((customer) => (
                            <SelectItem key={customer} value={customer}>
                              {customer}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  ))}
                  {renderFormField("vat_no", ({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>VAT No</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter VAT No" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  ))}
                </div>
                {renderFormField("logoUrl", ({ field: _field }) => (
                  <FormItem>
                    <FormLabel>Company Logo</FormLabel>
                    <FormControl>
                      <div>
                        <div
                          className="border-2 border-dashed rounded-lg p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:border-gray-400 transition-colors"
                          onClick={() => fileInputRef.current?.click()}
                          onDrop={handleDrop}
                          onDragOver={(e) => e.preventDefault()}
                        >
                          <CloudUpload className="h-10 w-10 text-muted-foreground mb-2" />
                          <p className="text-sm font-medium">
                            Drag your file(s) or{" "}
                            <span className="font-bold underline">browse</span>
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Max 10 MB files are allowed
                          </p>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept=".jpg,.jpeg,.png,.svg,.zip"
                            className="hidden"
                            onChange={(e) =>
                              handleFileSelect(e.target.files?.[0] || null)
                            }
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-2 mb-3">
                          Only support .jpg, .png and .svg and zip files
                        </p>

                        {/* File Preview */}
                        {uploadedFile && (
                          <div className="mt-4 border rounded-lg p-3 flex items-center justify-between bg-gray-50">
                            <div className="flex items-center gap-3">
                              <div className="bg-blue-100 p-2 rounded">
                                <FileArchive className="h-6 w-6 text-blue-600" />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-sm font-medium">
                                  {uploadedFile.name}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {formatFileSize(uploadedFile.size)}
                                </span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={removeFile}
                              className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                            >
                              <X className="h-5 w-5 text-gray-600" />
                            </button>
                          </div>
                        )}
                      </div>
                    </FormControl>
                  </FormItem>
                ))}
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card
                className={cn(
                  "w-full shadow-sm hover:shadow-md transition-shadow flex flex-col"
                )}
              >
                <CardHeader className="flex flex-row items-center justify-between">
                  <div className="flex flex-col gap-[0.5px]">
                    <h3 className="text-md font-medium mb-2">Point of Contacts</h3>
                    <p className="text-xs text-muted-foreground mb-4">
                      Add and manage your contact persons here
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendContact({ name: "", email: "", phone: "" })}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Contact
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                  {contactFields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 pr-14 border rounded-lg relative bg-accent/5">
                      {contactFields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeContact(index)}
                          className="absolute top-4 right-4 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                      {renderFormField(`contactPersons.${index}.name`, ({ field }) => (
                        <FormItem>
                          <FormLabel>Name <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input placeholder="Contact Name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      ))}
                      {renderFormField(`contactPersons.${index}.email`, ({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="Email Address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      ))}
                      {renderFormField(`contactPersons.${index}.phone`, ({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input placeholder="Phone Number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      ))}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default EditCustomerRelationship;

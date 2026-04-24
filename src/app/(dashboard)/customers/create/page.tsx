"use client";

import { getErrorMessage } from "@/lib/error-utils";

import PageTitleWithBreadcrumb from "@/components/shared/page-title-with-breadcrumb";
import { customerSchema } from "@/modules/customer/validation";
import { useRouter } from "next/navigation";
import React, { useRef, useState } from "react";
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

function CreateCustomerRelationship() {
  const router = useRouter();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<{
    name: string;
    email: string;
    avatar: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const baseDefaultValues: CustomerFormValues = {
    customer_type: CustomerType.CUSTOMER,
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

  const {
    fields: contactFields,
    append: appendContact,
    remove: removeContact,
  } = useFieldArray({
    control: form.control,
    name: "contactPersons",
  });

  React.useEffect(() => {
    const userData = getUser();
    if (userData) {
      const name = userData.name || "User";
      setUser({
        name: name,
        email: userData.email,
        avatar: "",
      });
      form.setValue("created_by", name);
      form.setValue("updated_by", name);
    }
  }, [form]);

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
        contact_persons: JSON.stringify(
          data.contactPersons.map((cp) => ({
            name: cp.name,
            email: cp.email ?? "",
            phone: cp.phone ?? "",
          }))
        ),
        created_by: user?.name || "User",
        updated_by: user?.name || "User",
        status: "CREATED",
      };
      const response = await CustomerApi.create(payload);

      toast(`Customer Created`, {
        description: `The customer has been created successfully.`,
      });
      form.reset(baseDefaultValues);
      form.clearErrors();
      router.push("/customers");
    } catch (error) {
      console.error("Failed to submit entity:", error);
      toast(`Failed to Create Customer`, {
        description: getErrorMessage(
          error,
          `An error occurred while creating the customer. Please try again.`
        ),
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

  const customerType = form.watch("customer_type");
  return (
    <div className="flex flex-1 flex-col gap-4 p-[24px] pt-0 mt-3">
      {isLoading && <FullPageLoader />}
      <PageTitleWithBreadcrumb
        title={`Create Customer`}
        breadcrumbs={[
          { title: "Dashboard", href: "/dashboard" },
          { title: "Customer", href: "/customers" },
        ]}
      />

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
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
              Save
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            <Card
              className={cn(
                "w-full   shadow-sm hover:shadow-md transition-shadow flex flex-col"
              )}
            >
              <CardHeader className="flex flex-col gap-[0.5px]">
                <h3 className="text-md font-medium mb-2">Customer Details</h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Add your customer details here
                </p>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {renderFormField("customer_type", ({ field }) => (
                  <FormItem>
                    <FormLabel>Customer Type</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter Customer Type"
                        readOnly
                        {...field}
                      />
                    </FormControl>
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
                    <FormLabel>Customer Address</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={`Enter Customer Address`}
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
                </div>
                <div className="flex flex-row gap-4">
                  {renderFormField("vat_type", ({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Vat Type</FormLabel>
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
                      <Plus className="h-4 w-4" />
                      Add Contact
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
                            className="absolute top-4 right-4 text-destructive hover:text-destructive hover:bg-destructive/10"
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
                                <Input placeholder="Email Address" {...field} />
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
                                <Input placeholder="Phone Number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                {renderFormField("logoUrl", ({ field }) => (
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
          </div>
        </form>
      </Form>
    </div>
  );
}

export default CreateCustomerRelationship;

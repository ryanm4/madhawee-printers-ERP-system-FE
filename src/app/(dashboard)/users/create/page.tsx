"use client";
import PageTitleWithBreadcrumb from "@/components/shared/page-title-with-breadcrumb";
import React, { useState } from "react";
import { userSchema } from "@/modules/users/validation";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { FieldPath, SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CREATE_USER } from "@/modules/users/types";
import { userApi } from "@/modules/users/api";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/error-utils";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { FullPageLoader } from "@/components/shared/loader";

type UserFormValues = z.infer<typeof userSchema>;

function CreateUser() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const baseDefaultValues: UserFormValues = {
    user_role: "",
    name: "",
    email: "",
    password: "",
  };
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: baseDefaultValues,
  });

  const onSubmit: SubmitHandler<UserFormValues> = async (data) => {
    debugger;
    try {
      setIsLoading(true);
      const payload: CREATE_USER = {
        user_role: data.user_role,
        name: data.name,
        email: data.email,
        password: data.password,
      };
      const response = await userApi.create(payload);

      toast("User Created", {
        description: "The user record has been created successfully.",
      });
      form.reset(baseDefaultValues);
      form.clearErrors();
      router.push("/users");
    } catch (error) {
      console.error("Failed to create user:", error);
      toast("Failed to Create User", {
        description: getErrorMessage(error, "An error occurred while creating the user record. Please try again."),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderFormField = <TName extends FieldPath<UserFormValues>>(
    name: TName,
    render: Parameters<typeof FormField<UserFormValues, TName>>["0"]["render"]
  ) => <FormField control={form.control} name={name} render={render} />;
  return (
    <div className="flex flex-1 flex-col gap-4 p-[24px] pt-0 mt-3">
      {isLoading && <FullPageLoader />}
      <PageTitleWithBreadcrumb
        title="Create User"
        breadcrumbs={[
          { title: "Dashboard", href: "/dashboard" },
          { title: "Users", href: "/users" },
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
              onClick={() => router.push("/users")}
            >
              Cancel
            </Button>
            <Button size="lg" type="submit" className="bg-primary text-white">
              Save
            </Button>
          </div>

          <Card
            className={cn(
              "w-full   shadow-sm hover:shadow-md transition-shadow flex flex-col"
            )}
          >
            <CardHeader className="flex flex-col gap-[0.5px]">
              <h3 className="text-md font-medium mb-2">User Details</h3>
              <p className="text-xs text-muted-foreground mb-4">
                Edit your user details here
              </p>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {renderFormField("user_role", ({ field }) => (
                <FormItem>
                  <FormLabel>User Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select User Type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              ))}
              {renderFormField("name", ({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              ))}
              {renderFormField("email", ({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter Email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              ))}
              {renderFormField("password", ({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter Password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              ))}
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  );
}

export default CreateUser;

"use client";

import PageTitleWithBreadcrumb from "@/components/shared/page-title-with-breadcrumb";
import React, { useEffect, useState } from "react";
import { editUserSchema } from "@/modules/users/validation";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { FieldPath, SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
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
import { userApi } from "@/modules/users/api";
import { GET_ALL_USER } from "@/modules/users/types";
import { FullPageLoader } from "@/components/shared/loader";

type UserFormValues = z.infer<typeof editUserSchema>;

function EditUser() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [editingUser, setEditingUser] = useState<GET_ALL_USER | null>(null);

  const baseDefaultValues: UserFormValues = {
    user_role: "",
    name: "",
    email: "",
    password: "",
  };

  const form = useForm<UserFormValues>({
    resolver: zodResolver(editUserSchema),
    defaultValues: baseDefaultValues,
  });

  // 🔥 LOAD USER FROM sessionStorage
  useEffect(() => {
    const stored = sessionStorage.getItem("editUser");

    if (!stored) {
      router.push("/users");
      return;
    }

    const user: GET_ALL_USER = JSON.parse(stored);
    setEditingUser(user);

    form.reset({
      user_role: (user.user_role || "").toLowerCase().trim(),
      name: user.name,

      email: user.email,
      password: "", // keep empty on edit
    });
  }, [form, router]);

  // ✅ SUBMIT (UPDATE)
  const onSubmit: SubmitHandler<UserFormValues> = async (data) => {
    if (!editingUser) return;

    try {
      setIsLoading(true);

      await userApi.update(editingUser.id, {
        user_role: data.user_role,
        name: data.name,
        email: data.email,
      });

      toast("User Updated", {
        description: "The user record has been updated successfully.",
      });

      sessionStorage.removeItem("editUser");
      router.push("/users");
    } catch (error) {
      console.error(error);
      toast("Failed to Update User", {
        description: "An error occurred while updating the user.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderFormField = <TName extends FieldPath<UserFormValues>>(
    name: TName,
    render: Parameters<typeof FormField<UserFormValues, TName>>[0]["render"]
  ) => <FormField control={form.control} name={name} render={render} />;

  return (
    <div className="flex flex-1 flex-col gap-4 p-[24px] pt-0 mt-3">
      {isLoading && <FullPageLoader />}
      <PageTitleWithBreadcrumb
        title="Edit User"
        breadcrumbs={[
          { title: "Dashboard", href: "/dashboard" },
          { title: "Users", href: "/users" },
        ]}
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex items-center justify-end gap-4 mt-6">
            <Button
              size="lg"
              variant="outline"
              type="button"
              onClick={() => router.push("/users")}
            >
              Cancel
            </Button>
            <Button size="lg" type="submit" disabled={isLoading}>
              Save
            </Button>
          </div>

          <Card className={cn("w-full shadow-sm")}>
            <CardHeader>
              <h3 className="text-md font-medium mb-2">Edit User Details</h3>
              <p className="text-xs text-muted-foreground">
                Update your user details here
              </p>
            </CardHeader>

            <CardContent className="flex flex-col gap-4">
              {renderFormField("user_role", ({ field }) => (
                <FormItem>
                  <FormLabel>User Type</FormLabel>
                  <Select
                    key={field.value}
                    onValueChange={field.onChange}
                    value={field.value}
                    defaultValue={field.value}
                  >
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
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              ))}

              {renderFormField("email", ({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} />
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

export default EditUser;

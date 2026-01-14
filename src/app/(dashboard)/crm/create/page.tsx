"use client"

import PageTitleWithBreadcrumb from '@/common/PageTitileWithBreadCrumb'
import { customerSchema } from '@/lib/formSchema'
import { useRouter } from 'next/navigation'
import React, { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { CloudUpload, FileArchive, X } from 'lucide-react'

type CustomerFormValues = z.infer<typeof customerSchema>

function CreateCustomerRelationship() {
    const router = useRouter()
    const [uploadedFile, setUploadedFile] = useState<File | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const baseDefaultValues: CustomerFormValues = {
        customerName: "",
        companyName: "",
        address: "",
        phone: "",
        email: "",
        creditPeriod: "",
        SVAT_reg_no: "",
        VAT_reg_no: "",
        logoUrl: "",
        contactPerson: "",
        contactPersonEmail: "",
        contactPersonPhone: "",
    }

    const form = useForm<CustomerFormValues>({
        resolver: zodResolver(customerSchema),
        defaultValues: baseDefaultValues,

    })


    const handleFileSelect = (file: File | null) => {
        if (file) {
            const validTypes = ["image/jpeg", "image/png", "image/svg+xml", "application/zip"]
            const maxSize = 10 * 1024 * 1024 // 10MB

            if (validTypes.includes(file.type) && file.size <= maxSize) {
                setUploadedFile(file)
            } else {
                alert("Invalid file type or size. Please upload a .jpg, .png, .svg, or .zip file under 10MB.")
            }
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        const file = e.dataTransfer.files[0]
        handleFileSelect(file)
    }

    const removeFile = () => {
        setUploadedFile(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
    }

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return "0 Bytes"
        const k = 1024
        const sizes = ["Bytes", "KB", "MB", "GB"]
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + sizes[i]
    }

    function onSubmit(data: CustomerFormValues) {
        console.log("Submitting PO Data:", data)
        form.reset(baseDefaultValues)
        form.clearErrors()
    }
    return (
        <div className='flex flex-1 flex-col gap-4 p-[24px] pt-0 mt-3'>
            <PageTitleWithBreadcrumb
                title="Create Customer"
                breadcrumbs={[
                    { title: "Dashboard", href: "/dashboard" },
                    { title: "Customer Relationship Management", href: "/crm" },

                ]}
            />

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6  pb-0'>
                    <div className="flex items-center justify-end gap-[16px] sm:justify-end w-full mt-6">
                        <Button size="lg" variant="outline" type="button" onClick={() => router.push("/crm")}>Cancel</Button>
                        <Button size="lg" type="submit" className="bg-black text-white">Save</Button>
                    </div>


                    <div className='grid grid-cols-2 md:grid-cols-2 gap-4'>
                        <Card className={cn("w-full   shadow-sm hover:shadow-md transition-shadow flex flex-col")}>
                            <CardHeader className="flex flex-col gap-[0.5px]">
                                <h3 className="text-md font-medium mb-2">Customer</h3>
                                <p className="text-xs text-muted-foreground mb-4">Add your customer details here</p>

                            </CardHeader>
                            <CardContent className='flex flex-col gap-4'>

                                <FormField control={form.control} name="customerName" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Customer Name</FormLabel>
                                        <FormControl><Input placeholder="Enter Customer Name" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <div className='flex flex-row gap-4'>
                                    <FormField control={form.control} name="companyName" render={({ field }) => (
                                        <FormItem className='w-full'>
                                            <FormLabel>Company Name<span className="text-red-500">*</span></FormLabel>
                                            <FormControl><Input placeholder="Enter Company Name" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="phone" render={({ field }) => (
                                        <FormItem className='w-full'>
                                            <FormLabel>Company Phone</FormLabel>
                                            <FormControl><Input placeholder="Enter Company Phone" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                </div>
                                <FormField control={form.control} name="address" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Customer Address</FormLabel>
                                        <FormControl><Textarea placeholder="Enter Customer Address" className="resize-none" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <div className='flex flex-row gap-4'>
                                    <FormField control={form.control} name="email" render={({ field }) => (
                                        <FormItem className='w-full'>
                                            <FormLabel>Company Email</FormLabel>
                                            <FormControl><Input placeholder="Enter Company Email" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="creditPeriod" render={({ field }) => (
                                        <FormItem className='w-full'>
                                            <FormLabel>Credit Period (For Suppliers)</FormLabel>
                                            <FormControl><Input placeholder="Enter Credit Period" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                </div>
                                <div className='flex flex-row gap-4'>
                                    <FormField control={form.control} name="SVAT_reg_no" render={({ field }) => (
                                        <FormItem className='w-full'>
                                            <FormLabel>SVAT Reg No</FormLabel>
                                            <FormControl><Input placeholder="Enter SVAT Reg No" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="VAT_reg_no" render={({ field }) => (
                                        <FormItem className='w-full'>
                                            <FormLabel>VAT Reg No</FormLabel>
                                            <FormControl><Input placeholder="Enter VAT Reg No" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />

                                </div>
                                <FormField control={form.control} name="logoUrl" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Company Logo
                                        </FormLabel>
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
                                                        Drag your file(s) or <span className="font-bold underline">browse</span>
                                                    </p>
                                                    <p className="text-xs text-muted-foreground mt-1">Max 10 MB files are allowed</p>
                                                    <input
                                                        ref={fileInputRef}
                                                        type="file"
                                                        accept=".jpg,.jpeg,.png,.svg,.zip"
                                                        className="hidden"
                                                        onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
                                                    />
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-2 mb-3">Only support .jpg, .png and .svg and zip files</p>

                                                {/* File Preview */}
                                                {uploadedFile && (
                                                    <div className="mt-4 border rounded-lg p-3 flex items-center justify-between bg-gray-50">
                                                        <div className="flex items-center gap-3">
                                                            <div className="bg-blue-100 p-2 rounded">
                                                                <FileArchive className="h-6 w-6 text-blue-600" />
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-medium">{uploadedFile.name}</span>
                                                                <span className="text-xs text-muted-foreground">{formatFileSize(uploadedFile.size)}</span>
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
                                )} />


                            </CardContent>
                        </Card>

                        <div className='grid grid-rows-2 md:grid-rows-2 gap-4'>
                            <Card className={cn("w-full   shadow-sm hover:shadow-md transition-shadow flex flex-col")}>
                                <CardHeader className="flex flex-col gap-[0.5px]">
                                    <h3 className="text-md font-medium mb-2">Contact Person One</h3>
                                    <p className="text-xs text-muted-foreground mb-4">Add your contact person details here</p>

                                </CardHeader>
                                <CardContent className='flex flex-col gap-4'>
                                    <FormField control={form.control} name="contactPerson" render={({ field }) => (
                                        <FormItem >
                                            <FormLabel>Contact Person Name</FormLabel>
                                            <FormControl><Input placeholder="Enter your name" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="contactPersonEmail" render={({ field }) => (
                                        <FormItem >
                                            <FormLabel>Contact Person Email</FormLabel>
                                            <FormControl><Input placeholder="Enter your email" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="contactPersonPhone" render={({ field }) => (
                                        <FormItem >
                                            <FormLabel>Contact Person Phone</FormLabel>
                                            <FormControl><Input placeholder="Enter your phone" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />

                                </CardContent>
                            </Card>
                            <Card className={cn("w-full   shadow-sm hover:shadow-md transition-shadow flex flex-col")}>
                                <CardHeader className="flex flex-col gap-[0.5px]">
                                    <h3 className="text-md font-medium mb-2">Contact Person Two</h3>
                                    <p className="text-xs text-muted-foreground mb-4">Add your contact person details here</p>

                                </CardHeader>
                                <CardContent className='flex flex-col gap-4'>

                                </CardContent>
                            </Card>
                        </div>
                    </div>


                </form>
            </Form>
        </div>
    )
}

export default CreateCustomerRelationship
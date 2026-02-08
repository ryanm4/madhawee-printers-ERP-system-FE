"use client"
import { Combobox } from '@/components/shared/combobox'
import PageTitleWithBreadcrumb from '@/components/shared/page-title-with-breadcrumb'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PRODUCT_TYPES, REPORT_TYPES } from '@/config/enum'
import { cn } from '@/lib/utils'
import { CustomerApi } from '@/modules/customer/api'
import { CUSTOMER } from '@/modules/customer/types'
import { ReportsApi } from '@/modules/reports/api'
import { CREATE_REPORT } from '@/modules/reports/types'
import { ReportSchema } from '@/modules/reports/validations'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { FieldPath, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'


type ReportsFormValues = z.infer<typeof ReportSchema>
function ReportsPage() {

    const [customer, setCustomer] = useState<CUSTOMER[]>([])
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState([])

    useEffect(() => {
        getCustomerList();
    }, []);

    const getCustomerList = async () => {
        try {
            setLoading(true);
            const response = await CustomerApi.getAll();
            console.log(response);
            setCustomer(response.data);

        } catch (error) {
            console.error('Failed to fetch POs');
        } finally {
            setLoading(false);
        }
    }

    const baseDefaultValues: ReportsFormValues = {
        reportType: "",
        filters: {
            fromDate: new Date().toISOString().split('T')[0],
            toDate: new Date().toISOString().split('T')[0],
            customer_id: undefined,
            status: "",
            product_type: "",
        },
    };

    const form = useForm<ReportsFormValues>({
        resolver: zodResolver(ReportSchema),
        defaultValues: baseDefaultValues,
    });

    const renderFormField = <TName extends FieldPath<ReportsFormValues>>(
        name: TName,
        render: Parameters<typeof FormField<ReportsFormValues, TName>>["0"]["render"]
    ) => (
        <FormField
            control={form.control}
            name={name}
            render={render}
        />
    );

    async function onSubmit(data: ReportsFormValues) {
        try {
            setLoading(true);
            const payload: CREATE_REPORT = {
                reportType: data?.reportType,
                filters: {
                    fromDate: data.filters.fromDate
                        ? new Date(data.filters.fromDate)
                        : new Date(),
                    toDate: data.filters.toDate
                        ? new Date(data.filters.toDate)
                        : new Date(),
                    customer_id: data.filters.customer_id,
                    status: data.filters.status,
                    product_type: data.filters.product_type,
                },
            }

            const response = await ReportsApi.create(payload)
            toast("Report Generated", {
                description: `Report has been generated successfully.`,
            })
            form.clearErrors()
        } catch (error) {
            console.error('Failed to fetch POs');
            toast("Failed to Create Report", {
                description: "An error occurred while creating the report. Please try again.",
            })
        } finally {
            setLoading(false);
        }
    }

    const handleReset = () => {
        form.reset({
            reportType: "",
            filters: {
                fromDate: new Date().toISOString().split('T')[0],
                toDate: new Date().toISOString().split('T')[0],
                customer_id: undefined,
                status: "",
                product_type: "",
            },
        });
    };
    return (
        <div className="flex flex-1 flex-col gap-4 p-[24px] pt-0 mt-3">
            <PageTitleWithBreadcrumb
                title="Reports Management"
                breadcrumbs={[
                    { title: "Dashboard", href: "/dashboard" }
                ]}
            />

            <Form {...form}>

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                    <div className='flex flex-wrap gap-4 mt-5 items-end'>
                        {renderFormField("reportType", ({ field }) => (
                            <FormItem className="w-[250px]">
                                <FormLabel>Report Type</FormLabel>

                                <Combobox
                                    items={Object.entries(REPORT_TYPES).map(([key, reportType]) => ({
                                        value: key,   // string ✔
                                        label: reportType,
                                    }))}
                                    value={field.value ?? ""}
                                    onValueChange={(value) => field.onChange(value)}
                                    placeholder="Select Report Type"
                                    searchPlaceholder="Search report type..."
                                />


                            </FormItem>
                        ))}


                        {renderFormField("filters.customer_id", ({ field }) => (
                            <FormItem className="w-[200px]">
                                <FormLabel>Customer</FormLabel>
                                <FormControl>
                                    <Combobox
                                        items={customer.map(c => ({
                                            value: String(c.customer_id),
                                            label: c.company_name,
                                        }))}
                                        value={field.value ? String(field.value) : ""}
                                        onValueChange={(value) => {
                                            field.onChange(Number(value));
                                        }}
                                        placeholder="Select Customer"
                                        searchPlaceholder="Search customer..."
                                        className="h-10"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        ))}

                        {renderFormField("filters.fromDate", ({ field }) => (
                            <FormItem className="w-[200px]">
                                <FormLabel>From Date</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant="outline"
                                                className={cn(
                                                    "w-full h-10 pl-3 text-left font-normal",
                                                    !field.value && "text-muted-foreground"
                                                )}
                                            >
                                                {field.value
                                                    ? format(new Date(field.value), "PPP")
                                                    : "Select date"}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={field.value ? new Date(field.value) : undefined}
                                            onSelect={(date) => {
                                                field.onChange(
                                                    date ? format(date, "yyyy-MM-dd") : undefined
                                                );
                                            }}
                                            captionLayout="dropdown"
                                        />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        ))}

                        {renderFormField("filters.toDate", ({ field }) => (
                            <FormItem className="w-[200px]">
                                <FormLabel>To Date</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant="outline"
                                                className={cn(
                                                    "w-full h-10 pl-3 text-left font-normal",
                                                    !field.value && "text-muted-foreground"
                                                )}
                                            >
                                                {field.value
                                                    ? format(new Date(field.value), "PPP")
                                                    : "Select date"}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={field.value ? new Date(field.value) : undefined}
                                            onSelect={(date) => {
                                                field.onChange(
                                                    date ? format(date, "yyyy-MM-dd") : undefined
                                                );
                                            }}
                                            captionLayout="dropdown"
                                        />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        ))}

                        {renderFormField("filters.product_type", ({ field }) => (
                            <FormItem className="w-[200px]">
                                <FormLabel>Product Type</FormLabel>

                                <Combobox
                                    items={Object.entries(PRODUCT_TYPES).map(([key, productType]) => ({
                                        value: key,   // string ✔
                                        label: productType,
                                    }))}
                                    value={field.value ?? ""}
                                    onValueChange={(value) => field.onChange(value)}
                                    placeholder="Select Product Type"
                                    searchPlaceholder="Search product type..."
                                />

                                <FormMessage />
                            </FormItem>
                        ))}


                        <Button variant="outline" type="button" className="h-10" onClick={handleReset}>Reset</Button>
                        <Button type="submit" className="bg-primary text-white h-10">Generate Report</Button>
                    </div>

                </form>
            </Form>

        </div>
    )
}

export default ReportsPage
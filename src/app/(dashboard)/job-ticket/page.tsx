import PageTitleWithBreadcrumb from "@/common/PageTitileWithBreadCrumb";
import React from "react";

function JobTicketComponent() {
    return (
        <div className="flex flex-1 flex-col gap-4 p-[24px] pt-0 mt-3">
            <PageTitleWithBreadcrumb
                title="Job Ticket Management"
                breadcrumbs={[
                    { title: "Dashboard", href: "/dashboard" }
                ]}
            />
            <div>I am Job Ticket Management</div>
        </div>
    );
}

export default JobTicketComponent;

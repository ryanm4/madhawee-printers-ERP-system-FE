"use client";
import PageTitleWithBreadcrumb from "@/components/shared/page-title-with-breadcrumb";
import { getErrorMessage } from "@/lib/error-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { issueNotesApi } from "@/modules/inventory/issue-notes/api";
import { PlusIcon, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { DataTable } from "./_components/issue_notes_table";
import { issueNotesColumns } from "./_components/issue_notes_columns";
import { IssueNote } from "@/modules/inventory/issue-notes/types";
import { toast } from "sonner";
import { EmptyState } from "@/components/shared/empty-page";
import { ExportButton } from "@/components/shared/export-button";
import { PageLoader } from "@/components/shared/loader";
import { DeleteConfirmationDialog } from "@/components/shared/delete-confirmation-dialog";
import { useMemo } from "react";
import { generateIssueNotePdf } from "@/modules/inventory/issue-notes/pdf-utils";
import { jobTicketsApi } from "@/modules/job-tickets/api";

function IssueNotesManagement() {
  const router = useRouter();
  const [data, setData] = useState<IssueNote[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");

  const [jobs, setJobs] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    fetchData();
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await jobTicketsApi.getAll();
      if (response.status === 200) {
        setJobs(
          response.data.map((job: any) => ({
            id: job.job_id,
            name: job.job_name,
          }))
        );
      }
    } catch (error) {
      console.error("Failed to fetch jobs", error);
    }
  };

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await issueNotesApi.getAll();

      if (response.status === 200) {
        setData(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch Issue Materials data", error);
      toast(getErrorMessage(error, "Failed to fetch Issue Materials data"));
    } finally {
      setIsLoading(false);
    }
  };

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handlers = useMemo(() => ({
    onView: (id: number | string) => {
      router.push(`/inventory/issue-notes/${id}`);
    },
    onEdit: (id: number | string) => {
      router.push(`/inventory/issue-notes/${id}/edit`);
    },
    onDelete: (id: number | string) => {
      setSelectedId(id);
      setIsDeleteDialogOpen(true);
    },
    onDownload: (material: IssueNote) => {
      generateIssueNotePdf(material);
      toast.success("Downloading Issue Material PDF...");
    },
  }), [router]);

  const columns = useMemo(() => issueNotesColumns(handlers), [handlers]);

  const handleDelete = async () => {
    if (!selectedId) return;
    try {
      setIsDeleting(true);
      const response = await issueNotesApi.delete(selectedId.toString());
      if (response.status === 200 || response.status === 204) {
        toast.success("Issue Material deleted successfully");
        fetchData();
      }
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to delete Issue Note"));
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setSelectedId(null);
    }
  };

  return (
    <>
      <div className="flex flex-1 flex-col gap-4 p-[24px] pt-0 mt-3">
        <PageTitleWithBreadcrumb
          title="Issue Material"
          breadcrumbs={[
            { title: "Dashboard", href: "/dashboard" },
          ]}
        />
        <div className="flex flex-row justify-end gap-[24px]">
          <div className="relative w-[320px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by Collector or ID"
              className="w-full pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <ExportButton data={data} filename="issue-notes-list" />
          <Button onClick={() => router.push("/inventory/issue-notes/create")}>
            <PlusIcon /> Create New Issue Material
          </Button>
        </div>
        {isLoading ? (
          <PageLoader />
        ) : data.length === 0 ? (
          <EmptyState
            title="No Issue Materials Found"
            description="You haven't recorded any Issue Materials yet."
            createLabel="Create New Issue Material"
            createPath="/inventory/issue-notes/create"
          />
        ) : (
          <DataTable
            columns={columns}
            data={data.map(item => ({
              ...item,
              job_name: jobs.find(j => j.id === item.job_id)?.name || (item.job_id ? `Job #${item.job_id}` : "-")
            }))}
            searchValue={search}
          />
        )}
      </div>

      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
        title="Delete Issue Material"
        description="Are you sure you want to delete this Issue Material? This action cannot be undone."
        loading={isDeleting}
      />
    </>
  );
}

export default IssueNotesManagement;

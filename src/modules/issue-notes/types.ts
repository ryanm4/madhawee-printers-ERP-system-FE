export interface IssueNoteItem {
    id?: number;
    issue_note_id?: number;
    item_id: number;
    quantity: string | number;
    [key: string]: unknown;
}

export interface IssueNote {
    id: number;
    date: string;
    remarks: string;
    collector_name: string;
    job_id: number;
    job_name?: string;
    items: IssueNoteItem[];
    [key: string]: unknown;
}

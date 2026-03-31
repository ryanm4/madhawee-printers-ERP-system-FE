export interface IssueNoteItem {
    id: number;
    issue_note_id: number;
    item_name: string;
    quantity: string;
}

export interface IssueNote {
    id: number;
    date: string;
    remarks: string;
    collector_name: string;
    job_id: number;
    job_name?: string;
    items: IssueNoteItem[];
}

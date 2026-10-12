import apiClient from '@/lib/axios-client';

/** Company details printed on quotations */
export interface CompanySettings {
    company_name: string;
    company_address: string;
    company_phone: string;
    company_email: string;
    company_website: string;
    company_registration_number: string;
    vat_registration_number: string;
    quotation_terms: string;
}

export type OptionListKey =
    | 'item_category'
    | 'item_sub_category'
    | 'unit_of_measure'
    | 'product_type'
    | 'coating_type'
    | 'plate_status'
    | 'ink_status';

export interface OptionValue {
    id: number;
    list_key: OptionListKey;
    /** What documents store. Never changes, so renaming keeps old records matching. */
    value: string;
    /** What people see. Safe to rename. */
    label: string;
    sort_order: number;
    is_active: boolean;
}

export interface OptionListDefinition {
    key: OptionListKey;
    label: string;
    description: string;
    is_workflow_state?: boolean;
}

export interface OptionListsResponse {
    definitions: OptionListDefinition[];
    lists: Record<OptionListKey, OptionValue[]>;
}

export interface BankAccount {
    id: number;
    bank_name: string;
    branch_name: string | null;
    account_name: string;
    account_number: string;
    swift_code: string | null;
    currency: string;
    notes: string | null;
    is_default: boolean;
    is_active: boolean;
}

export type BankAccountInput = Partial<Omit<BankAccount, 'id'>>;

/** How one kind of job ticket is numbered, e.g. MPL/####/YY/TIEP */
export interface NumberFormat {
    doc_type: string;
    label: string;
    template: string;
}

export const SettingsApi = {
    getCurrencyRate: () => apiClient.get<{ rate: number }>('/api/currency/rate'),
    updateCurrencyRate: (data: { rate: number }) => apiClient.put('/api/currency/rate', data),

    getCompany: () => apiClient.get<CompanySettings>('/api/settings/company'),
    updateCompany: (data: Partial<CompanySettings>) =>
        apiClient.put<CompanySettings>('/api/settings/company', data),

    getOptionLists: (includeInactive = false) =>
        apiClient.get<OptionListsResponse>('/api/settings/option-lists', { params: { includeInactive } }),
    createOption: (listKey: OptionListKey, label: string) =>
        apiClient.post<OptionValue>(`/api/settings/option-lists/${listKey}`, { label }),
    updateOption: (listKey: OptionListKey, id: number, data: { label?: string; is_active?: boolean }) =>
        apiClient.put<OptionValue>(`/api/settings/option-lists/${listKey}/${id}`, data),

    getBankAccounts: (includeInactive = false) =>
        apiClient.get<BankAccount[]>('/api/settings/bank-accounts', { params: { includeInactive } }),
    createBankAccount: (data: BankAccountInput) =>
        apiClient.post<BankAccount>('/api/settings/bank-accounts', data),
    updateBankAccount: (id: number, data: BankAccountInput) =>
        apiClient.put<BankAccount>(`/api/settings/bank-accounts/${id}`, data),
    setDefaultBankAccount: (id: number) =>
        apiClient.put<BankAccount>(`/api/settings/bank-accounts/${id}/default`),
    deleteBankAccount: (id: number) => apiClient.delete(`/api/settings/bank-accounts/${id}`),

    getNumberFormats: () => apiClient.get<NumberFormat[]>('/api/settings/document-numbering'),
    updateNumberFormat: (docType: string, template: string) =>
        apiClient.put<NumberFormat>(`/api/settings/document-numbering/${docType}`, { template }),
};

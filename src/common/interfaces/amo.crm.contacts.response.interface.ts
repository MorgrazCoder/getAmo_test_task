export interface AmoCrmContactsResponseInterface {
    _page: number;
    _links: {
        self: {
            href: string;
        };
    };
    _embedded: {
        contacts: AmoCrmContactInterface[];
    };
}

interface AmoCrmContactInterface {
    id: number;
    name: string;
    first_name: string;
    last_name: string;
    responsible_user_id: number;
    group_id: number;
    created_by: number;
    updated_by: number;
    created_at: number;
    updated_at: number;
    closest_task_at: null;
    is_deleted: false;
    is_unsorted: false;
    custom_fields_values: AmoCrmCustomField[];
    account_id: number;
    _links: {
        self: {
            href: string;
        };
    };
    _embedded: {
        tags: [];
        companies: [];
    };
}

interface AmoCrmCustomField {
    field_id: number;
    field_name: string;
    field_code: string;
    field_type: string;
    values: AmoCrmCustomValue[];
}

interface AmoCrmCustomValue {
    value: string;
    enum_id: number;
    enum_code: string;
}

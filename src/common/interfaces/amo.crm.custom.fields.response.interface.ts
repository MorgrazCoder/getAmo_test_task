export interface AmoCrmCustomFieldsResponseInterface {
    _total_items: number;
    _page: number;
    _page_count: number;
    _links: {
        self: {
            href: string;
        };
        next: {
            href: string;
        };
        last: {
            href: string;
        };
    };
    _embedded: {
        custom_fields: AmoCrmCustomField[];
    };
}

interface AmoCrmCustomField {
    id: number;
    code: string;
}

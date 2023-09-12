export interface AmoCrmLeadsResponseInterface {
    _total_items: number;
    _page: number;
    _page_count: number;
    _links: {
        self: {
            href: string;
        };
    };
    _embedded: {
        leads: AmoCrmLead[];
    };
}

interface AmoCrmLead {
    id: number;
    request_id: string;
    _links: {
        self: {
            href: string;
        };
    };
}

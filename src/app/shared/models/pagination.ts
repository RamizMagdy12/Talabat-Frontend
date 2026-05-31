export interface Pagination<T> {
    pageIndex: number;
    pageSize: number;
    count: number;
    data?: T[];
    items?: T[];
    Data?: T[];
    Items?: T[];
    PageIndex?: number;
    PageSize?: number;
    Count?: number;
}

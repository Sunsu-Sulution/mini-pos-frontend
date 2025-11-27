export interface ErrorResponse {
    error: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isErrorResponse = (data: any): data is ErrorResponse => {
    return typeof data.error === "string";
};

export interface LoginRequest {
    username: string;
    password: string;
}

export interface RegisterRequest {
    username: string;
    name: string;
    password: string;
    store_id: string;
}

export interface RegisterResponse {
    user: User;
}

export interface LoginResponse {
    refresh_token: string;
    access_token: string;
}

export interface User {
    id: string;
    username: string;
    name: string;
    role: "admin" | "user";
    store_id: string;
}

export const initUser = (): User => {
    return {
        id: "",
        username: "",
        name: "",
        role: "user",
        store_id: ""
    }
}

export interface UploadFileResponse {
    url: string;
}

export interface AddProductRequest {
    sku: string;
    name: string;
    price: number;
    can_be_sold: boolean;
    image_url: string;
}

export interface Product {
    id: string;
    sku: string;
    name: string;
    price: number;
    stock: number;
    can_be_sold: boolean;
    image_url: string;
    created_at: string;
    updated_at: string;
    deleted_at: string;
}

export interface Pagination<T> {
    data: T[];
    next_cursor: string;
}

export interface Store {
    id: string;
    store_id: string;
    name: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    deleted_at: string;
}

export interface AddStoreRequest {
    name: string;
    store_id: string;
    is_active: boolean;
}

export interface Inventory {
    id: string;
    store_id: string;
    product_id: string;
    quantity: number;
    reserve: number;
    created_at: string;
    updated_at: string;
    deleted_at: string;
}

export interface InventoryRequest {
    store_id: string;
    product_id: string;
    quantity: number;
}

export interface InventoryMovement {
    id: string;
    description: string;
    source_store_id: string;
    destination_store_id: string;
    product_id: string;
    quantity: number;
    created_at: string;
    updated_at: string;
    deleted_at: string;
}

export interface MoveProductRequest {
    source_store_id: string;
    destination_store_id: string;
    product_id: string;
    quantity: number;
}

export interface MoveProductResponse {
    source_store_id: string;
    destination_store_id: string;
    product_id: string;
    quantity: number;
}

export interface UpdateUserRequest {
    username: string;
    name: string;
    password: string;
    role: "user" | "admin";
    store_id: string;
}

export interface CreateDraftSaleOrderRequest {
    items: CreateDraftSaleOrderLineRequest[];
}

export interface CreateDraftSaleOrderLineRequest {
    product_id: string;
    quantity: number;
}

export interface Charge {
    id: string;
    sale_order_id: string;
    amount: number;
    fee: number;
    fee_vat: number;
    qr_code: string;
    status: "pending" | "failed" | "expired" | "reversed" | "successful";
    expired_at: string;
    created_at: string;
    updated_at: string;
    deleted_at: string;
}

export interface SaleOrderWithOrderLine {
    sale_order: SaleOrder;
    sale_order_line: SaleOrderLine[];
    charge: Charge;
}

export interface SaleOrder {
    id: string;
    number: string;
    store_id: string;
    user_id: string;
    status: "draft" | "submit" | "waiting_payment" | "paid" | "cancelled" | "refunded";
    payment_type: "thai_qr" | "credit_card" | "unspecified";
    transaction_ref: string;
    total_amount: number;
    customer_phone: string;
    customer_email: string;
    sale_cycle_id: string;
    created_at: string;
    updated_at: string;
    deleted_at: string;
}

export interface SaleOrderLine {
    id: string;
    sale_order_id: string;
    product_id: string;
    product_name: string;
    image_url: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    created_at: string;
    updated_at: string;
    deleted_at: string;
}

export interface EditDraftSaleOrderLineRequest {
    phone: string;
    email: string;
    payment_type: "thai_qr" | "credit_card" | "unspecified";
}

export interface EditDraftSaleOrderLineResponse {
    sale_order: SaleOrder;
}

// Omise API types
export interface OmiseChargeResponse {
    id: string;
    status: 'pending' | 'successful' | 'failed' | 'expired' | 'reversed';
    amount: number;
    currency: string;
    paid: boolean;
    authorized: boolean;
    refunded: number;
    failure_code?: string;
    failure_message?: string;
    created_at: string;
    expires_at?: string;
    expired: boolean;
    net: number;
    fee: number;
    fee_vat: number;
}

export interface OmiseErrorResponse {
    error: string;
    code?: string;
}

export interface SummarySale {
    date: string;
    amount_sale: number;
}

export interface SummarySaleResponse {
    result: SummarySale[];
}

export interface GenerateSaleCycleResponse {
    sale_cycle: SaleCycle;
    sale_orders: SaleOrder[];
}

export interface SaleCycle {
    id: string;
    ref_code: string;
    total_amount: number;
    created_at: string;
    updated_at: string;
    deleted_at: string;
}

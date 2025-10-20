import { CreateDraftSaleOrderRequest, EditDraftSaleOrderLineRequest, EditDraftSaleOrderLineResponse, SaleOrder, SaleOrderWithOrderLine, UpdateUserRequest } from './../types/request';
import axios, { AxiosInstance } from "axios";
import { getItem, removeItem, setItem } from "./storage";
import { AddProductRequest, AddStoreRequest, ErrorResponse, initUser, Inventory, InventoryMovement, InventoryRequest, LoginRequest, LoginResponse, MoveProductRequest, MoveProductResponse, Pagination, Product, RegisterRequest, RegisterResponse, Store, UploadFileResponse, User } from "@/types/request";

const handlerError = (
    error: unknown,
    setAlert: (
        message: string,
        type: string,
        action: (() => void) | undefined,
        isOpen: boolean,
    ) => void,
): ErrorResponse => {
    if (axios.isAxiosError(error)) {
        if (error.status === 401) {
            return {
                error: "Session expired. Please login again.",
            };
        } else if (
            error.response &&
            error.response.data &&
            error.response.data.error
        ) {
            setAlert("ข้อผิดพลาด", error.response.data.error, () => { }, false);
            return {
                error: error.response.data.error,
            };
        } else {
            setAlert("ข้อผิดพลาด", error.message, () => { }, false);
            return {
                error: error.message,
            };
        }
    } else {
        setAlert("An unknown error occurred. Try again!", "ข้อผิดพลาด", () => { }, false);
        return {
            error: "An unknow error occurred. try again!",
        };
    }
};

export class BackendClient {
    private readonly client: AxiosInstance;
    private readonly plainClient: AxiosInstance;
    private isRefreshing = false;
    private refreshPromise: Promise<boolean> | null = null;
    private readonly setAlert: (
        message: string,
        type: string,
        action: (() => void) | undefined,
        isOpen: boolean,
    ) => void;

    constructor(
        setAlert: (
            message: string,
            type: string,
            action: (() => void) | undefined,
            isOpen: boolean,
        ) => void,
    ) {
        this.setAlert = setAlert;

        this.client = axios.create({
            baseURL: process.env.NEXT_PUBLIC_BACKEND_PATH,
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${getItem("access_token")}`,
            },
        });

        this.plainClient = axios.create({
            baseURL: process.env.NEXT_PUBLIC_BACKEND_PATH,
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${getItem("refresh_token")}`,
            },
        });

        this.client.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;

                if (
                    error.response &&
                    error.response.status === 401 &&
                    getItem("refresh_token")
                ) {
                    if (!this.isRefreshing) {
                        this.isRefreshing = true;
                        this.refreshPromise = this.refreshAccessTokenSilently().finally(
                            () => {
                                this.isRefreshing = false;
                                this.refreshPromise = null;
                            },
                        );
                    }

                    const refreshed = await this.refreshPromise;
                    if (refreshed) {
                        originalRequest.headers["Authorization"] = `Bearer ${getItem(
                            "access_token",
                        )}`;
                        return this.client(originalRequest);
                    } else {
                        removeItem("refresh_token");
                        removeItem("access_token");
                    }
                }

                throw error;
            },
        );
    }

    async refreshAccessTokenSilently(): Promise<boolean> {
        try {
            const response = await this.plainClient.post("/auth/refresh");
            setItem("access_token", response.data.access_token);
            return true;
        } catch (e) {
            console.log("Refresh token failed", e);
            return false;
        }
    }

    async login(payload: LoginRequest): Promise<LoginResponse | ErrorResponse> {
        try {
            const response = await this.client.post("/auth/login", payload);
            setItem("access_token", response.data.access_token);
            setItem("refresh_token", response.data.refresh_token);
            return response.data;
        } catch (e) {
            return handlerError(e, this.setAlert);
        }
    }

    async register(payload: RegisterRequest): Promise<RegisterResponse | ErrorResponse> {
        try {
            const response = await this.client.post("/auth/register", payload);
            return response.data;
        } catch (e) {
            return handlerError(e, this.setAlert);
        }
    }

    async getUserInfo(): Promise<User | ErrorResponse> {
        try {
            const response = await this.client.get("/auth/me");
            return response.data;
        } catch (e) {
            console.log(e);
            return initUser();
        }
    }

    async uploadFile(
        file: File,
        bucket = "upload",
    ): Promise<UploadFileResponse | ErrorResponse> {
        try {
            const form = new FormData();
            form.append("file", file);
            form.append("bucket", bucket);

            const uploadClient = axios.create({
                baseURL: process.env.NEXT_PUBLIC_BACKEND_PATH,
                headers: {
                    Authorization: `Bearer ${getItem("access_token")}`,
                },
            });

            const response = await uploadClient.post("/upload", form);

            return response.data;
        } catch (e) {
            return handlerError(e, this.setAlert);
        }
    }

    async addProduct(payload: AddProductRequest): Promise<Product | ErrorResponse> {
        try {
            const response = await this.client.post("/product", payload);
            return response.data;
        } catch (e) {
            return handlerError(e, this.setAlert);
        }
    }

    async onLogout(): Promise<void | ErrorResponse> {
        try {
            removeItem("access_token");
            removeItem("refresh_token");
            removeItem("cart");
            removeItem("process_sale_order");
            window.location.href = "/";
        } catch (e) {
            return handlerError(e, this.setAlert);
        }
    }

    async listProduct(limit: number, cursor: string, canBeSole: "true" | "false" | "all", query: string): Promise<Pagination<Product> | ErrorResponse> {
        try {
            const response = await this.client.get("/products", {
                params: {
                    limit,
                    cursor,
                    canBeSole,
                    query
                }
            });
            return response.data;
        } catch (e) {
            return handlerError(e, this.setAlert);
        }
    }

    async getProductById(id: string): Promise<Product | ErrorResponse> {
        try {
            const response = await this.client.get(`/product/${id}`);
            return response.data;
        } catch (e) {
            return handlerError(e, this.setAlert);
        }
    }

    async updateProductById(id: string, payload: AddProductRequest): Promise<Product | ErrorResponse> {
        try {
            const response = await this.client.put(`/product/${id}`, payload);
            return response.data;
        } catch (e) {
            return handlerError(e, this.setAlert);
        }
    }

    async createStore(payload: AddStoreRequest): Promise<Store | ErrorResponse> {
        try {
            const response = await this.client.post(`/store`, payload);
            return response.data;
        } catch (e) {
            return handlerError(e, this.setAlert);
        }
    }

    async listStore(limit: number, cursor: string, isActive: "true" | "false" | "all", query: string): Promise<Pagination<Store> | ErrorResponse> {
        try {
            const response = await this.client.get("/stores", {
                params: {
                    limit,
                    cursor,
                    isActive,
                    query
                }
            });
            return response.data;
        } catch (e) {
            return handlerError(e, this.setAlert);
        }
    }

    async getStoreById(id: string): Promise<Store | ErrorResponse> {
        try {
            const response = await this.client.get(`/store/${id}`);
            return response.data;
        } catch (e) {
            return handlerError(e, this.setAlert);
        }
    }

    async updateStoreById(id: string, payload: AddStoreRequest): Promise<Store | ErrorResponse> {
        try {
            const response = await this.client.put(`/store/${id}`, payload);
            return response.data;
        } catch (e) {
            return handlerError(e, this.setAlert);
        }
    }

    async addInventory(payload: InventoryRequest): Promise<Product | ErrorResponse> {
        try {
            const response = await this.client.post(`/inventory/add`, payload);
            return response.data;
        } catch (e) {
            return handlerError(e, this.setAlert);
        }
    }

    async removeInventory(payload: InventoryRequest): Promise<Product | ErrorResponse> {
        try {
            const response = await this.client.post(`/inventory/remove`, payload);
            return response.data;
        } catch (e) {
            return handlerError(e, this.setAlert);
        }
    }

    async getInventoryByStoreId(id: string): Promise<Inventory[] | ErrorResponse> {
        try {
            const response = await this.client.get(`/store/${id}/inventory`);
            return response.data;
        } catch (e) {
            return handlerError(e, this.setAlert);
        }
    }

    async getInventoryMovementByStoreById(id: string): Promise<InventoryMovement[] | ErrorResponse> {
        try {
            const response = await this.client.get(`/store/${id}/inventory-movement`);
            return response.data;
        } catch (e) {
            return handlerError(e, this.setAlert);
        }
    }

    async moveProduct(payload: MoveProductRequest): Promise<MoveProductResponse[] | ErrorResponse> {
        try {
            const response = await this.client.post(`/inventory/move`, payload);
            return response.data;
        } catch (e) {
            return handlerError(e, this.setAlert);
        }
    }

    async listUser(limit: number, cursor: string, query: string): Promise<Pagination<User> | ErrorResponse> {
        try {
            const response = await this.client.get("/users", {
                params: {
                    limit,
                    cursor,
                    query
                }
            });
            return response.data;
        } catch (e) {
            return handlerError(e, this.setAlert);
        }
    }

    async getUserById(id: string): Promise<User | ErrorResponse> {
        try {
            const response = await this.client.get(`/user/${id}`);
            return response.data;
        } catch (e) {
            return handlerError(e, this.setAlert);
        }
    }

    async updateUser(id: string, payload: UpdateUserRequest): Promise<User | ErrorResponse> {
        try {
            const response = await this.client.put(`/user/${id}`, payload);
            return response.data;
        } catch (e) {
            return handlerError(e, this.setAlert);
        }
    }

    async getInventoryByProductId(productId: string): Promise<Inventory[] | ErrorResponse> {
        try {
            const response = await this.client.get(`/product/${productId}/inventory`);
            return response.data;
        } catch (e) {
            return handlerError(e, this.setAlert);
        }
    }

    async createDraftSaleOrder(payload: CreateDraftSaleOrderRequest): Promise<SaleOrder | ErrorResponse> {
        try {
            const response = await this.client.post("/order/draft", payload);
            return response.data;
        } catch (e) {
            return handlerError(e, this.setAlert);
        }
    }

    async getSaleOrderById(id: string): Promise<SaleOrderWithOrderLine | ErrorResponse> {
        try {
            const response = await this.client.get(`/sale-order/${id}`);
            return response.data;
        } catch (e) {
            return handlerError(e, this.setAlert);
        }
    }

    async editDraftSaleOrderById(id: string, payload: EditDraftSaleOrderLineRequest): Promise<EditDraftSaleOrderLineResponse | ErrorResponse> {
        try {
            const response = await this.client.put(`/sale-order/${id}`, payload);
            return response.data;
        } catch (e) {
            return handlerError(e, this.setAlert);
        }
    }
}
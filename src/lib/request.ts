import axios, { AxiosInstance } from "axios";
import { getItem, removeItem, setItem } from "./storage";
import { ErrorResponse, initUser, LoginRequest, LoginResponse, User } from "@/types/request";

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

    async getUserInfo(): Promise<User | ErrorResponse> {
        try {
            const response = await this.client.get("/auth/me");
            return response.data;
        } catch (e) {
            console.log(e);
            return initUser();
        }
    }
}
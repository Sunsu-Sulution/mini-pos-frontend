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

export interface LoginResponse {
    refresh_token: string;
    access_token: string;
}

export interface User {
    id: string;
    username: string;
    name: string;
    role: "admin" | "user";
}

export const initUser = (): User => {
    return {
        id: "",
        username: "",
        name: "",
        role: "user"
    }
}
import React, { createContext, useContext, ReactNode } from "react";
import { useQuery, useMutation, UseMutationResult } from "@tanstack/react-query";
import { type User, type InsertUser } from "@shared/schema";
import { getApiUrl, queryClient } from "@/lib/query-client";

type AuthContextType = {
    user: User | null | undefined;
    isLoading: boolean;
    error: Error | null;
    loginMutation: UseMutationResult<User, Error, LoginData>;
    logoutMutation: UseMutationResult<void, Error, void>;
    registerMutation: UseMutationResult<User, Error, InsertUser>;
};

type LoginData = Pick<InsertUser, "username" | "password">;

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const {
        data: user,
        error,
        isLoading,
    } = useQuery<User | null, Error>({
        queryKey: ["/api/user"],
        queryFn: async () => {
            const response = await fetch(`${getApiUrl()}/api/user`);
            if (response.status === 401) return null;
            if (!response.ok) throw new Error("Failed to fetch user");
            return response.json();
        },
        retry: false,
    });

    const loginMutation = useMutation<User, Error, LoginData>({
        mutationFn: async (credentials) => {
            const response = await fetch(`${getApiUrl()}/api/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(credentials),
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Login failed");
            }
            return response.json();
        },
        onSuccess: (user) => {
            queryClient.setQueryData(["/api/user"], user);
        },
    });

    const registerMutation = useMutation<User, Error, InsertUser>({
        mutationFn: async (data) => {
            const response = await fetch(`${getApiUrl()}/api/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Registration failed");
            }
            return response.json();
        },
        onSuccess: (user) => {
            queryClient.setQueryData(["/api/user"], user);
        },
    });

    const logoutMutation = useMutation<void, Error, void>({
        mutationFn: async () => {
            const response = await fetch(`${getApiUrl()}/api/logout`, {
                method: "POST",
            });
            if (!response.ok) throw new Error("Logout failed");
        },
        onSuccess: () => {
            queryClient.setQueryData(["/api/user"], null);
        },
    });

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                error,
                loginMutation,
                logoutMutation,
                registerMutation,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}

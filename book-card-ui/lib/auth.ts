// Authentication utility functions and constants

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api"

export function getToken(): string | null {
  if (typeof window === "undefined") {
    return null
  }
  return localStorage.getItem("auth_token")
}

export function setToken(token: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("auth_token", token)
  }
}

export function removeToken(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("auth_token")
  }
}

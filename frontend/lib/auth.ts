export const API_BASE_URL = 'http://127.0.0.1:8000'

export async function storeToken(token: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("athenaeum_token", token)
  }
}

export function getToken() {
  if (typeof window !== "undefined") {
    return localStorage.getItem("athenaeum_token")
  }
  return null
}

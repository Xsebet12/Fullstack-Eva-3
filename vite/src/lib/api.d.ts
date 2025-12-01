type Json = any

declare const api: {
  fetch: (path: string, options?: { method?: string; headers?: Record<string, string>; body?: any }) => Promise<Response>
  get: <T = Json>(p: string) => Promise<T>
  post: <T = Json>(p: string, body?: any) => Promise<T>
  put: <T = Json>(p: string, body?: any) => Promise<T>
  del: (p: string) => Promise<any>
}

export default api


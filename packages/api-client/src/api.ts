/**
 * API client utilities for calling Next.js backend
 */

export interface ApiClientConfig {
  baseUrl: string;
  timeout?: number;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

/**
 * Create an API client for calling Next.js backend routes
 */
export function createApiClient(config: ApiClientConfig) {
  const { baseUrl, timeout = 30000 } = config;

  /**
   * Make an authenticated API request
   */
  async function request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${baseUrl}${endpoint}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})) as any;
        throw {
          message: errorData.error || `HTTP ${response.status}: ${response.statusText}`,
          status: response.status,
          code: errorData.code,
        } as ApiError;
      }

      return await response.json() as T;
    } catch (error: any) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw {
          message: 'Request timeout',
          code: 'TIMEOUT',
        } as ApiError;
      }

      throw error;
    }
  }

  return {
    /**
     * GET request
     */
    get: <T = any>(endpoint: string, options?: RequestInit) =>
      request<T>(endpoint, { ...options, method: 'GET' }),

    /**
     * POST request
     */
    post: <T = any>(endpoint: string, data?: any, options?: RequestInit) =>
      request<T>(endpoint, {
        ...options,
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined,
      }),

    /**
     * PUT request
     */
    put: <T = any>(endpoint: string, data?: any, options?: RequestInit) =>
      request<T>(endpoint, {
        ...options,
        method: 'PUT',
        body: data ? JSON.stringify(data) : undefined,
      }),

    /**
     * DELETE request
     */
    delete: <T = any>(endpoint: string, options?: RequestInit) =>
      request<T>(endpoint, { ...options, method: 'DELETE' }),

    /**
     * PATCH request
     */
    patch: <T = any>(endpoint: string, data?: any, options?: RequestInit) =>
      request<T>(endpoint, {
        ...options,
        method: 'PATCH',
        body: data ? JSON.stringify(data) : undefined,
      }),
  };
}

/**
 * Create API client from environment variables
 */
export function createApiClientFromEnv() {
  const baseUrl = 
    process.env.EXPO_PUBLIC_API_URL || 
    process.env.NEXT_PUBLIC_API_URL || 
    'http://localhost:3200';

  return createApiClient({ baseUrl });
}

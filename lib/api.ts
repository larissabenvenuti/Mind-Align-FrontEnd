const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL;
const configuredApiUrlIsLocal =
  /^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?(?:\/|$)/i.test(
    configuredApiUrl || "",
  );

export const API_BASE_URL =
  process.env.NODE_ENV === "development"
    ? configuredApiUrl || "http://localhost:3333"
    : configuredApiUrl && !configuredApiUrlIsLocal
      ? configuredApiUrl
      : "https://mindalign-backend.onrender.com";

export interface ApiError {
  error: string;
  message?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("token")
        : null;

    const headers = new Headers(options.headers);

    headers.set("Content-Type", "application/json");

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;

        try {
          const errorData: ApiError = await response.json();

          errorMessage =
            errorData.error ||
            errorData.message ||
            errorMessage;
        } catch {
        }

        const error = new Error(errorMessage);

        (error as any).status = response.status;

        throw error;
      }

      if (response.status === 204) {
        return undefined as T;
      }

      const data = await response.json();

      return data as T;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }

      throw new Error("Erro desconhecido na requisição");
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: "GET",
    });
  }

  async post<T>(
    endpoint: string,
    data?: unknown,
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(
    endpoint: string,
    data: unknown,
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: "DELETE",
    });
  }

  async patch<T>(
    endpoint: string,
    data: unknown,
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }
}

export const api = new ApiClient(API_BASE_URL);
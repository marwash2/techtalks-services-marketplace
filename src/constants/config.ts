// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
export const API_ENDPOINTS = {
  // Users
  USERS: "/api/users",
  USER_BY_ID: (id: string) => `/api/users/${id}`,

  // Providers
  PROVIDERS: "/api/providers",
  PROVIDER_BY_ID: (id: string) => `/api/providers/${id}`,

  // Services
  SERVICES: "/api/services",
  SERVICE_BY_ID: (id: string) => `/api/services/${id}`,
  SERVICES_BY_CATEGORY: (categoryId: string) => `/api/services?categoryId=${categoryId}`,
  SERVICES_BY_PROVIDER: (providerId: string) => `/api/services?providerId=${providerId}`,

  // Bookings
  BOOKINGS: "/api/bookings",
  BOOKING_BY_ID: (id: string) => `/api/bookings/${id}`,

  // Categories
  CATEGORIES: "/api/categories",
  CATEGORY_BY_ID: (id: string) => `/api/categories/${id}`,

  // Reviews
  REVIEWS: "/api/reviews",
  REVIEW_BY_ID: (id: string) => `/api/reviews/${id}`,

  // Notifications
  NOTIFICATIONS: "/api/notifications",

  // Auth
  AUTH: {
    LOGIN: "/api/auth/login",
    REGISTER: "/api/auth/register",
    LOGOUT: "/api/auth/logout",
    SESSION: "/api/auth/session",
  },

  // AI
  AI: {
    ASSISTANT: "/api/ai/assistant",
    RECOMMEND: "/api/ai/recommend",
  },
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
};

// Validation Rules
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 20,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^[\d\s\-\+\(\)]+$/,
};

// Service Configuration
export const SERVICE_CONFIG = {
  MIN_PRICE: 0,
  MAX_PRICE: 100000,
  MIN_DURATION: 15, // minutes
  MAX_DURATION: 480, // 8 hours
  DEFAULT_DURATION: 60,
};

// Booking Configuration
export const BOOKING_CONFIG = {
  CANCELLATION_WINDOW: 24, // hours before booking
  MIN_ADVANCE_BOOKING: 1, // hours from now
};

// Provider Configuration
export const PROVIDER_CONFIG = {
  MIN_RATING: 0,
  MAX_RATING: 5,
  VERIFICATION_REQUIRED: true,
};

// Messages
export const MESSAGES = {
  SUCCESS: {
    CREATE: "Created successfully",
    UPDATE: "Updated successfully",
    DELETE: "Deleted successfully",
    LOGIN: "Logged in successfully",
    LOGOUT: "Logged out successfully",
  },
  ERROR: {
    INVALID_INPUT: "Invalid input provided",
    NOT_FOUND: "Resource not found",
    UNAUTHORIZED: "Unauthorized access",
    FORBIDDEN: "Access forbidden",
    SERVER_ERROR: "Server error occurred",
    DUPLICATE_EMAIL: "Email already exists",
    INVALID_CREDENTIALS: "Invalid email or password",
    SESSION_EXPIRED: "Session expired",
  },
};

// Cache Configuration
export const CACHE = {
  USER_CACHE_TTL: 3600, // 1 hour
  SERVICE_CACHE_TTL: 1800, // 30 minutes
  CATEGORY_CACHE_TTL: 3600, // 1 hour
};

// Upload Configuration
export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/webp"],
  UPLOAD_DIR: "public/uploads",
};

// Sorting
export const SORT_OPTIONS = {
  NEWEST: "newest",
  OLDEST: "oldest",
  PRICE_LOW: "price_low",
  PRICE_HIGH: "price_high",
  RATING_LOW: "rating_low",
  RATING_HIGH: "rating_high",
} as const;

// Status Constants
export const BOOKING_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const;

export const SERVICE_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  ARCHIVED: "archived",
} as const;

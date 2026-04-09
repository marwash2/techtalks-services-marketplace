/**
 * Test file to verify constants are properly exported and accessible
 * Run this: npx ts-node src/constants/test.ts
 */

import {
  API_BASE_URL,
  API_ENDPOINTS,
  PAGINATION,
  VALIDATION,
  SERVICE_CONFIG,
  BOOKING_CONFIG,
  PROVIDER_CONFIG,
  MESSAGES,
  CACHE,
  UPLOAD_CONFIG,
  SORT_OPTIONS,
  BOOKING_STATUS,
  SERVICE_STATUS,
} from "./config";

console.log("✅ Testing Constants Configuration\n");

console.log("1️⃣ API Configuration:");
console.log("   API_BASE_URL:", API_BASE_URL);
console.log("   Users endpoint:", API_ENDPOINTS.USERS);
console.log("   User by ID:", API_ENDPOINTS.USER_BY_ID("123"));
console.log("   Categories endpoint:", API_ENDPOINTS.CATEGORIES);

console.log("\n2️⃣ Pagination:");
console.log("   Default page:", PAGINATION.DEFAULT_PAGE);
console.log("   Default limit:", PAGINATION.DEFAULT_LIMIT);
console.log("   Max limit:", PAGINATION.MAX_LIMIT);

console.log("\n3️⃣ Validation Rules:");
console.log("   Password min length:", VALIDATION.PASSWORD_MIN_LENGTH);
console.log("   Email regex test:", VALIDATION.EMAIL_REGEX.test("test@example.com"));

console.log("\n4️⃣ Service Config:");
console.log("   Min price: $", SERVICE_CONFIG.MIN_PRICE);
console.log("   Max price: $", SERVICE_CONFIG.MAX_PRICE);
console.log("   Default duration:", SERVICE_CONFIG.DEFAULT_DURATION, "minutes");

console.log("\n5️⃣ Messages:");
console.log("   Success - Create:", MESSAGES.SUCCESS.CREATE);
console.log("   Error - Not found:", MESSAGES.ERROR.NOT_FOUND);

console.log("\n6️⃣ Status Constants:");
console.log("   Booking statuses:", BOOKING_STATUS);
console.log("   Service statuses:", SERVICE_STATUS);

console.log("\n7️⃣ Cache TTLs:");
console.log("   User cache TTL:", CACHE.USER_CACHE_TTL, "seconds");
console.log("   Service cache TTL:", CACHE.SERVICE_CACHE_TTL, "seconds");

console.log("\n✨ All constants are properly exported and accessible!");

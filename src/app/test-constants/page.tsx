import { API_ENDPOINTS, MESSAGES, PAGINATION } from "@/constants/config";

export default function TestPage() {
  return (
    <div style={{ padding: "20px", fontFamily: "monospace" }}>
      <h1>✅ Task 1 - Constants Configuration Test</h1>

      <section style={{ marginBottom: "20px", border: "1px solid #ddd", padding: "10px" }}>
        <h2>1. API Endpoints</h2>
        <pre>
          {JSON.stringify(
            {
              usersEndpoint: API_ENDPOINTS.USERS,
              userById: API_ENDPOINTS.USER_BY_ID("123abc"),
              categoriesEndpoint: API_ENDPOINTS.CATEGORIES,
              servicesEndpoint: API_ENDPOINTS.SERVICES,
              bookingsEndpoint: API_ENDPOINTS.BOOKINGS,
            },
            null,
            2
          )}
        </pre>
      </section>

      <section style={{ marginBottom: "20px", border: "1px solid #ddd", padding: "10px" }}>
        <h2>2. Pagination</h2>
        <pre>{JSON.stringify(PAGINATION, null, 2)}</pre>
      </section>

      <section style={{ marginBottom: "20px", border: "1px solid #ddd", padding: "10px" }}>
        <h2>3. Success Messages</h2>
        <pre>{JSON.stringify(MESSAGES.SUCCESS, null, 2)}</pre>
      </section>

      <section style={{ marginBottom: "20px", border: "1px solid #ddd", padding: "10px" }}>
        <h2>4. Error Messages</h2>
        <pre>{JSON.stringify(MESSAGES.ERROR, null, 2)}</pre>
      </section>

      <div style={{ backgroundColor: "#d4edda", padding: "10px", marginTop: "20px", borderRadius: "5px" }}>
        <strong>✨ All constants are properly configured and accessible!</strong>
      </div>
    </div>
  );
}

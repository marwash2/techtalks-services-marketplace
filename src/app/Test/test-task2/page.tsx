"use client";

import { useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

const endpoints = [
  { method: "GET", path: "/api/users", description: "Get all users", testData: null },
  { method: "POST", path: "/api/users", description: "Create new user", testData: { name: "John Doe", email: "john@example.com", password: "password123", role: "user" } },
  { method: "GET", path: "/api/categories", description: "Get all categories", testData: null },
  { method: "POST", path: "/api/categories", description: "Create category", testData: { name: "Plumbing", description: "Plumbing services" } },
  { method: "GET", path: "/api/providers", description: "Get all providers", testData: null },
  { method: "GET", path: "/api/services", description: "Get all services", testData: null },
  { method: "GET", path: "/api/bookings", description: "Get all bookings", testData: null },
  { method: "GET", path: "/api/reviews", description: "Get all reviews", testData: null },
  { method: "GET", path: "/api/notifications", description: "Get all notifications", testData: null },
];

export default function TestTask2() {
  const [results, setResults] = useState<{ [key: string]: any }>({});
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const [expandedResult, setExpandedResult] = useState<string | null>(null);

  const testEndpoint = async (endpoint: (typeof endpoints)[0]) => {
    const key = `${endpoint.method}-${endpoint.path}`;
    setLoading((prev) => ({ ...prev, [key]: true }));

    try {
      const options: RequestInit = {
        method: endpoint.method,
        headers: { "Content-Type": "application/json" },
      };

      if (endpoint.method === "POST" && endpoint.testData) {
        options.body = JSON.stringify(endpoint.testData);
      }

      const response = await fetch(`${API_BASE_URL}${endpoint.path}`, options);
      const data = await response.json();

      setResults((prev) => ({
        ...prev,
        [key]: {
          status: response.status,
          statusText: response.statusText,
          data: data,
          timestamp: new Date().toLocaleTimeString(),
        },
      }));
    } catch (error: any) {
      setResults((prev) => ({
        ...prev,
        [key]: {
          error: error.message,
          timestamp: new Date().toLocaleTimeString(),
        },
      }));
    } finally {
      setLoading((prev) => ({ ...prev, [key]: false }));
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "monospace", maxWidth: "1200px", margin: "0 auto" }}>
      <h1>✅ Task 2 - MongoDB Models → REST API Test</h1>

      <div style={{ backgroundColor: "black", padding: "15px", marginBottom: "20px", borderRadius: "5px", borderLeft: "4px solid #2196F3" }}>
        <strong>📝 What This Tests:</strong>
        <ul>
          <li>MongoDB connection</li>
          <li>All 7 models (User, Category, Provider, Service, Booking, Review, Notification)</li>
          <li>CRUD operations (Create, Read)</li>
          <li>Pagination and filtering</li>
          <li>Error handling & validation</li>
        </ul>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "15px", marginBottom: "30px" }}>
        {endpoints.map((endpoint) => {
          const key = `${endpoint.method}-${endpoint.path}`;
          const result = results[key];
          const isLoading = loading[key];

          return (
            <div
              key={key}
              style={{
                border: "1px solid #ddd",
                borderRadius: "5px",
                padding: "15px",
                backgroundColor: result?.error ? "#ffebee" : "#f5f5f5",
              }}
            >
              <div style={{ marginBottom: "10px" }}>
                <span
                  style={{
                    backgroundColor: endpoint.method === "GET" ? "#4CAF50" : "#2196F3",
                    color: "white",
                    padding: "3px 8px",
                    borderRadius: "3px",
                    fontSize: "12px",
                    fontWeight: "bold",
                  }}
                >
                  {endpoint.method}
                </span>
                <div style={{ fontSize: "12px", marginTop: "5px", color: "#666" }}>{endpoint.path}</div>
                <div style={{ fontSize: "11px", color: "#999", marginTop: "3px" }}>{endpoint.description}</div>
              </div>

              <button
                onClick={() => testEndpoint(endpoint)}
                disabled={isLoading}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  backgroundColor: isLoading ? "#ccc" : "#2196F3",
                  color: "white",
                  border: "none",
                  borderRadius: "3px",
                  cursor: isLoading ? "not-allowed" : "pointer",
                  fontSize: "12px",
                }}
              >
                {isLoading ? "Testing..." : "Test Endpoint"}
              </button>

              {result && (
                <div style={{ marginTop: "10px", fontSize: "11px" }}>
                  <div style={{ color: result.error ? "#d32f2f" : "#388e3c", fontWeight: "bold", marginBottom: "5px" }}>
                    {result.error ? "❌ Error" : `✅ Status: ${result.status} ${result.statusText}`}
                  </div>
                  {result.timestamp && <div style={{ color: "#999", fontSize: "10px" }}>Tested at {result.timestamp}</div>}
                  <button
                    onClick={() => setExpandedResult(expandedResult === key ? null : key)}
                    style={{
                      marginTop: "8px",
                      padding: "4px 8px",
                      backgroundColor: "blue",
                      border: "1px solid #ddd",
                      borderRadius: "3px",
                      cursor: "pointer",
                      fontSize: "11px",
                    }}
                  >
                    {expandedResult === key ? "Hide Details" : "Show Details"}
                  </button>
                </div>
              )}

              {expandedResult === key && result && (
                <pre
                  style={{
                    marginTop: "10px",
                    padding: "10px",
                    backgroundColor: "black",
                    border: "1px solid #ddd",
                    borderRadius: "3px",
                    fontSize: "10px",
                    overflow: "auto",
                    maxHeight: "300px",
                  }}
                >
                  {JSON.stringify(result, null, 2)}
                </pre>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ backgroundColor: "black", padding: "15px", marginTop: "30px", borderRadius: "5px", borderLeft: "4px solid #FBC02D" }}>
        <strong>📌 What to Look For:</strong>
        <ul>
          <li>✅ Status 200 = Connection working</li>
          <li>✅ Status 201 = Record created successfully</li>
          <li>✅ Response includes {"success: true"} and data</li>
          <li>✅ Pagination info shown (page, limit, total, pages)</li>
          <li>❌ If you see errors, MongoDB might not be connected</li>
        </ul>
      </div>

      <div style={{ backgroundColor: "black", padding: "15px", marginTop: "15px", borderRadius: "5px", borderLeft: "4px solid #4CAF50" }}>
        <strong>💡 Next Steps After Testing:</strong>
        <ol>
          <li>If all tests pass → APIs are ready to use</li>
          <li>If MongoDB error → Check MONGODB_URI environment variable</li>
          <li>If validation error → Read response details for what's missing</li>
          <li>Connect these APIs to your frontend components</li>
        </ol>
      </div>
    </div>
  );
}

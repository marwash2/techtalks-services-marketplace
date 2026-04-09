export const Routes = {
  HOME: "/",
  LOGIN: "/login",
  USER_DASHBOARD: "/user/dashboard",
  PROVIDER_DASHBOARD: "/provider/dashboard",
  ADMIN_DASHBOARD: "/admin/dashboard",
  REGISTER: "/register",
  SERVICES: "/services",
  SERVICE_DETAILS: (id: string) => `/services/${id}`,

  PROVIDERS: "/providers",
  PROVIDER_DETAILS: (id: string) => `/providers/${id}`
};

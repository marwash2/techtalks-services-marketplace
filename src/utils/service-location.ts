type LocationRef =
  | string
  | {
      _id?: string;
      id?: string;
      name?: string;
      region?: string | null;
    }
  | null
  | undefined;

type ServiceLike = {
  location?: string | null;
  locationId?: LocationRef;
};

export function formatLocationRef(location: LocationRef) {
  if (!location) return "";

  if (typeof location === "string") return location;

  if (!location.name) return "";

  return location.region ? `${location.name}, ${location.region}` : location.name;
}

export function getServiceLocation(
  service: ServiceLike,
  fallback = "Location not available",
) {
  return formatLocationRef(service.locationId) || service.location || fallback;
}

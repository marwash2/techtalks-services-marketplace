import { useEffect, useState } from "react";

function useFavorites() {
  const [favoritedIds, setFavoritedIds] = useState<Set<string>>(new Set());
  const [toggling, setToggling] = useState<Set<string>>(new Set());
  // Load existing favorites on mount using your GET /api/favorites
  useEffect(() => {
    fetch("/api/favorites?limit=50")
      .then((r) => r.json())
      .then((data) => {
        const items = data.data?.favorites ?? data.favorites ?? [];
        const ids = new Set<string>(
          items
            .map((item: { service?: { id?: string } | string }) => {
              if (!item.service || typeof item.service === "string")
                return null;
              return item.service.id;
            })
            .filter(Boolean) as string[],
        );
        setFavoritedIds(ids);
      })
      .catch(() => {});
  }, []);
  const toggle = async (serviceId: string) => {
    if (!serviceId || toggling.has(serviceId)) return;
    setToggling((prev) => new Set(prev).add(serviceId));
    const isFavorited = favoritedIds.has(serviceId);
    // Optimistic update
    setFavoritedIds((prev) => {
      const next = new Set(prev);
      isFavorited ? next.delete(serviceId) : next.add(serviceId);
      return next;
    });
    try {
      if (isFavorited) {
        // Use your existing DELETE /api/favorites/${serviceId}
        await fetch(`/api/favorites/${serviceId}`, { method: "DELETE" });
      } else {
        // Add favorite — POST /api/favorites with serviceId
        await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ serviceId }),
        });
      }
    } catch {
      // Revert on error
      setFavoritedIds((prev) => {
        const next = new Set(prev);
        isFavorited ? next.add(serviceId) : next.delete(serviceId);
        return next;
      });
    } finally {
      setToggling((prev) => {
        const next = new Set(prev);
        next.delete(serviceId);
        return next;
      });
    }
  };
  return { favoritedIds, toggle, toggling };
}

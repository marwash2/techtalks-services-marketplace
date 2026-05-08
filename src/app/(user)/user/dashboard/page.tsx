"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function UserDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [recommendedServices, setRecommendedServices] = useState<
    { id: string; title: string; desc: string }[]
  >([]);

  useEffect(() => {
    if (status === "loading") return;
    if (status !== "authenticated" || !session) {
      router.replace("/login");
      return;
    }
    if (session.user.role === "provider") router.replace("/provider/dashboard");
    if (session.user.role === "admin") router.replace("/admin/dashboard");
  }, [status, session, router]);

  useEffect(() => {
    const loadRecommendedServices = async () => {
      try {
        const res = await fetch("/api/services?limit=4", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        const services = data?.data?.services ?? data?.services ?? [];
        setRecommendedServices(
          services.map((s: any) => ({
            id: s.id || s._id || Math.random().toString(36),
            title: s.title || "Service",
            desc: s.description || "Reliable local service providers near you.",
          })),
        );
      } catch {
        // keep fallback cards
      }
    };

    void loadRecommendedServices();
  }, []);

  if (status === "loading") {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#F4F6FA" }}
      >
        <div
          className="animate-spin rounded-full h-14 w-14 border-t-2 border-b-2"
          style={{ borderColor: "#7A9CC8" }}
        />
      </div>
    );
  }

  if (!session || session.user.role !== "user") return null;

  const styles: Record<string, React.CSSProperties> = {
    page: {
      minHeight: "100vh",
      background: "#F4F6FA",
      padding: "28px 24px 48px",
      fontFamily: "'DM Sans', sans-serif",
      color: "#1A2740",
    },
    inner: {
      maxWidth: 1200,
      margin: "0 auto",
    },

    // TOP BAR
    topBar: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 32,
    },
    topLabel: {
      fontSize: 11,
      fontWeight: 500,
      letterSpacing: "0.12em",
      textTransform: "uppercase" as const,
      color: "#7A9CC8",
    },
    topNav: { display: "flex", gap: 6 },
    navPill: {
      fontSize: 12,
      fontWeight: 400,
      padding: "6px 14px",
      borderRadius: 100,
      border: "1px solid #CFDAEC",
      color: "#5A7BA8",
      background: "transparent",
      cursor: "pointer",
    },
    navPillActive: {
      fontSize: 12,
      fontWeight: 500,
      padding: "6px 14px",
      borderRadius: 100,
      border: "1px solid #5B82B8",
      color: "#fff",
      background: "#5B82B8",
      cursor: "pointer",
    },

    // HERO
    hero: {
      background:
        "linear-gradient(135deg, #2D4E7A 0%, #4A72A8 55%, #6B96C8 100%)",
      borderRadius: 20,
      padding: "44px 48px",
      marginBottom: 20,
      position: "relative" as const,
      overflow: "hidden",
      display: "grid",
      gridTemplateColumns: "1fr auto",
      gap: 32,
      alignItems: "center",
    },
    heroCircle1: {
      position: "absolute" as const,
      width: 380,
      height: 380,
      borderRadius: "50%",
      border: "1px solid rgba(255,255,255,0.07)",
      top: -140,
      right: 60,
      pointerEvents: "none" as const,
    },
    heroCircle2: {
      position: "absolute" as const,
      width: 240,
      height: 240,
      borderRadius: "50%",
      border: "1px solid rgba(255,255,255,0.09)",
      bottom: -100,
      right: 180,
      pointerEvents: "none" as const,
    },
    heroTag: {
      fontSize: 11,
      fontWeight: 500,
      letterSpacing: "0.1em",
      textTransform: "uppercase" as const,
      color: "#B8D0EE",
      marginBottom: 14,
    },
    heroTitle: {
      fontFamily: "'DM Serif Display', serif",
      fontSize: 42,
      lineHeight: 1.1,
      color: "#fff",
      marginBottom: 14,
    },
    heroTitleEm: {
      fontStyle: "italic",
      color: "#C8DCEF",
    },
    heroSub: {
      fontSize: 14,
      fontWeight: 300,
      color: "#A8C4E0",
      lineHeight: 1.7,
      maxWidth: 480,
      marginBottom: 28,
    },
    heroActions: { display: "flex", gap: 12, alignItems: "center" },
    btnPrimary: {
      background: "#fff",
      color: "#3D6494",
      fontFamily: "'DM Sans', sans-serif",
      fontSize: 13,
      fontWeight: 500,
      padding: "12px 24px",
      borderRadius: 100,
      border: "none",
      cursor: "pointer",
    },
    btnGhost: {
      background: "rgba(255,255,255,0.12)",
      color: "#C8DCEF",
      fontFamily: "'DM Sans', sans-serif",
      fontSize: 13,
      fontWeight: 400,
      padding: "12px 20px",
      borderRadius: 100,
      border: "1px solid rgba(255,255,255,0.2)",
      cursor: "pointer",
    },
    heroBadge: {
      background: "rgba(255,255,255,0.12)",
      border: "1px solid rgba(255,255,255,0.18)",
      borderRadius: 16,
      padding: "28px 24px",
      minWidth: 160,
      textAlign: "center" as const,
      position: "relative" as const,
      zIndex: 1,
    },
    heroBadgeIcon: { fontSize: 28, marginBottom: 10 },
    heroBadgeLabel: {
      fontSize: 11,
      color: "#A8C4E0",
      textTransform: "uppercase" as const,
      letterSpacing: "0.08em",
      marginBottom: 4,
    },
    heroBadgeVal: {
      fontFamily: "'DM Serif Display', serif",
      fontSize: 36,
      color: "#fff",
    },

    // STAT CARDS
    statGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gap: 12,
      marginBottom: 20,
    },
    statCard: {
      background: "#fff",
      border: "1px solid #DAEAF8",
      borderRadius: 16,
      padding: "22px 22px 20px",
    },
    statLabel: {
      fontSize: 11,
      fontWeight: 400,
      color: "#7A9CC8",
      textTransform: "uppercase" as const,
      letterSpacing: "0.09em",
      marginBottom: 12,
    },
    statSub: { fontSize: 12, color: "#AABFDA" },

    // MAIN GRID
    mainGrid: {
      display: "grid",
      gridTemplateColumns: "1fr 320px",
      gap: 16,
    },
    leftCol: { display: "flex", flexDirection: "column" as const, gap: 16 },
    rightCol: { display: "flex", flexDirection: "column" as const, gap: 16 },

    // CARDS
    card: {
      background: "#fff",
      border: "1px solid #DAEAF8",
      borderRadius: 20,
      padding: 28,
    },
    cardHeader: {
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      marginBottom: 22,
    },
    cardTitle: {
      fontFamily: "'DM Serif Display', serif",
      fontSize: 22,
      color: "#1A2740",
      marginBottom: 3,
    },
    cardSub: { fontSize: 12, color: "#AABFDA" },
    viewAll: {
      fontSize: 12,
      color: "#5B82B8",
      textDecoration: "none",
      fontWeight: 500,
    },

    // BOOKING ITEMS
    bookingItem: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "16px 18px",
      border: "1px solid #E8F1FB",
      borderRadius: 12,
      marginBottom: 10,
      cursor: "pointer",
    },
    bookingLeft: { display: "flex", alignItems: "center", gap: 14 },
    bookingIconBlue: {
      width: 40,
      height: 40,
      borderRadius: 10,
      background: "#E2EEF8",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 16,
      flexShrink: 0,
    },
    bookingIconSoft: {
      width: 40,
      height: 40,
      borderRadius: 10,
      background: "#E8EEF8",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 16,
      flexShrink: 0,
    },
    bookingName: {
      fontSize: 14,
      fontWeight: 500,
      color: "#1A2740",
      marginBottom: 3,
    },
    bookingMeta: { fontSize: 12, color: "#AABFDA" },

    badgeGreen: {
      fontSize: 11,
      fontWeight: 500,
      padding: "5px 12px",
      borderRadius: 100,
      background: "#E2F4EC",
      color: "#2D7A52",
    },
    badgeYellow: {
      fontSize: 11,
      fontWeight: 500,
      padding: "5px 12px",
      borderRadius: 100,
      background: "#FEF9E7",
      color: "#9A7020",
    },

    // RECOMMENDED
    recGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
    recCard: {
      border: "1px solid #E8F1FB",
      borderRadius: 14,
      padding: 18,
      cursor: "pointer",
    },
    recIcon: { fontSize: 20, marginBottom: 10 },
    recTitle: {
      fontSize: 14,
      fontWeight: 500,
      color: "#1A2740",
      marginBottom: 5,
    },
    recDesc: { fontSize: 12, color: "#AABFDA", lineHeight: 1.5 },

    // ACTIVITY
    actRow: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "10px 0",
      borderBottom: "1px solid #EEF4FB",
    },
    actDotBlue: {
      width: 7,
      height: 7,
      borderRadius: "50%",
      background: "#5B82B8",
      flexShrink: 0,
    },
    actDotGreen: {
      width: 7,
      height: 7,
      borderRadius: "50%",
      background: "#4A9E76",
      flexShrink: 0,
    },
    actDotSlate: {
      width: 7,
      height: 7,
      borderRadius: "50%",
      background: "#8AAAC8",
      flexShrink: 0,
    },
    actText: { fontSize: 12, color: "#5A7BA8", flex: 1, lineHeight: 1.4 },
    actTime: { fontSize: 11, color: "#BCCFE0" },

    // PROFILE CARD
    profileCard: {
      background: "#fff",
      border: "1px solid #DAEAF8",
      borderRadius: 20,
      padding: 28,
      textAlign: "center" as const,
    },
    avatar: {
      width: 72,
      height: 72,
      borderRadius: "50%",
      background: "linear-gradient(135deg, #4A72A8, #6B96C8)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'DM Serif Display', serif",
      fontSize: 28,
      color: "#fff",
      margin: "0 auto 16px",
    },
    profileName: {
      fontFamily: "'DM Serif Display', serif",
      fontSize: 20,
      color: "#1A2740",
      marginBottom: 4,
    },
    profileEmail: { fontSize: 12, color: "#AABFDA", marginBottom: 20 },
    profileDivider: {
      border: "none",
      borderTop: "1px solid #DAEAF8",
      margin: "0 0 18px",
    },
    profileStats: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 10,
      marginBottom: 20,
    },
    pstat: {
      background: "#F2F7FC",
      borderRadius: 10,
      padding: "12px 10px",
      textAlign: "center" as const,
    },
    pstatNum: {
      fontFamily: "'DM Serif Display', serif",
      fontSize: 22,
      color: "#4A72A8",
      marginBottom: 2,
    },
    pstatLabel: {
      fontSize: 10,
      color: "#AABFDA",
      textTransform: "uppercase" as const,
      letterSpacing: "0.07em",
    },
    manageBtn: {
      display: "block",
      width: "100%",
      padding: 12,
      background: "#4A72A8",
      color: "#fff",
      fontFamily: "'DM Sans', sans-serif",
      fontSize: 13,
      fontWeight: 500,
      borderRadius: 12,
      border: "none",
      cursor: "pointer",
    },

    // SUPPORT CARD
    supportCard: {
      background: "linear-gradient(135deg, #2D4E7A, #4A72A8)",
      borderRadius: 20,
      padding: 28,
      position: "relative" as const,
      overflow: "hidden",
    },
    supportCircle: {
      position: "absolute" as const,
      width: 180,
      height: 180,
      borderRadius: "50%",
      border: "1px solid rgba(255,255,255,0.1)",
      bottom: -60,
      right: -40,
    },
    supportTitle: {
      fontFamily: "'DM Serif Display', serif",
      fontSize: 20,
      color: "#fff",
      marginBottom: 10,
    },
    supportText: {
      fontSize: 13,
      color: "#A8C4E0",
      lineHeight: 1.6,
      marginBottom: 20,
      fontWeight: 300,
    },
    supportBtn: {
      display: "block",
      width: "100%",
      padding: 12,
      background: "#fff",
      color: "#3D6494",
      fontFamily: "'DM Sans', sans-serif",
      fontSize: 13,
      fontWeight: 500,
      borderRadius: 12,
      border: "none",
      cursor: "pointer",
      position: "relative" as const,
      zIndex: 1,
    },
  };

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap"
        rel="stylesheet"
      />

      <div style={styles.page}>
        <div style={styles.inner}>
          {/* TOP BAR */}
          <div style={styles.topBar}>
            <span style={styles.topLabel}>Dashboard</span>
            <div style={styles.topNav}>
              <button style={styles.navPillActive}>Overview</button>
              <button style={styles.navPill}>Bookings</button>
              <button style={styles.navPill}>Explore</button>
              <button style={styles.navPill}>History</button>
            </div>
          </div>

          {/* HERO */}
          <section style={styles.hero}>
            <div style={styles.heroCircle1} />
            <div style={styles.heroCircle2} />
            <div style={{ position: "relative", zIndex: 1 }}>
              <p style={styles.heroTag}>Welcome back</p>
              <h1 style={styles.heroTitle}>
                Hello,{" "}
                <em style={styles.heroTitleEm}>
                  {session.user.name || "User"}.
                </em>
              </h1>
              <p style={styles.heroSub}>
                Your schedule is looking clear today. You have 3 upcoming
                appointments and 8 saved providers ready when you need them.
              </p>
              <div style={styles.heroActions}>
                <button style={styles.btnPrimary}>
                  <Link
                    href="/user/services"
                    style={{ color: "inherit", textDecoration: "none" }}
                  >
                    Explore Services
                  </Link>
                </button>
                <button style={styles.btnGhost}>
                  <Link
                    href="/user/bookings"
                    style={{ color: "inherit", textDecoration: "none" }}
                  >
                    My Bookings →
                  </Link>
                </button>
              </div>
            </div>
            <div style={styles.heroBadge}>
              <div style={styles.heroBadgeIcon}>📌</div>
              <p style={styles.heroBadgeLabel}>This week</p>
              <p style={styles.heroBadgeVal}>3</p>
              <p style={{ fontSize: 11, color: "#A8C4E0", marginTop: 4 }}>
                appointments
              </p>
            </div>
          </section>

          {/* STAT CARDS */}
          <div style={styles.statGrid}>
            <div style={styles.statCard}>
              <p style={styles.statLabel}>Total Bookings</p>
              <p
                style={{
                  fontFamily: "'DM Serif Display', serif",
                  fontSize: 38,
                  lineHeight: 1,
                  marginBottom: 6,
                  color: "#1A2740",
                }}
              >
                12
              </p>
              <p style={styles.statSub}>All time</p>
            </div>
            <div style={styles.statCard}>
              <p style={styles.statLabel}>Upcoming</p>
              <p
                style={{
                  fontFamily: "'DM Serif Display', serif",
                  fontSize: 38,
                  lineHeight: 1,
                  marginBottom: 6,
                  color: "#2D7A52",
                }}
              >
                3
              </p>
              <p style={styles.statSub}>This week</p>
            </div>
            <div style={styles.statCard}>
              <p style={styles.statLabel}>Saved Providers</p>
              <p
                style={{
                  fontFamily: "'DM Serif Display', serif",
                  fontSize: 38,
                  lineHeight: 1,
                  marginBottom: 6,
                  color: "#4A72A8",
                }}
              >
                8
              </p>
              <p style={styles.statSub}>Trusted</p>
            </div>
            <div style={styles.statCard}>
              <p style={styles.statLabel}>Reviews</p>
              <p
                style={{
                  fontFamily: "'DM Serif Display', serif",
                  fontSize: 38,
                  lineHeight: 1,
                  marginBottom: 6,
                  color: "#6A80B8",
                }}
              >
                5
              </p>
              <p style={styles.statSub}>Submitted</p>
            </div>
          </div>

          {/* MAIN GRID */}
          <div style={styles.mainGrid}>
            <div style={styles.leftCol}>
              {/* RECENT BOOKINGS */}
              <div style={styles.card}>
                <div style={styles.cardHeader}>
                  <div>
                    <h2 style={styles.cardTitle}>Recent Bookings</h2>
                    <p style={styles.cardSub}>Your latest scheduled services</p>
                  </div>
                  <Link href="/user/bookings" style={styles.viewAll}>
                    View all →
                  </Link>
                </div>

                <div style={styles.bookingItem}>
                  <div style={styles.bookingLeft}>
                    <div style={styles.bookingIconBlue}>🧹</div>
                    <div>
                      <p style={styles.bookingName}>Premium Home Cleaning</p>
                      <p style={styles.bookingMeta}>
                        Tomorrow · 10:00 AM · Beirut
                      </p>
                    </div>
                  </div>
                  <span style={styles.badgeGreen}>Confirmed</span>
                </div>

                <div style={{ ...styles.bookingItem, marginBottom: 0 }}>
                  <div style={styles.bookingLeft}>
                    <div style={styles.bookingIconSoft}>🔧</div>
                    <div>
                      <p style={styles.bookingName}>Plumbing Inspection</p>
                      <p style={styles.bookingMeta}>
                        April 30 · 3:00 PM · Mount Lebanon
                      </p>
                    </div>
                  </div>
                  <span style={styles.badgeYellow}>Pending</span>
                </div>
              </div>

              {/* RECOMMENDED SERVICES */}
              <div style={styles.card}>
                <div style={styles.cardHeader}>
                  <div>
                    <h2 style={styles.cardTitle}>Recommended</h2>
                    <p style={styles.cardSub}>
                      Curated for your recent activity
                    </p>
                  </div>
                </div>
                <div style={styles.recGrid}>
                  {(false && recommendedServices.length > 0
                    ? recommendedServices
                    : [
                        {
                          icon: "⚡",
                          title: "Electrical Maintenance",
                          desc: "Reliable electricians for home and office",
                        },
                        {
                          icon: "✨",
                          title: "Deep Cleaning",
                          desc: "Top-rated professional cleaning teams",
                        },
                        {
                          icon: "🪟",
                          title: "Window Installation",
                          desc: "Expert glaziers and frame specialists",
                        },
                        {
                          icon: "🌿",
                          title: "Landscaping",
                          desc: "Garden design and seasonal upkeep",
                        },
                      ]
                  ).map((s: any) => (
                    <div key={s.title} style={styles.recCard}>
                      <div style={styles.recIcon}>{s.icon}</div>
                      <p style={styles.recTitle}>{s.title}</p>
                      <p style={styles.recDesc}>{s.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* RECENT ACTIVITY */}
              <div style={styles.card}>
                <div style={styles.cardHeader}>
                  <div>
                    <h2 style={styles.cardTitle}>Recent Activity</h2>
                    <p style={styles.cardSub}>Updates across your account</p>
                  </div>
                </div>
                <div style={styles.actRow}>
                  <div style={styles.actDotGreen} />
                  <p style={styles.actText}>
                    Booking confirmed — Premium Home Cleaning on May 2
                  </p>
                  <span style={styles.actTime}>2h ago</span>
                </div>
                <div style={styles.actRow}>
                  <div style={styles.actDotBlue} />
                  <p style={styles.actText}>
                    Review submitted for Ahmad's Electrical — 5 stars
                  </p>
                  <span style={styles.actTime}>Yesterday</span>
                </div>
                <div style={{ ...styles.actRow, borderBottom: "none" }}>
                  <div style={styles.actDotSlate} />
                  <p style={styles.actText}>
                    New provider saved — Zeina's Cleaning Co.
                  </p>
                  <span style={styles.actTime}>Apr 28</span>
                </div>
              </div>
            </div>

            {/* SIDEBAR */}
            <div style={styles.rightCol}>
              {/* PROFILE CARD */}
              <div style={styles.profileCard}>
                <div style={styles.avatar}>
                  {(session.user.name?.[0] || "U").toUpperCase()}
                </div>
                <p style={styles.profileName}>{session.user.name || "User"}</p>
                <p style={styles.profileEmail}>{session.user.email}</p>
                <hr style={styles.profileDivider} />
                <div style={styles.profileStats}>
                  {[
                    { num: "12", label: "Bookings" },
                    { num: "5", label: "Reviews" },
                    { num: "8", label: "Saved" },
                    { num: "3", label: "Upcoming" },
                  ].map((s) => (
                    <div key={s.label} style={styles.pstat}>
                      <p style={styles.pstatNum}>{s.num}</p>
                      <p style={styles.pstatLabel}>{s.label}</p>
                    </div>
                  ))}
                </div>
                <Link href="/user/profile">
                  <button style={styles.manageBtn}>Manage Account</button>
                </Link>
              </div>

              {/* SUPPORT CARD */}
              <div style={styles.supportCard}>
                <div style={styles.supportCircle} />
                <h3 style={styles.supportTitle}>Need a hand?</h3>
                <p style={styles.supportText}>
                  Our support team is available around the clock for bookings,
                  payments, or any service questions.
                </p>
                <Link href="/support">
                  <button style={styles.supportBtn}>Contact Support</button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

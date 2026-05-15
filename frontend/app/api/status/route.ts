import { NextResponse } from "next/server";

export async function GET() {
  try {
    const backendUrl = process.env.BACKEND_URL;

    if (backendUrl) {
      const feedResponse = await fetch(`${backendUrl}/status-feed`, {
        signal: AbortSignal.timeout(5000),
      });

      if (feedResponse.ok) {
        const feed = await feedResponse.json();
        
        // Remove razorpay from consideration
        const filteredServices = { ...(feed.services || {}) };
        delete filteredServices["razorpay"];

        const totalServices = Object.keys(filteredServices).length;
        const operationalServices = Object.values(filteredServices).filter(
          (service: any) => service?.status === "operational",
        ).length;
        
        const mappedStatus = 
          totalServices > 0 && operationalServices === totalServices
            ? "online"
            : operationalServices > 0
              ? "degraded"
              : "offline";

        const uptime =
          totalServices > 0
            ? Math.round((operationalServices / totalServices) * 10000) / 100
            : null;

        return NextResponse.json({
          status: mappedStatus,
          uptime,
          services: filteredServices,
          source: "backend-status-feed",
        });
      }
    }

    const externalResponse = await fetch(
      "https://allquiet.app/status/bughop/status.json",
      {
        signal: AbortSignal.timeout(5000),
      },
    );

    const externalData = await externalResponse.json();

    const statusMap: Record<string, string> = {
      Operational: "online",
      Degraded: "degraded",
      Downtime: "offline",
      Maintenance: "maintenance",
    };

    const status = statusMap[externalData.status] || "offline";
    const uptimeValue = externalData.calculation.results?.[0].result.uptime;
    const uptime = Math.round(uptimeValue * 10000) / 100;

    return NextResponse.json({ status, uptime, source: "external-status-feed" });
  } catch (error) {
    return NextResponse.json({ status: "offline", uptime: null });
  }
}

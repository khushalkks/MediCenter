const baseUrl = "http://localhost:4000";

const verifyFeatures = async () => {
  try {
    console.log("🔄 Starting End-to-End Verification of Dashboard Analytics...\n");

    // 1. Log in as Admin
    console.log("🔑 Authenticating Admin...");
    const loginResponse = await fetch(`${baseUrl}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@wellora.com",
        password: "adminpassword123"
      })
    });
    const loginData = await loginResponse.json();

    if (!loginData.success) {
      throw new Error(`Admin authentication failed: ${loginData.message}`);
    }
    const aToken = loginData.token;
    console.log("✅ Admin Authenticated Successfully!");

    // 2. Fetch Admin Dashboard Data
    console.log("\n📊 Fetching Admin Dashboard Analytics Data...");
    const dashResponse = await fetch(`${baseUrl}/api/admin/dashboard`, {
      method: "GET",
      headers: { 
        "Content-Type": "application/json",
        "atoken": aToken
      }
    });
    const dashData = await dashResponse.json();

    if (!dashData.success) {
      throw new Error(`Failed to fetch dashboard data: ${dashData.message}`);
    }

    const { appointmentsByMonth, specialityDistribution, appointmentStatus } = dashData.dashData;
    
    console.log("\n📈 Admin Dashboard Aggregations Result:");
    console.log("- Monthly Trend (Last 6 Months):", JSON.stringify(appointmentsByMonth));
    console.log("- Specialty Share Distribution:", JSON.stringify(specialityDistribution));
    console.log("- Bookings Status Overview:", JSON.stringify(appointmentStatus));

    if (appointmentsByMonth && specialityDistribution && appointmentStatus) {
      console.log("\n✅ Verification Successful: Admin Dashboard statistics successfully computed!");
    } else {
      console.log("\n⚠️ Verification Failed: Some analytics data was missing from the response.");
    }

  } catch (error) {
    console.error("\n❌ E2E Verification Failed:", error.message);
  }
};

verifyFeatures();

const fs = require("fs-extra");
const path = require("path");

async function copyAssets() {
  try {
    // Ensure dist directories exist
    await fs.ensureDir(path.join(__dirname, "../IPT-TAILWIND/dist"));
    await fs.ensureDir(path.join(__dirname, "../admin/dist"));

    // Copy IPT-TAILWIND assets and HTML files
    await fs.copy(
      path.join(__dirname, "../IPT-TAILWIND/assets"),
      path.join(__dirname, "../IPT-TAILWIND/dist/assets"),
      { overwrite: true }
    );
    console.log("✅ Frontend assets copied");

    // Copy all HTML files from IPT-TAILWIND root
    const frontendFiles = await fs.readdir(
      path.join(__dirname, "../IPT-TAILWIND")
    );
    for (const file of frontendFiles) {
      if (file.endsWith(".html")) {
        await fs.copy(
          path.join(__dirname, "../IPT-TAILWIND", file),
          path.join(__dirname, "../IPT-TAILWIND/dist", file),
          { overwrite: true }
        );
      }
    }
    console.log("✅ Frontend HTML files copied");

    // Copy admin files
    await fs.copy(
      path.join(__dirname, "../admin/assets"),
      path.join(__dirname, "../admin/dist/assets"),
      { overwrite: true }
    );
    console.log("✅ Admin assets copied");

    // Copy admin HTML files
    const adminHtmlFiles = [
      "admin_dashboard.html",
      "admin_login_interface.html",
      "admin_members_database.html",
      "admin_registration.html",
    ];

    for (const file of adminHtmlFiles) {
      await fs.copy(
        path.join(__dirname, "../admin", file),
        path.join(__dirname, "../admin/dist", file),
        { overwrite: true }
      );
    }
    console.log("✅ Admin HTML files copied");

    // Copy admin styles
    await fs.copy(
      path.join(__dirname, "../admin/style"),
      path.join(__dirname, "../admin/dist/style"),
      { overwrite: true }
    );
    console.log("✅ Admin styles copied");

    // Copy admin JavaScript
    await fs.copy(
      path.join(__dirname, "../admin/javascript"),
      path.join(__dirname, "../admin/dist/javascript"),
      { overwrite: true }
    );
    console.log("✅ Admin JavaScript copied");
  } catch (err) {
    console.error("Error copying assets:", err);
    process.exit(1);
  }
}

copyAssets();

// Update the year
const now = new Date().toLocaleString("en-US", { timeZone: "Africa/Lagos" });
const date = new Date(now);
document.getElementById("year").textContent = date.getFullYear();
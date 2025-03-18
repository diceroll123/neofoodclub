module.exports = {
    // Basic Million.js configuration
    auto: true,
    // You can customize which files to include/exclude
    include: ["./src/**/*.{js,jsx,ts,tsx}"],
    exclude: ["**/node_modules/**", "**/dist/**"],
    // Set this to false if the extension is still hanging
    server: {
        enable: true,
        port: 3001,
    },
};

/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#00B761", // Vibrant Fresh Green
        secondary: "#ECFDF5", // Light Green Surface
        accent: "#F59E0B", // Warm Orange
        background: {
          light: "#F3F4F6", // Light Gray/White
          dark: "#0F172A", // Dark Slate
        },
        surface: {
          light: "#FFFFFF",
          dark: "#1E293B",
        },
        text: {
          primary: "#1F2937", // Gray 800
          secondary: "#6B7280", // Gray 500
        },
      },
    },
  },
  plugins: [],
};

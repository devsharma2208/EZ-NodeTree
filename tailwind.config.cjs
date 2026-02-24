/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        todo: "#3b82f6",
        "in-progress": "#f59e0b",
        done: "#10b981",
      },
    },
  },
  plugins: [],
};

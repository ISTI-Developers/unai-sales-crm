/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        base: "#F4F5FA",
        black: "#3A3541",
        "main-100": "#587faa",
        "main-100": "#4e729a",
        "main-400": "#3d5978",
        "main-500": "#344c67",
        "main-700": "#233345",
        "blue-100": "#7CADDC",
        "blue-300": "#2585C6",
        "blue-500": "#1C3444",
        "red-100": "#DC7C84",
        "red-300": "#C62532",
        "red-500": "#971A23",
        "red-400": "#D22735",
        "yellow-100": "#FFE4B0",
        "yellow-300": "#DA9A1D",
        "yellow-500": "#986B14",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        buzz: {
          "0%, 100%": { transform: "translateX(0)" },
          "10%, 30%, 50%, 70%, 90%": { transform: "translateX(-2px)" },
          "20%, 40%, 60%, 80%": { transform: "translateX(2px)" },
        },
        "caret-blink": {
          "0%,70%,100%": { opacity: "1" },
          "20%,50%": { opacity: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        buzz: "buzz 0.5s linear",
        "caret-blink": "caret-blink 1.25s ease-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("tailwind-scrollbar")({ nocompatible: true })],
};

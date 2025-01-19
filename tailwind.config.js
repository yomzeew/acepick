/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    // Ensure this points to your source code
    './app/**/*.{js,tsx,ts,jsx}',"./pages/**/*.{js,jsx,ts,tsx}","./component/**/*.{js,jsx,ts,tsx}"
    // If you use a `src` directory, add: './src/**/*.{js,tsx,ts,jsx}'
    // Do the same with `components`, `hooks`, `styles`, or any other top-level directories
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
buttonGray: '#E8ECF4', 
inputGray:"#99B2C5",
otpYellow: "#FBBB00"
      },
    },
  },
  plugins: [],
};


# 🚀 React Native Expo Template

**A ready-to-use starter template for building Expo + React Native apps with Expo Router, NativeWind (Tailwind), and modern navigation.**

This template gives you a solid foundation for mobile app development using the latest Expo tools and best practices.

---

## 📦 Features

- 🧠 **Expo Router** – File-based routing powered by Expo.
- 🎨 **NativeWind (Tailwind CSS)** – Utility-first styling for React Native.
- 📱 **React Navigation tabs & navigation utilities** – Built-in bottom tab navigation starter.
- 📌 Core Expo SDK modules included.
- 🧪 TypeScript ready.
- 🛠️ Preconfigured linting + tooling.

---

## 📁 Project Structure

```
/app                   # Main application code (routes/screens)
/assets                # Images, fonts, and other assets
/components           # Reusable UI components
/constants            # Shared constants (colors, sizes, etc.)
/hooks                # Custom hooks
/scripts              # Utility scripts (e.g., reset project)
package.json          # Dependencies & scripts
tailwind.config.js    # Tailwind config
tsconfig.json         # TypeScript config
```

---

## 🚀 Getting Started

### Requirements

Make sure you have the following installed:

- Node.js (v16+, recommended)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)

---

### 📦 Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/muhammadranju/react-native-expo-template.git
   cd react-native-expo-template
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn
   ```

3. Start the development server:

   ```bash
   npm run start
   ```

   You can then run the app on:
   - 📱 iOS Simulator: `npm run ios`
   - 🤖 Android Emulator: `npm run android`
   - 🌐 Web: `npm run web`

---

## 📜 Available Scripts

| Script                  | Description                         |     |
| ----------------------- | ----------------------------------- | --- |
| `npm run start`         | Starts Expo development server.     |     |
| `npm run android`       | Opens app in Android emulator.      |     |
| `npm run ios`           | Opens app in iOS simulator.         |     |
| `npm run web`           | Launches web version.               |     |
| `npm run lint`          | Lints project with Expo/Eslint.     |     |
| `npm run reset-project` | Resets starter code to a blank app. |     |

---

## 📦 Key Dependencies

### **Core App Dependencies**

- `expo` – Expo SDK core.
- `expo-router` – Routing framework.
- `nativewind` – Tailwind CSS for React Native.
- `@react-navigation/*` – Navigation utilities.
- `@expo/vector-icons` – Icon support.
- `react-native-reanimated`, `react-native-gesture-handler`, `react-native-safe-area-context`, `react-native-screens` – Required support libraries for navigation & animations.

### **Dev Dependencies**

- `typescript` – Static type checking.
- `eslint`, `eslint-config-expo` – Code quality.
- `tailwindcss`, `prettier-plugin-tailwindcss` – Tailwind & formatting.

---

## 🎨 Styling

This template uses **NativeWind** and Tailwind CSS utilities — meaning you style React Native components with `className` props similar to web Tailwind.

Example:

```tsx
<View className="flex-1 items-center justify-center bg-white">
  <Text className="text-lg font-bold">Welcome!</Text>
</View>
```

---

## 🧠 TypeScript Support

TypeScript is configured out of the box — no additional setup required. Just write `.tsx` files and enjoy type safety.

---

## 📚 Resources

- 📘 **Expo Docs** – [https://docs.expo.dev](https://docs.expo.dev)
- 🚀 **Expo Router** – [https://expo.github.io/router](https://expo.github.io/router)
- 🎨 **NativeWind** – [https://www.nativewind.dev](https://www.nativewind.dev)
- 🧑‍💻 **React Navigation** – [https://reactnavigation.org](https://reactnavigation.org)

---

## ❤️ Contributing

Contributions are welcome! Open issues and pull requests are encouraged to improve the template.

---

## 📄 License

This template uses the **MIT License** (inherited from Expo’s starter template). ([github.com][2])

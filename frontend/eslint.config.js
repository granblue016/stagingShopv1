import js from "@eslint/js";
import eslintPluginPrettier from "eslint-plugin-prettier/recommended";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist", ".output", ".vinxi", "node_modules"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],

      // TẮT CÁC CẢNH BÁO KHÓ CHỊU TẠI ĐÂY
      "@typescript-eslint/no-unused-vars": "off", // Cho phép khai báo biến mà không dùng
      "@typescript-eslint/no-explicit-any": "off", // Cho phép dùng kiểu 'any' thoải mái
      "@typescript-eslint/no-empty-object-type": "off", // Cho phép khai báo object rỗng
      "no-console": "off", // Cho phép dùng console.log thoải mái
      "prettier/prettier": "off", // Tắt các lỗi định dạng của Prettier (quan trọng nhất)
    },
  },
  // eslintPluginPrettier,
);

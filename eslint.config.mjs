import {defineConfig, globalIgnores} from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = defineConfig([...nextVitals, ...nextTypescript, globalIgnores(["node_modules/**", ".next/**", "out/**", "build/**", "next-env.d.ts"])]);

export default eslintConfig;

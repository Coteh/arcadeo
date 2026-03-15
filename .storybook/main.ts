import type { StorybookConfig } from "@storybook/html-vite";

const config: StorybookConfig = {
    stories: ["../src/components/**/*.stories.ts"],
    framework: {
        name: "@storybook/html-vite",
        options: {},
    },
    addons: ["@storybook/addon-essentials"],
};

export default config;

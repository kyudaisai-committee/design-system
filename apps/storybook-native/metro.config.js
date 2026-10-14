const { getDefaultConfig } = require("expo/metro-config");
const { withStorybook } = require("@storybook/react-native/withStorybook");

module.exports = withStorybook(getDefaultConfig(__dirname), {
  enabled: process.env.STORYBOOK_ENABLED === "true",
  configPath: require("node:path").resolve(__dirname, ".rnstorybook"),
});

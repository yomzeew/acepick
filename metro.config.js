const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

module.exports = (() => {
  const config = getDefaultConfig(__dirname);

  const assetExts = config.resolver.assetExts.filter(ext => ext !== "svg");
  const sourceExts = [...config.resolver.sourceExts, "svg"];

  config.transformer = {
    ...config.transformer,
    babelTransformerPath: require.resolve("react-native-svg-transformer"),
  };

  config.resolver = {
    ...config.resolver,
    assetExts,
    sourceExts,
    extraNodeModules: {
      "@pages": path.resolve(__dirname, "./pages"),
    },
  };

  return withNativeWind(config, { input: "./global.css" });
})();

module.exports = function (api) {
    api.cache(true);
    return {
        presets: [
            ["babel-preset-expo", { jsxImportSource: "nativewind" }],
          ],
          plugins: [
            // NativeWind css-interop plugins (without worklets - reanimated 3.x has its own)
            require("react-native-css-interop/dist/babel-plugin").default,
            [
              "@babel/plugin-transform-react-jsx",
              {
                runtime: "automatic",
                importSource: "react-native-css-interop",
              },
            ],
            'react-native-reanimated/plugin', // ✅ Must be last
          ],
    };
  };
  
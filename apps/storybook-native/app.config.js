module.exports = {
  expo: {
    name: "九大祭 Design System",
    slug: "kyudaisai-design-system",
    version: "0.1.0",
    scheme: "kyudaisai-design-system",
    userInterfaceStyle: "automatic",
    plugins: [
      [
        "expo-camera",
        {
          cameraPermission: "受付のQRコードを読み取ります。",
          recordAudioAndroid: false,
          microphonePermission: false,
        },
      ],
      [
        "expo-image-picker",
        {
          photosPermission: "編集・添付する写真を選択します。",
          cameraPermission: "添付する写真を撮影します。",
          microphonePermission: false,
        },
      ],
    ],
    ios: { supportsTablet: true, bundleIdentifier: "jp.kyudaisai.designsystem" },
    android: { package: "jp.kyudaisai.designsystem", softwareKeyboardLayoutMode: "resize" },
    platforms: ["ios", "android"],
    extra: { storybookEnabled: process.env.STORYBOOK_ENABLED === "true" },
  },
};

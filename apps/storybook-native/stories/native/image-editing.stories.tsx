import type { Meta, StoryObj } from "@storybook/react-native";

import { PhotoPicker, PublicImage } from "@kyudaisai/ui-native";
import { useState } from "react";
import { View } from "react-native";
function Example() {
  const [photo, setPhoto] = useState<{ uri: string; width: number; height: number }>();
  return (
    <View style={{ gap: 16 }}>
      <PhotoPicker label="掲載する写真" onPick={setPhoto} />
      {photo && (
        <PublicImage
          asset={{
            id: "selected",
            src: photo.uri,
            alt: "選択した写真",
            width: photo.width,
            height: photo.height,
          }}
          resolveSource={(asset) => asset.src}
        />
      )}
    </View>
  );
}
const meta = {
  title: "Native/ImageEditing",
  render: () => <Example />,
  parameters: {
    notes:
      "切り抜き操作は端末標準の画面に委ねます。iOSは正方形、Androidは指定比率に対応します。選択の取消は直前の写真を保持します。",
  },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
export const NativeCropper: Story = {};
export const Dark: Story = { parameters: { nativeTheme: "dark" } };

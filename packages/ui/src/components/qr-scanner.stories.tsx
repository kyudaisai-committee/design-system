import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, within } from "storybook/test";

import { ScannerExample } from "./extended-examples";
const meta = {
  title: "Components/QrScanner",
  component: ScannerExample,
  args: { disabled: false, empty: false, failed: false, loading: false },
  parameters: {
    docs: {
      description: {
        component: "QRコードの読み取り。表示する対象・権限・保存処理は利用側で確認してください。",
      },
    },
  },
} satisfies Meta<typeof ScannerExample>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Disabled: Story = { args: { disabled: true } };
export const NoAutomaticCameraAccess: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("button", { name: "カメラを開始" })).toBeEnabled();
    await expect(
      (canvas.getByLabelText("QRコードのカメラ") as HTMLVideoElement).srcObject,
    ).toBeNull();
  },
};

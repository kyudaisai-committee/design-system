import type { Meta, StoryObj } from "@storybook/react-native";

import { InputTableExample } from "./form-control-examples";

const meta = {
  title: "Components/InputTable",
  component: InputTableExample,
  args: { disabled: false, readOnly: false },
  parameters: {
    notes:
      "共通の列を持つ入力を行ごとに並べます。狭い画面では横にスクロールでき、各入力には行と列を含む名前を付けます。renderCellのdisabled/readOnlyを各入力欄へ引き継ぎます。",
  },
} satisfies Meta<typeof InputTableExample>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Invalid: Story = { args: { error: "各行の数量を確認してください。" } };
export const Disabled: Story = { args: { disabled: true } };
export const ReadOnly: Story = { args: { readOnly: true } };
export const Dark: Story = { parameters: { nativeTheme: "dark" } };

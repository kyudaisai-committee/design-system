import type { Meta, StoryObj } from "@storybook/react-native";

import { Button, QrCode, Text } from "@kyudaisai/ui-native";
import { useState } from "react";
import { Linking, View } from "react-native";

const sample = require("../../../../packages/ui/src/components/qr-code-sample.png");
const meta = {
  title: "Components/QrCode",
  component: QrCode,
  args: {
    source: sample,
    title: "九大祭公式サイト",
    label: "九大祭公式サイトを開くQRコード",
    description: "スマートフォンのカメラで読み取ってください。",
    variant: "card",
    state: "ready",
  },
  argTypes: {
    title: {
      control: "text",
      description:
        "任意の見出し。QRコードの用途を示します。周囲の画面で用途が分かる場合は省略できます。",
    },
    description: {
      control: "text",
      description: "任意の案内文。誰に見せるか、どう使うかを示します。差し替え・省略できます。",
    },
    label: {
      control: "text",
      description: "必須の読み上げ名。画面に表示する文章とは別に、画像の目的を伝えます。",
    },
    variant: { control: "select", options: ["plain", "card", "compact"] },
    state: { control: "select", options: ["ready", "loading", "error", "unavailable"] },
    source: { control: false },
    details: { control: false },
    actions: { control: false },
    onRetry: { control: false },
  },
} satisfies Meta<typeof QrCode>;
export default meta;
type Story = StoryObj<typeof meta>;
const link = (
  <Button
    title="公式サイトを開く"
    variant="outline"
    onPress={() => {
      void Linking.openURL("https://kyudaisai.jp/");
    }}
  />
);

const receptionDetails = (
  <View>
    <Text>九大カフェ</Text>
    <Text variant="caption" tone="muted">
      受付番号 K-080
    </Text>
    <Text variant="caption" tone="muted">
      10月31日 10:00〜10:30
    </Text>
  </View>
);
export const Default: Story = {
  name: "提示カード（上部の文章なし）",
  args: { title: undefined, description: undefined, details: receptionDetails },
  render: (args) => (
    <View style={{ gap: 16 }}>
      <QrCode {...args} />
      <Text variant="caption" tone="muted">
        見本です。画像は公式サイトを開き、実際の受付には使えません。
      </Text>
    </View>
  ),
};
export const HeaderContent: Story = {
  name: "上部の文章の役割",
  render: (args) => (
    <View style={{ gap: 24 }}>
      <Text variant="heading">提示カードの上部の文章</Text>
      <Text variant="caption" tone="muted">
        見出しと案内文は任意です。見本は公式サイトを開き、受付には使えません。
      </Text>
      <Text variant="heading">文章なし</Text>
      <QrCode {...args} title={undefined} description={undefined} details={receptionDetails} />
      <Text variant="heading">見出しと案内文</Text>
      <QrCode
        {...args}
        title="受付用QRコード"
        description="受付スタッフに、この画面をお見せください。"
        details={receptionDetails}
      />
      <Text variant="heading">見出しのみ</Text>
      <QrCode {...args} title="受付用QRコード" description={undefined} details={receptionDetails} />
    </View>
  ),
};
export const Plain: Story = { name: "標準表示", args: { variant: "plain" } };
export const Compact: Story = {
  name: "横型の共有",
  args: {
    variant: "compact",
    details: (
      <Text variant="caption" tone="muted">
        kyudaisai.jp
      </Text>
    ),
    actions: link,
  },
};
export const Comparison: Story = {
  name: "3つの表示形式を比較",
  render: (args) => (
    <View style={{ gap: 32 }}>
      <Text variant="heading">QRコードの見せ方</Text>
      <Text variant="caption" tone="muted">
        見本は公式サイトを開きます。受付には使えません。
      </Text>
      <QrCode {...args} variant="plain" />
      <QrCode
        {...args}
        variant="card"
        title="受付で提示するコード"
        description="見本です。実際の受付には使えません。"
        label="公式サイトを開く見本のQRコード"
        details={
          <View>
            <Text>九大カフェ</Text>
            <Text variant="caption" tone="muted">
              受付番号 K-080
            </Text>
            <Text variant="caption" tone="muted">
              10月31日 10:00〜10:30
            </Text>
          </View>
        }
      />
      <QrCode
        {...args}
        variant="compact"
        details={
          <Text variant="caption" tone="muted">
            kyudaisai.jp
          </Text>
        }
        actions={link}
      />
    </View>
  ),
};
export const Loading: Story = { name: "読み込み中", args: { state: "loading" } };
export const Unavailable: Story = {
  name: "利用できないコード",
  args: {
    state: "unavailable",
    message: "有効期限が過ぎています。受付で担当者にお声がけください。",
    actions: link,
  },
};
function RetryExample(args: React.ComponentProps<typeof QrCode>) {
  const [state, setState] = useState<"error" | "ready">("error");
  return <QrCode {...args} state={state} onRetry={() => setState("ready")} />;
}
export const Error: Story = {
  name: "エラーと再読み込み",
  render: (args) => <RetryExample {...args} />,
};
export const RetryDisabled: Story = {
  name: "再読み込みを無効化",
  args: { state: "error", onRetry: () => {}, retryDisabled: true },
};
export const LongContent: Story = {
  name: "長い名称",
  args: {
    variant: "compact",
    title: "九州大学の研究を体験できる科学実験とワークショップのご案内",
    actions: link,
  },
};
export const Dark: Story = { name: "暗色テーマ", parameters: { nativeTheme: "dark" } };

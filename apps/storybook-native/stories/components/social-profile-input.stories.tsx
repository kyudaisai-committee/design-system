import type { Meta, StoryObj } from "@storybook/react-native";

import { Button, SocialProfileInput, Text, type SocialProfileProvider } from "@kyudaisai/ui-native";
import { useState } from "react";
import { View } from "react-native";

import { SocialProfileExample } from "./form-control-examples";

function ProviderChanges() {
  const [value, setValue] = useState(["photos"]);
  const [providers, setProviders] = useState<SocialProfileProvider[]>(["instagram", "homepage"]);
  return (
    <View style={{ gap: 24 }}>
      <Text>候補の表示を切り替えても、新しい候補を選択できます。</Text>
      <Button
        title="Webサイトだけ表示"
        variant="outline"
        onPress={() => setProviders(["homepage"])}
      />
      <Button
        title="すべての候補を表示"
        variant="outline"
        onPress={() => setProviders(["instagram", "homepage"])}
      />
      <SocialProfileInput
        label="プロフィール"
        options={[
          {
            value: "photos",
            label: "Instagram",
            description: "@sample_account",
            provider: "instagram",
          },
          {
            value: "website",
            label: "Webサイト",
            description: "https://example.com",
            provider: "homepage",
          },
        ]}
        value={value}
        allowedProviders={providers}
        onValueChange={setValue}
        noAccount={false}
        onNoAccountChange={() => {}}
        maxSelections={1}
      />
    </View>
  );
}

const meta = {
  title: "Components/SocialProfileInput",
  component: SocialProfileExample,
  args: { disabled: false, readOnly: false, noAccount: false },
  parameters: {
    notes:
      "利用側から渡したプロフィールの候補を選択します。アカウントなしと個別選択は同時に保持しません。アカウント連携・認証・プロフィール取得はこの部品の責務ではありません。",
  },
} satisfies Meta<typeof SocialProfileExample>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const NoAccount: Story = { args: { noAccount: true } };
export const ChangingProviders: Story = { render: () => <ProviderChanges /> };
export const Invalid: Story = {
  args: { error: "プロフィールを選ぶか、アカウントなしを選択してください。" },
};
export const Disabled: Story = { args: { disabled: true } };
export const ReadOnly: Story = { args: { readOnly: true } };
export const Dark: Story = { parameters: { nativeTheme: "dark" } };

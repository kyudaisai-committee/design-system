import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn, userEvent, within } from "storybook/test";

import { SocialProfileInput } from "./selection-fields";
import { useStoryControls } from "./story-controls";

const meta = {
  title: "Components/SocialProfileInput",
  component: SocialProfileInput,
  args: {
    label: "公開するプロフィール",
    hint: "登録済みのプロフィールから2つまで選択してください。",
    options: [
      { value: "profile-a", label: "写真のプロフィール", description: "Instagram・@example" },
      { value: "profile-b", label: "動画のプロフィール", description: "YouTube・Example" },
      { value: "profile-c", label: "Webサイト", description: "example.com" },
    ],
    value: [] as string[],
    noAccount: false,
    allowNoAccount: true,
    maxSelections: 2,
    disabled: false,
    readOnly: false,
    onValueChange: fn(),
    onNoAccountChange: fn(),
  },
  parameters: {
    docs: {
      description: {
        component:
          "利用側で用意したプロフィール候補を選択します。アカウントを持たない場合の選択肢も表示できます。登録・外部サービスとの連携・本人確認はこの部品では行いません。",
      },
    },
  },
  render: function Example(incoming) {
    const [args, updateArgs] = useStoryControls(incoming);
    return (
      <SocialProfileInput
        {...args}
        onValueChange={(value) => {
          updateArgs({ value });
          args.onValueChange(value);
        }}
        onNoAccountChange={(noAccount) => {
          updateArgs({ noAccount });
          args.onNoAccountChange(noAccount);
        }}
      />
    );
  },
} satisfies Meta<typeof SocialProfileInput>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const profile = canvas.getByRole("checkbox", { name: /写真のプロフィール/ });
    await userEvent.click(profile);
    await expect(profile).toBeChecked();
    await userEvent.click(canvas.getByRole("checkbox", { name: "アカウントを持っていません" }));
    await expect(profile).not.toBeChecked();
    await expect(profile).toHaveAttribute("aria-disabled", "true");
    await userEvent.click(canvas.getByRole("checkbox", { name: "アカウントを持っていません" }));
    await expect(profile).not.toHaveAttribute("aria-disabled", "true");
  },
};
export const Invalid: Story = {
  args: { error: "プロフィールか「アカウントを持っていません」を選んでください。", required: true },
};
export const NoAccount: Story = { args: { noAccount: true } };
export const Disabled: Story = { args: { disabled: true, value: ["profile-a"] } };
export const ReadOnly: Story = { args: { readOnly: true, value: ["profile-a"] } };

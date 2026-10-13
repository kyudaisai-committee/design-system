import type { Meta, StoryObj } from "@storybook/react-vite";
import { useStoryControls } from "./story-controls";
import { expect, userEvent, within } from "storybook/test";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./accordion";

const meta = {
  title: "Components/Accordion",
  component: Accordion,
  subcomponents: { AccordionItem, AccordionTrigger, AccordionContent },
  args: { value: [], multiple: false, disabled: false },
  argTypes: {
    value: {
      control: "object",
      description: "開いている Item の value の配列。",
    },
    multiple: {
      control: "boolean",
      description: "複数の項目を同時に開ける。",
      table: { defaultValue: { summary: "false" } },
    },
    disabled: { control: "boolean" },
    onValueChange: {
      control: false,
      description: "開いている項目のvalueを配列で受け取る。",
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "補足情報を項目ごとに開閉します。重要な期限やエラー、全員が読む必要のある案内は、折りたたまずに表示してください。\n\nTabキーで見出しへ移動し、EnterキーまたはSpaceキーで開閉します。",
      },
    },
  },
  render: function Render(incoming) {
    const [args, updateArgs] = useStoryControls(incoming);
    return (
      <Accordion
        {...args}
        className="max-w-xl"
        onValueChange={(value) => updateArgs({ value })}
      >
        <AccordionItem value="description">
          <AccordionTrigger>紹介文はどのように書きますか？</AccordionTrigger>
          <AccordionContent>
            見どころや体験できることを、初めて読む人にも分かる言葉で紹介してください。
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="edit">
          <AccordionTrigger>提出後に内容を変更できますか？</AccordionTrigger>
          <AccordionContent>
            変更する内容を企画担当者に連絡してください。差し戻し後に編集できます。
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="contact">
          <AccordionTrigger>当日の連絡先はどこですか？</AccordionTrigger>
          <AccordionContent>
            企画責任者向けの案内に記載した運営本部へご連絡ください。
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    );
  },
} satisfies Meta<typeof Accordion>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  name: "基本",
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole("button", {
      name: "紹介文はどのように書きますか？",
    });
    trigger.focus();
    await userEvent.keyboard("{Enter}");
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await userEvent.keyboard(" ");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
  },
};
export const Expanded: Story = {
  name: "開いた状態",
  args: { value: ["description"] },
};
export const Multiple: Story = {
  name: "複数を開く",
  args: { multiple: true, value: ["description", "edit"] },
};
export const Disabled: Story = {
  name: "無効",
  args: { disabled: true },
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole("button", {
      name: "紹介文はどのように書きますか？",
    });
    await expect(trigger).toBeDisabled();
    await expect(Number(getComputedStyle(trigger).opacity)).toBeLessThan(1);
  },
};

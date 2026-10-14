import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, userEvent, within } from "storybook/test";

import { useStoryControls } from "./story-controls";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";

function renderTabs(variant: "default" | "line"): Meta<typeof Tabs>["render"] {
  return function Render(incoming) {
    const [args, updateArgs] = useStoryControls(incoming);
    return (
      <Tabs {...args} className="max-w-xl gap-5" onValueChange={(value) => updateArgs({ value })}>
        <TabsList variant={variant} aria-label="企画情報">
          <TabsTrigger value="overview">基本情報</TabsTrigger>
          <TabsTrigger value="documents">提出資料</TabsTrigger>
          <TabsTrigger value="review" disabled>
            審査結果
          </TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <h2 className="mb-2 font-medium">九大カフェ</h2>
          <p>企画番号 K-080 · 模擬店</p>
        </TabsContent>
        <TabsContent value="documents">
          <h2 className="mb-2 font-medium">提出資料</h2>
          <ul className="list-disc pl-5">
            <li>企画申請書</li>
            <li>会場配置図</li>
          </ul>
        </TabsContent>
        <TabsContent value="review">
          <p>審査結果</p>
        </TabsContent>
      </Tabs>
    );
  };
}
const meta = {
  title: "Components/Tabs",
  component: Tabs,
  subcomponents: { TabsList, TabsTrigger, TabsContent },
  args: { value: "overview", orientation: "horizontal" },
  argTypes: {
    value: {
      control: "select",
      options: ["overview", "documents"],
      description: "表示する Trigger / Content の value。",
    },
    orientation: {
      control: "inline-radio",
      options: ["horizontal", "vertical"],
      description: "配置と矢印キーの操作方向。",
      table: { defaultValue: { summary: "horizontal" } },
    },
    onValueChange: { control: false },
  },
  parameters: {
    docs: {
      description: {
        component:
          "同じ対象に関する情報を、同じ領域で切り替えて表示します。別ページへの移動にはリンク、手続きの段階表示にはProcessStepsを使います。\n\n矢印キーでタブへフォーカスを移し、EnterキーまたはSpaceキーで表示を切り替えます。",
      },
    },
  },
  render: renderTabs("default"),
} satisfies Meta<typeof Tabs>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  name: "基本",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    canvas.getByRole("tab", { name: "基本情報" }).focus();
    await userEvent.keyboard("{ArrowRight}{Enter}");
    await expect(canvas.getByRole("tab", { name: "提出資料" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await expect(canvas.getByRole("tabpanel", { name: "提出資料" })).toBeVisible();
    await userEvent.keyboard("{ArrowRight}{Enter}");
    await expect(canvas.getByRole("tab", { name: "審査結果" })).toHaveAttribute(
      "aria-selected",
      "false",
    );
    await expect(canvas.getByRole("tab", { name: "提出資料" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await userEvent.keyboard("{ArrowRight}");
    await expect(canvas.getByRole("tab", { name: "基本情報" })).toHaveFocus();
  },
};
export const Line: Story = { name: "下線", render: renderTabs("line") };
export const Vertical: Story = {
  name: "縦",
  args: { orientation: "vertical" },
  render: renderTabs("line"),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("tablist")).toHaveAttribute("aria-orientation", "vertical");
    canvas.getByRole("tab", { name: "基本情報" }).focus();
    await userEvent.keyboard("{ArrowDown}{Enter}");
    await expect(canvas.getByRole("tab", { name: "提出資料" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  },
};

export const Narrow: Story = {
  name: "狭い領域のタブ",
  render: () => (
    <div style={{ width: 256, maxWidth: "100%" }}>
      <Tabs defaultValue="overview">
        <TabsList aria-label="企画情報">
          <TabsTrigger value="overview">企画の基本情報</TabsTrigger>
          <TabsTrigger value="documents">提出した申請書類</TabsTrigger>
          <TabsTrigger value="review">審査結果と修正依頼</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">名称と責任者を確認できます。</TabsContent>
        <TabsContent value="documents">提出した申請書を確認できます。</TabsContent>
        <TabsContent value="review">審査結果を確認できます。</TabsContent>
      </Tabs>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const list = canvas.getByRole("tablist");
    await expect(list.getBoundingClientRect().width).toBeLessThanOrEqual(
      list.parentElement!.parentElement!.getBoundingClientRect().width,
    );
    canvas.getByRole("tab", { name: "企画の基本情報" }).focus();
    await userEvent.keyboard("{End}{Enter}");
    const last = canvas.getByRole("tab", { name: "審査結果と修正依頼" });
    await expect(last).toHaveAttribute("aria-selected", "true");
    await expect(last.getBoundingClientRect().right).toBeLessThanOrEqual(
      list.getBoundingClientRect().right + 1,
    );
    await expect(canvas.getByRole("tabpanel", { name: "審査結果と修正依頼" })).toBeVisible();
  },
};

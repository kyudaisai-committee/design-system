import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { DateDetails } from "./date-details";

const meta = {
  title: "Components/DateDetails",
  component: DateDetails,
  args: {
    "aria-label": "提出に関する日時（日本時間）",
    items: [
      {
        id: "due",
        label: "提出期限",
        value: "10月15日 17:00",
        dateTime: "2026-10-15T17:00:00+09:00",
      },
      {
        id: "actual",
        label: "提出日時",
        value: "10月5日 14:30",
        dateTime: "2026-10-05T14:30:00+09:00",
      },
    ],
  },
  argTypes: {
    items: {
      control: "object",
      description:
        "ラベルと日時の組。valueは表示文字列、dateTimeは機械可読な日時です。",
    },
    "aria-label": {
      control: "text",
      description: "日付のまとまりの読み上げ名。",
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "締切・予定日・提出日などを、意味が分かるラベルと一緒に表示します。日時の書式は利用する画面で揃え、未定の場合は「未定」と表示してください。\n\n`items`には次の値を指定します。期限超過の判定は利用側で行います。\n\n| 項目 | 指定する内容 |\n| --- | --- |\n| `id` | 各日時を識別する一意の値 |\n| `label` | 「提出期限」「提出日」などの名前 |\n| `value` | 「10月20日 17:00」「未定」などの表示文字列 |\n| `dateTime` | HTMLのtime要素に渡す日時。時刻にはタイムゾーンも含め、未定の場合は省略する |\n| `emphasis` | 強調する場合にtrueを指定する |\n| `note` | 「締切まで3日」など、日時に添える短い補足 |",
      },
    },
  },
} satisfies Meta<typeof DateDetails>;
export default meta;
type Story = StoryObj<typeof meta>;

export const DeadlineAndActual: Story = { name: "期限と提出日時" };

export const ExtendedDeadline: Story = {
  name: "延長後の期限",
  args: {
    items: [
      {
        id: "due",
        label: "提出期限",
        value: "10月20日 17:00",
        dateTime: "2026-10-20T17:00:00+09:00",
        emphasis: true,
        note: "延長済み",
      },
      {
        id: "standard",
        label: "標準期限",
        value: "10月15日 17:00",
        dateTime: "2026-10-15T17:00:00+09:00",
      },
    ],
  },
};

export const UnknownDate: Story = {
  name: "未定・未通知",
  args: {
    "aria-label": "審査結果の日時",
    items: [
      { id: "expected", label: "通知予定", value: "未定" },
      { id: "actual", label: "通知日時", value: "未通知" },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("未定").closest("time")).toBeNull();
    await expect(canvas.getByText("未通知").closest("time")).toBeNull();
  },
};

export const NarrowContainer: Story = {
  name: "狭い欄",
  args: ExtendedDeadline.args,
  render: (args) => (
    <div style={{ maxWidth: "16rem" }}>
      <DateDetails {...args} />
    </div>
  ),
};

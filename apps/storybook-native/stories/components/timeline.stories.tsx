import type { Meta, StoryObj } from "@storybook/react-native";

import {
  Timeline,
  sequenceIconNames,
  type SequenceIconName,
  type TimelineProps,
} from "@kyudaisai/ui-native";

const meta = {
  title: "Components/Timeline",
  component: Timeline,
  args: {
    orderLabel: "古い順・日本時間",
    firstIcon: "upload",
    currentStatus: { label: "確認済み", tone: "success" },
    items: [
      {
        id: "received",
        title: "第1版の受付",
        date: "10月13日 15:30",
        icon: "upload",
        metadata: "受付番号：A-0123",
      },
      {
        id: "correction",
        title: "修正の依頼",
        date: "10月14日 10:00",
        icon: "undo",
        tone: "warning",
        description: "添付資料に日付を追記してください。",
      },
      {
        id: "resubmitted",
        title: "第2版の受付",
        date: "10月15日 11:00",
        icon: "upload",
        description: "添付資料の日付を更新しました。",
      },
      {
        id: "confirmed",
        title: "第2版の確認",
        date: "10月15日 14:30",
        icon: "check",
        tone: "success",
      },
    ],
  },
  argTypes: {
    firstIcon: {
      name: "先頭の出来事のアイコン",
      control: "select",
      options: sequenceIconNames,
    },
    items: { control: false },
    currentStatus: { control: "object" },
  },
  parameters: {
    notes:
      "現在の状態はcurrentStatusで指定し、履歴の上に一つだけ表示します。配列の先頭・末尾や日時から推定しないため、新しい順に並べ替えても状態は変わりません。履歴は見出しで出来事を伝え、途中に状態バッジを置きません。iconは固定セットから選びます。Controlsでは先頭の出来事のアイコンを変更できます。",
  },
  render: ({ firstIcon, ...args }) => (
    <Timeline
      {...args}
      items={args.items.map((item, index) => (index === 0 ? { ...item, icon: firstIcon } : item))}
    />
  ),
} satisfies Meta<TimelineProps & { firstIcon: SequenceIconName }>;
export default meta;
type Story = StoryObj<typeof meta>;
export const History: Story = {};
export const NewestFirst: Story = {
  args: {
    firstIcon: "check",
    orderLabel: "新しい順・日本時間",
    items: [...meta.args.items].reverse(),
  },
};
export const LatestNotification: Story = {
  args: {
    items: [
      ...meta.args.items,
      { id: "notified", title: "確認結果をメールで通知", date: "10月15日 14:35", icon: "upload" },
    ],
  },
};
export const MissingDate: Story = {
  args: {
    firstIcon: "clock",
    currentStatus: undefined,
    items: [
      {
        id: "imported",
        title: "過去の記録を取り込み",
        date: "時刻の記録なし",
        icon: "clock",
        description: "日時は元の記録に残っていません。",
      },
    ],
  },
};
export const LongDetails: Story = {
  args: {
    firstIcon: "edit",
    currentStatus: { label: "更新済み" },
    items: [
      {
        id: "corrected",
        title: "会場の案内資料と配付用文書の更新",
        date: "10月15日 14:30",
        icon: "edit",
        description:
          "受付場所の名称と開始時刻を更新しました。以前の文書を持っている場合は、新しい版で確認してください。",
      },
    ],
  },
};
export const Dark: Story = { parameters: { nativeTheme: "dark" } };

import type { Meta, StoryObj } from "@storybook/react-vite";

import { Truck } from "lucide-react";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";

import { Button } from "./button";
import { LoadingState, Notice } from "./compositions";
import { applicationSequenceIcons as icons } from "./sequence-example-icons";
import { Timeline, type TimelineEvent } from "./timeline";

const events: TimelineEvent[] = [
  {
    id: "assigned-1",
    title: "提出を割り当てました",
    icon: icons.assigned,
    timestamp: { dateTime: "2026-10-01T09:00:00+09:00", label: "10月1日 9:00" },
    metadata: "申請担当",
  },
  {
    id: "submitted-1",
    title: "第1版を提出しました",
    icon: icons.submitted,
    timestamp: {
      dateTime: "2026-10-05T14:30:00+09:00",
      label: "10月5日 14:30",
    },
    metadata: "企画担当",
  },
  {
    id: "review-1",
    title: "審査を開始しました",
    icon: icons.review,
    timestamp: {
      dateTime: "2026-10-06T10:00:00+09:00",
      label: "10月6日 10:00",
    },
  },
  {
    id: "returned-1",
    title: "修正のため差し戻しました",
    tone: "warning",
    icon: icons.returned,
    timestamp: {
      dateTime: "2026-10-06T16:00:00+09:00",
      label: "10月6日 16:00",
    },
    metadata: "審査担当",
    description: "会場配置図に避難経路を追記してください。",
  },
  {
    id: "submitted-2",
    title: "第2版を再提出しました",
    icon: icons.submitted,
    timestamp: {
      dateTime: "2026-10-08T11:00:00+09:00",
      label: "10月8日 11:00",
    },
    metadata: "企画担当",
    description: "避難経路を追記しました。",
  },
  {
    id: "approved-2",
    title: "第2版を承認しました",
    icon: icons.approved,
    tone: "success",
    timestamp: {
      dateTime: "2026-10-09T15:00:00+09:00",
      label: "10月9日 15:00",
    },
    metadata: "審査担当",
  },
];

const meta = {
  title: "Components/Timeline",
  component: Timeline,
  args: {
    label: "申請履歴（古い順・日本時間）",
    events,
    currentStatus: { label: "承認済み", tone: "success" },
  },
  argTypes: {
    label: {
      control: "text",
      description: "履歴の読み上げ名。並び順も含めます。",
    },
    events: {
      control: false,
      description:
        "表示する順に並べた出来事の配列。同じ種類の出来事にも、それぞれ異なるidを付けます。",
    },
    emptyMessage: { control: "text", description: "履歴がない場合の表示。" },
    currentStatus: {
      control: "object",
      description: "現在の状態をlabelとtoneで指定します。履歴の並び順からは推定しません。",
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "提出・差し戻し・承認など、起きた出来事を日時とともに表示します。手続きの現在位置にはProcessSteps、期限や予定日の表示にはDateDetailsを使います。\n\n現在の状態は`currentStatus`に`label`と`tone`を指定し、履歴の上に一つだけ表示します。出来事の先頭・末尾や日時からは推定しません。途中の出来事には状態バッジを置かず、見出しで出来事を伝えます。\n\n`events`は表示する順に指定してください。日時による自動の並べ替えは行いません。同じ操作を繰り返した場合も、出来事ごとに別の`id`を付けます。\n\n| 項目 | 指定する内容 |\n| --- | --- |\n| `id`・`title` | 出来事を識別する一意の値と、表示する出来事の名前 |\n| `timestamp` | 表示文字列を`label`、HTML用の日時を`dateTime`に指定する。時刻にはタイムゾーンも含める |\n| `description` | 変更内容や、結果に対する説明 |\n| `metadata`・`actions` | 操作した人などの補足と、関連資料を開くなどの操作 |\n| `tone` | 案内は`info`、成功は`success`、注意は`warning`、失敗は`danger`。省略時は中立色 |\n| `icon` | 出来事の意味を表すアイコン |",
      },
    },
  },
} satisfies Meta<typeof Timeline>;
export default meta;
type Story = StoryObj<typeof meta>;

export const History: Story = {
  name: "差し戻しと再提出の履歴",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const items = canvas.getAllByRole("listitem");
    await expect(items).toHaveLength(6);
    await expect(items[1]).toHaveTextContent("第1版を提出しました");
    await expect(items[4]).toHaveTextContent("第2版を再提出しました");
    await expect(canvasElement.querySelectorAll("time")).toHaveLength(6);
    await expect(canvasElement.querySelector("[aria-current]")).toBeNull();
    await expect(canvas.getByRole("group", { name: "現在の状態" })).toHaveTextContent("承認済み");
    await expect(canvas.queryByText("現在の状態")).not.toBeInTheDocument();
    await expect(canvasElement.querySelectorAll('[data-slot="badge"]')).toHaveLength(1);
    for (const item of items) {
      await expect(item.querySelector('[data-slot="badge"]')).toBeNull();
    }
  },
};
export const NewestFirst: Story = {
  name: "新しい順",
  args: {
    label: "申請履歴（新しい順・日本時間）",
    events: [...events].reverse(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole("listitem")[0]).toHaveTextContent("第2版を承認しました");
    await expect(canvas.getByRole("group", { name: "現在の状態" })).toHaveTextContent("承認済み");
    await expect(canvasElement.querySelectorAll('[data-slot="badge"]')).toHaveLength(1);
  },
};
export const LatestNotification: Story = {
  name: "最後の通知と現在状態を区別",
  args: {
    events: [
      ...events,
      {
        id: "notified-2",
        title: "審査結果をメールで通知しました",
        timestamp: { dateTime: "2026-10-09T15:05:00+09:00", label: "10月9日 15:05" },
      },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole("listitem").at(-1)).toHaveTextContent(
      "審査結果をメールで通知",
    );
    await expect(canvas.getByRole("group", { name: "現在の状態" })).toHaveTextContent("承認済み");
    await expect(canvasElement.querySelectorAll('[data-slot="badge"]')).toHaveLength(1);
  },
};
export const Delivery: Story = {
  name: "別用途・配送履歴",
  args: {
    label: "配送履歴（古い順）",
    currentStatus: { label: "配送中" },
    events: [
      {
        id: "collected",
        title: "荷物を受け付けました",
        timestamp: {
          dateTime: "2026-10-10T10:00:00+09:00",
          label: "10月10日 10:00（日本時間）",
        },
      },
      {
        id: "shipping",
        title: "配送拠点を出発しました",
        icon: Truck,
        timestamp: {
          dateTime: "2026-10-11T07:00:00+09:00",
          label: "10月11日 7:00（日本時間）",
        },
        description: "次の拠点への到着後に更新します。",
      },
    ],
  },
};
export const MissingTimestamp: Story = {
  name: "時刻不明・長い内容",
  args: {
    currentStatus: undefined,
    events: [
      {
        id: "imported",
        title: "配置図の修正を受け付けました",
        metadata: "受付時刻の記録なし",
        description:
          "会場南側の通路幅を広げ、調理設備と来場者の待機列が重ならないよう配置を変更しました。修正後の配置図を確認してください。",
      },
    ],
  },
  render: (args) => (
    <div style={{ maxWidth: "20rem" }}>
      <Timeline {...args} />
    </div>
  ),
};
export const Empty: Story = {
  name: "履歴なし",
  args: { events: [], currentStatus: undefined },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("履歴はまだありません。")).toBeVisible();
    await expect(canvas.queryByRole("list")).not.toBeInTheDocument();
  },
};
export const Loading: Story = {
  name: "履歴の読み込み中",
  render: () => <LoadingState label="履歴を読み込んでいます" />,
};

function RetryExample() {
  const [state, setState] = useState<"error" | "loading" | "ready">("error");
  return (
    <div className="ds-stack">
      {state === "error" ? (
        <Notice title="履歴を取得できませんでした" tone="danger">
          <p>時間をおいて再度読み込んでください。</p>
          <div>
            <Button
              variant="outline"
              onClick={async () => {
                setState("loading");
                await new Promise((resolve) => setTimeout(resolve, 700));
                setState("ready");
              }}
            >
              再読み込み
            </Button>
          </div>
        </Notice>
      ) : state === "loading" ? (
        <>
          <LoadingState label="履歴を読み込んでいます" />
          <div>
            <Button pending>読み込み中…</Button>
          </div>
        </>
      ) : (
        <Timeline
          label="申請履歴（古い順・日本時間）"
          events={events}
          currentStatus={{ label: "承認済み", tone: "success" }}
        />
      )}
    </div>
  );
}
export const LoadFailure: Story = {
  name: "取得失敗・再試行",
  render: () => <RetryExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    await expect(canvas.getByRole("button", { name: "再読み込み" })).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(
      canvas.getByRole("status", { name: "履歴を読み込んでいます" }),
    ).toBeInTheDocument();
    await expect(canvas.getByRole("button", { name: "読み込み中…" })).toBeDisabled();
    await expect(
      await canvas.findByRole("list", { name: "申請履歴（古い順・日本時間）" }),
    ).toBeInTheDocument();
  },
};

function EventActionExample() {
  const [opened, setOpened] = useState(false);
  return (
    <div className="ds-stack">
      <Timeline
        label="操作付きの履歴"
        currentStatus={{ label: "要修正", tone: "warning" }}
        events={[
          {
            ...events[3],
            actions: (
              <Button variant="outline" onClick={() => setOpened(true)}>
                差し戻し理由を確認
              </Button>
            ),
          },
        ]}
      />
      {opened && (
        <Notice title="修正する内容" tone="warning" role="status">
          会場配置図に避難経路を追記してください。
        </Notice>
      )}
    </div>
  );
}
export const WithAction: Story = {
  name: "出来事に関連する操作",
  render: () => <EventActionExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    await expect(canvas.getByRole("button", { name: "差し戻し理由を確認" })).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(canvas.getByRole("status")).toHaveTextContent("会場配置図に避難経路を追記");
  },
};

import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { Button } from "./button";
import { Notice } from "./compositions";
import { ProcessSteps, type ProcessStep } from "./process-steps";
import { Timeline } from "./timeline";
import { DateDetails, type DateDetail } from "./date-details";
import { applicationSequenceIcons as icons } from "./sequence-example-icons";

const submissionDeadline: DateDetail = {
  id: "due",
  label: "提出期限",
  value: "10月15日 17:00",
  dateTime: "2026-10-15T17:00:00+09:00",
};
const submittedAt = {
  dateTime: "2026-10-05T14:30:00+09:00",
  label: "10月5日 14:30",
};
const resultPlan: DateDetail = {
  id: "expected",
  label: "通知予定",
  value: "10月22日",
  dateTime: "2026-10-22",
};
const extendedDeadline: DateDetail = {
  id: "due",
  label: "提出期限",
  value: "10月20日 17:00",
  dateTime: "2026-10-20T17:00:00+09:00",
  emphasis: true,
  note: "延長済み",
};

const reviewSteps: ProcessStep[] = [
  {
    id: "assigned",
    title: "提出割当て",
    icon: icons.assigned,
    status: "complete",
    statusLabel: "割当て済み",
    timestamp: { dateTime: "2026-10-01T09:00:00+09:00", label: "10月1日 9:00" },
  },
  {
    id: "submitted",
    title: "提出",
    icon: icons.submitted,
    status: "complete",
    statusLabel: "提出済み",
    metadata: (
      <DateDetails
        items={[
          submissionDeadline,
          {
            id: "actual",
            label: "提出日時",
            value: submittedAt.label,
            dateTime: submittedAt.dateTime,
          },
        ]}
      />
    ),
  },
  {
    id: "review",
    title: "審査",
    icon: icons.review,
    status: "current",
    statusLabel: "審査中",
  },
  {
    id: "decision",
    title: "審査結果",
    icon: icons.decision,
    status: "upcoming",
    statusLabel: "結果待ち",
    metadata: <DateDetails items={[resultPlan]} />,
  },
];

const returnedSteps: ProcessStep[] = [
  reviewSteps[0],
  {
    id: "submitted",
    title: "修正・再提出",
    status: "current",
    statusLabel: "要修正",
    tone: "warning",
    icon: icons.returned,
    metadata: (
      <DateDetails
        items={[
          {
            id: "due",
            label: "再提出期限",
            value: "10月20日 17:00",
            dateTime: "2026-10-20T17:00:00+09:00",
          },
        ]}
      />
    ),
    description: "添付資料の不足を確認し、期限までに再提出してください。",
  },
  { id: "review", title: "再審査", icon: icons.review, status: "upcoming" },
  {
    id: "decision",
    title: "審査結果",
    icon: icons.decision,
    status: "upcoming",
    statusLabel: "結果待ち",
    metadata: <DateDetails items={[resultPlan]} />,
  },
];

function awaitingSubmission(dates: readonly DateDetail[]): ProcessStep[] {
  return [
    reviewSteps[0],
    {
      id: "submitted",
      title: "提出",
      icon: icons.submitted,
      status: "current",
      statusLabel: "提出待ち",
      metadata: <DateDetails items={dates} />,
      description: "期限までに入力・提出してください。",
    },
    {
      ...reviewSteps[2],
      status: "upcoming",
      statusLabel: "未着手",
      description: undefined,
    },
    reviewSteps[3],
  ];
}

function resolvedSteps(approved: boolean): ProcessStep[] {
  return [
    ...reviewSteps.slice(0, 2),
    {
      id: "review",
      title: "審査",
      icon: icons.review,
      status: "complete",
      statusLabel: "審査終了",
    },
    {
      id: "decision",
      title: "審査結果",
      status: "complete",
      icon: approved ? icons.approved : icons.rejected,
      statusLabel: approved ? "承認" : "却下",
      tone: approved ? "success" : "danger",
      description: approved
        ? "提出内容が承認されました。"
        : "申請条件を満たしていません。理由の詳細を確認してください。",
    },
  ];
}

const meta = {
  title: "Components/ProcessSteps",
  component: ProcessSteps,
  args: {
    label: "申請の進行状況",
    steps: reviewSteps,
    orientation: "horizontal",
  },
  argTypes: {
    label: { control: "text", description: "進行表示の読み上げ名。" },
    orientation: {
      control: "inline-radio",
      options: ["horizontal", "vertical"],
      description: "横並びは狭いコンテナで縦並びになります。",
    },
    steps: {
      control: false,
      description: "表示する順に並べた段階の配列。現在の段階は最大1件。",
    },
    emptyMessage: { control: "text", description: "段階がない場合の表示。" },
  },
  parameters: {
    docs: {
      description: {
        component:
          "順序が決まった手続きの現在位置と、次の段階を示します。承認と却下のように分岐する結果を、一続きの段階として並べないでください。出来事の履歴にはTimelineを使います。\n\n`steps`は表示する順に指定します。状態は利用側で判断し、現在の段階は最大1件にします。「審査が完了した」と「承認された」は区別し、結果は`statusLabel`に記載してください。\n\n| 項目 | 指定する内容 |\n| --- | --- |\n| `id`・`title` | 段階を識別する一意の値と、表示する段階名 |\n| `status` | 完了は`complete`、現在は`current`、未着手は`upcoming`、対象外は`skipped` |\n| `statusLabel` | 「要修正」「承認済み」などの状態名。省略時はstatusに対応する標準名を表示する |\n| `tone` | 案内は`info`、成功は`success`、注意は`warning`、失敗は`danger`。省略時は中立色 |\n| `description` | その段階で必要な説明や対応 |\n| `timestamp` | 表示文字列を`label`、HTML用の日時を`dateTime`に指定する。時刻にはタイムゾーンも含める |\n| `metadata`・`actions` | 担当者などの補足と、その段階で実行できる操作 |\n| `icon` | 段階の意味を表すアイコン。同じ段階には状態が変わっても同じアイコンを使う |",
      },
    },
  },
} satisfies Meta<typeof ProcessSteps>;
export default meta;
type Story = StoryObj<typeof meta>;

export const InReview: Story = {
  name: "審査中",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const list = canvas.getByRole("list", { name: "申請の進行状況" });
    await expect(within(list).getAllByRole("listitem")).toHaveLength(4);
    await expect(within(list).getAllByRole("listitem")[2]).toHaveAttribute(
      "aria-current",
      "step",
    );
    await expect(canvas.queryByRole("progressbar")).not.toBeInTheDocument();
    await expect(canvas.queryByRole("tablist")).not.toBeInTheDocument();
    await expect(canvas.getByText("10月5日 14:30")).toHaveAttribute(
      "datetime",
      "2026-10-05T14:30:00+09:00",
    );
    const steps = within(list).getAllByRole("listitem");
    await expect(within(steps[1]).getByText("提出期限")).toBeVisible();
    await expect(within(steps[1]).getByText("提出日時")).toBeVisible();
    await expect(within(steps[3]).getByText("10月22日")).toHaveAttribute(
      "datetime",
      "2026-10-22",
    );
  },
};
export const Assigned: Story = {
  name: "提出待ち",
  args: { steps: awaitingSubmission([submissionDeadline]) },
};
export const ExtendedDeadline: Story = {
  name: "期限延長・適用期限を優先",
  args: {
    steps: awaitingSubmission([
      extendedDeadline,
      { ...submissionDeadline, id: "standard", label: "標準期限" },
    ]),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const steps = canvas.getAllByRole("listitem");
    const submission = within(steps[1]);
    const effective = submission.getByText("10月20日 17:00");
    const standard = submission.getByText("10月15日 17:00");
    await expect(effective).toHaveAttribute(
      "datetime",
      "2026-10-20T17:00:00+09:00",
    );
    await expect(effective.closest("strong")).not.toBeNull();
    await expect(standard.closest("strong")).toBeNull();
    await expect(submission.getByText("延長済み").closest("time")).toBeNull();
    await expect(steps[1]).toHaveAttribute("aria-current", "step");
    await expect(within(steps[3]).getByText("10月22日")).toHaveAttribute(
      "datetime",
      "2026-10-22",
    );
  },
};
export const ExtendedDeadlineUnknownStandard: Story = {
  name: "期限延長・標準期限を確認できない",
  args: {
    steps: awaitingSubmission([
      extendedDeadline,
      { id: "standard", label: "標準期限", value: "未確認" },
    ]),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("未確認").closest("time")).toBeNull();
    await expect(canvas.getByText("10月20日 17:00")).toHaveAttribute(
      "datetime",
      "2026-10-20T17:00:00+09:00",
    );
  },
};

export const ConsistentIcons: Story = {
  name: "進行表示と履歴で同じアイコン",
  render: () => (
    <div className="ds-stack">
      <section className="ds-stack">
        <h2>進行状況</h2>
        <ProcessSteps label="申請の進行状況" steps={reviewSteps} />
      </section>
      <section className="ds-stack">
        <h2>履歴</h2>
        <Timeline
          label="申請履歴（古い順）"
          events={[
            {
              id: "assigned-1",
              title: "提出を割り当てました",
              icon: icons.assigned,
              timestamp: reviewSteps[0].timestamp,
            },
            {
              id: "submitted-1",
              title: "提出しました",
              icon: icons.submitted,
              timestamp: submittedAt,
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
          ]}
        />
      </section>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const steps = within(
      canvas.getByRole("list", { name: "申請の進行状況" }),
    ).getAllByRole("listitem");
    const events = within(
      canvas.getByRole("list", { name: "申請履歴（古い順）" }),
    ).getAllByRole("listitem");
    for (let index = 0; index < events.length; index++) {
      await expect(steps[index].querySelector("svg")?.outerHTML).toBe(
        events[index].querySelector("svg")?.outerHTML,
      );
    }
  },
};

export const UnspecifiedIcons: Story = {
  name: "アイコン未指定時も同じ表示",
  render: () => (
    <div className="ds-stack">
      <ProcessSteps
        label="進行状況"
        steps={[{ id: "assigned", title: "提出割当て", status: "complete" }]}
      />
      <Timeline
        label="履歴"
        events={[{ id: "assigned-1", title: "提出を割り当てました" }]}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const progressIcon = canvas
      .getByRole("list", { name: "進行状況" })
      .querySelector("svg");
    const historyIcon = canvas
      .getByRole("list", { name: "履歴" })
      .querySelector("svg");
    await expect(progressIcon).not.toBeNull();
    await expect(progressIcon?.outerHTML).toBe(historyIcon?.outerHTML);
  },
};
export const Submitted: Story = {
  name: "提出済み・審査開始待ち",
  args: {
    steps: [
      reviewSteps[0],
      {
        ...reviewSteps[1],
        status: "current",
        description: "提出を受け付けました。審査開始をお待ちください。",
      },
      {
        ...reviewSteps[2],
        status: "upcoming",
        statusLabel: "未着手",
        description: undefined,
      },
      reviewSteps[3],
    ],
  },
};
export const Returned: Story = {
  name: "差し戻し・前の段階へ戻る",
  args: { steps: returnedSteps },
};
export const Approved: Story = {
  name: "承認・全段階終了",
  args: { steps: resolvedSteps(true) },
};
export const Rejected: Story = {
  name: "却下・全段階終了",
  args: { steps: resolvedSteps(false) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("却下")).toBeVisible();
    await expect(
      canvasElement.querySelectorAll('[aria-current="step"]'),
    ).toHaveLength(0);
    await expect(canvas.getAllByRole("listitem").at(-1)).toHaveAttribute(
      "data-status",
      "complete",
    );
  },
};
export const Vertical: Story = {
  name: "縦並び",
  args: { orientation: "vertical" },
};
export const WithDates: Story = {
  name: "段階内の日付・未定と未通知",
  args: {
    orientation: "vertical",
    steps: reviewSteps.map((step) => {
      if (step.id === "decision") {
        return {
          ...step,
          metadata: (
            <DateDetails
              items={[
                { id: "expected", label: "通知予定", value: "未定" },
                { id: "actual", label: "通知日時", value: "未通知" },
              ]}
            />
          ),
        };
      }
      return step;
    }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("未定").closest("time")).toBeNull();
    await expect(canvas.getByText("10月15日 17:00")).toHaveAttribute(
      "datetime",
      "2026-10-15T17:00:00+09:00",
    );
    await expect(canvas.getByText("未通知").closest("time")).toBeNull();
    await expect(canvas.getAllByRole("listitem")[3]).toHaveAttribute(
      "data-status",
      "upcoming",
    );
  },
};
export const NarrowContainer: Story = {
  name: "狭い欄・長い名称",
  render: (args) => (
    <div style={{ maxWidth: "20rem" }}>
      <ProcessSteps
        {...args}
        steps={args.steps.map((step, index) =>
          index === 2
            ? {
                ...step,
                title: "会場設備と食品の取扱いに関する担当部署の確認",
                statusLabel: "担当部署間で確認しています",
              }
            : step,
        )}
      />
    </div>
  ),
};
export const Skipped: Story = {
  name: "任意の段階を省略",
  args: {
    label: "予約の進行状況",
    steps: [
      { id: "request", title: "予約申込み", status: "complete" },
      {
        id: "payment",
        title: "支払確認",
        status: "skipped",
        statusLabel: "支払不要",
        description: "無料のため、この段階はありません。",
      },
      {
        id: "confirmed",
        title: "予約確定",
        status: "complete",
        tone: "success",
        statusLabel: "確定済み",
      },
    ],
  },
};
export const NotStarted: Story = {
  name: "開始前",
  args: {
    steps: reviewSteps.map((step) => ({
      id: step.id,
      title: step.title,
      icon: step.icon,
      status: "upcoming",
    })),
  },
};
export const Empty: Story = { name: "段階なし", args: { steps: [] } };
export const SingleStep: Story = {
  name: "一段階のみ",
  args: {
    label: "データ出力",
    steps: [
      {
        id: "export",
        title: "出力処理",
        status: "current",
        statusLabel: "処理中",
        description: "ファイルを準備しています。",
      },
    ],
  },
};

function RevisionExample() {
  const [submitted, setSubmitted] = useState(false);
  return (
    <div className="ds-stack">
      <ProcessSteps
        label="申請の進行状況"
        steps={submitted ? reviewSteps : returnedSteps}
      />
      <p role="status">
        {submitted
          ? "再提出を受け付けました。"
          : "会場配置図に避難経路を追記してください。"}
      </p>
      <div>
        <Button disabled={submitted} onClick={() => setSubmitted(true)}>
          {submitted ? "再提出済み" : "修正内容を再提出"}
        </Button>
      </div>
    </div>
  );
}
export const Revision: Story = {
  name: "現在位置の更新・キーボード",
  render: () => <RevisionExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    await expect(
      canvas.getByRole("button", { name: "修正内容を再提出" }),
    ).toHaveFocus();
    const steps = canvas.getAllByRole("listitem");
    await expect(steps[1]).toHaveAttribute("aria-current", "step");
    await expect(steps[2]).not.toHaveAttribute("aria-current");
    await expect(steps[2]).toHaveAttribute("data-status", "upcoming");
    await userEvent.keyboard("{Enter}");
    await expect(canvas.getAllByRole("listitem")[2]).toHaveAttribute(
      "aria-current",
      "step",
    );
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "再提出を受け付けました",
    );
    await expect(
      canvas.getByRole("button", { name: "再提出済み" }),
    ).toBeDisabled();
  },
};
export const Processing: Story = {
  name: "検査中・操作不可",
  render: () => (
    <div className="ds-stack">
      <ProcessSteps
        label="ファイルの処理状況"
        orientation="vertical"
        steps={[
          { id: "upload", title: "アップロード", status: "complete" },
          {
            id: "check",
            title: "内容の検査",
            status: "current",
            statusLabel: "処理中",
            description: "検査中はダウンロードできません。",
            actions: <Button disabled>ダウンロード</Button>,
          },
          { id: "ready", title: "利用開始", status: "upcoming" },
        ]}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole("button", { name: "ダウンロード" }),
    ).toBeDisabled();
  },
};
export const ProcessingFailure: Story = {
  name: "変換失敗",
  render: () => (
    <div className="ds-stack">
      <Notice title="配置図の変換に失敗しました" tone="danger">
        原本は保存されています。PDF形式のファイルをアップロードしてください。
      </Notice>
      <ProcessSteps
        label="配置図の処理状況"
        steps={[
          { id: "read", title: "アップロード", status: "complete" },
          {
            id: "convert",
            title: "変換",
            status: "current",
            statusLabel: "失敗",
            tone: "danger",
          },
          { id: "publish", title: "利用開始", status: "upcoming" },
        ]}
      />
    </div>
  ),
};

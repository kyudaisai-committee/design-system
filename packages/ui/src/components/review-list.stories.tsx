import { useId, useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within, waitFor } from "storybook/test";
import { Button } from "./button";
import { Input } from "./input";
import { Textarea } from "./textarea";
import { NativeSelect as Select } from "./native-select";
import { Table } from "./table";
import {
  Notice as Alert,
  StatusBadge as Badge,
  ContentCard as Card,
  LabeledCheckbox as Checkbox,
  Field,
  LoadingState as Skeleton,
  EmptyState,
} from "./compositions";

const records = [
  { id: "K-080", name: "九大カフェ", group: "喫茶研究会", state: "審査中" },
  { id: "K-081", name: "星空写真展", group: "天文サークル", state: "承認済み" },
  { id: "K-082", name: "秋の演奏会", group: "音楽サークル", state: "要修正" },
];
function ReviewList({
  loading = false,
  forbidden = false,
  error = false,
}: {
  loading?: boolean;
  forbidden?: boolean;
  error?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("すべて");
  const filtered = records.filter(
    (row) =>
      `${row.name}${row.group}${row.id}`.includes(query) &&
      (status === "すべて" || row.state === status),
  );
  return (
    <div className="ds-shell ds-stack">
      <header className="ds-header">
        <h1>企画の審査</h1>
      </header>
      {forbidden ? (
        <Alert title="この一覧を閲覧する権限がありません">
          担当者への権限申請が必要です。
        </Alert>
      ) : error ? (
        <Alert
          title="企画一覧を取得できませんでした"
          tone="danger"
          role="alert"
        >
          時間をおいてページを再読み込みしてください。
        </Alert>
      ) : loading ? (
        <Skeleton label="企画一覧を読み込んでいます" />
      ) : (
        <>
          <div className="ds-row">
            <div style={{ flex: "1 1 16rem" }}>
              <Field label="企画名・団体名・企画番号で検索">
                {(props) => (
                  <Input
                    {...props}
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                  />
                )}
              </Field>
            </div>
            <Field label="審査状況">
              {(props) => (
                <Select
                  {...props}
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                >
                  {["すべて", "審査中", "承認済み", "要修正"].map((value) => (
                    <option key={value}>{value}</option>
                  ))}
                </Select>
              )}
            </Field>
          </div>
          <p role="status">{filtered.length}件の企画</p>
          {filtered.length ? (
            <Table className="ds-table">
              <caption>審査対象の企画</caption>
              <thead>
                <tr>
                  <th scope="col">企画番号</th>
                  <th scope="col">企画名</th>
                  <th scope="col">団体名</th>
                  <th scope="col">審査状況</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr key={row.id}>
                    <th scope="row">{row.id}</th>
                    <td>{row.name}</td>
                    <td>{row.group}</td>
                    <td>
                      <Badge
                        tone={
                          row.state === "承認済み"
                            ? "success"
                            : row.state === "要修正"
                              ? "warning"
                              : undefined
                        }
                      >
                        {row.state}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <Card>
              <EmptyState title="条件に合う企画がありません">
                <p>検索語や審査状況を変更してください。</p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setQuery("");
                    setStatus("すべて");
                  }}
                >
                  条件をリセット
                </Button>
              </EmptyState>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

const meta = {
  title: "Patterns/ReviewList",
  component: ReviewList,
  args: { loading: false, forbidden: false, error: false },
  argTypes: {
    loading: { control: "boolean", description: "一覧を読み込んでいる状態。" },
    forbidden: { control: "boolean", description: "閲覧権限がない状態。" },
    error: {
      control: "boolean",
      description: "一覧を取得できず、再読み込みが必要な状態。",
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "検索・絞り込み・状態表示を組み合わせた一覧の例です。ここでは企画名・団体名・番号で検索し、審査状況で絞り込みます。該当する項目がない場合は、条件を解除できます。\n\n検索対象や状態の分類は、利用するサービスに合わせて決めてください。読み込み中・取得失敗・閲覧権限がない場合も、それぞれの状態を表示します。",
      },
    },
  },
} satisfies Meta<typeof ReviewList>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  name: "検索と状態絞り込み",
  render: (args) => <ReviewList {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.selectOptions(canvas.getByLabelText("審査状況"), "要修正");
    await expect(canvas.getByRole("status")).toHaveTextContent("1件");
    await expect(canvas.getByText("秋の演奏会")).toBeInTheDocument();
    await userEvent.type(canvas.getByRole("searchbox"), "該当なし");
    await expect(
      canvas.getByText("条件に合う企画がありません"),
    ).toBeInTheDocument();
    await userEvent.click(
      canvas.getByRole("button", { name: "条件をリセット" }),
    );
    await expect(canvas.getByRole("status")).toHaveTextContent("3件");
  },
};
export const Loading: Story = {
  name: "一覧の読み込み",
  render: () => <ReviewList loading />,
};
export const Forbidden: Story = {
  name: "閲覧権限なし",
  render: () => <ReviewList forbidden />,
};
export const ListFailure: Story = {
  name: "一覧の取得失敗",
  render: () => <ReviewList error />,
};

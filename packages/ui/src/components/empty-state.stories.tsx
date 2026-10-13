import { useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { ContentCard, EmptyState, Field } from "./compositions";
import { Button } from "./button";
import { Input } from "./input";

const meta = {
  title: "Components/EmptyState",
  component: EmptyState,
  args: {
    title: "提出された申請はありません",
    children: "受付期間：10月1日〜10月20日",
  },
  argTypes: {
    title: { control: "text", description: "何がないのかを示す見出し。" },
    children: {
      control: "text",
      description: "必要な説明と、利用者が実行できる次の操作。",
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "データの取得に成功し、表示する項目がない場合に使います。初回利用なら作成、検索結果が0件なら条件の変更など、理由に応じた次の操作を案内してください。\n\n読み込み中はLoadingState、取得に失敗した場合はNoticeなどで状況を伝えます。",
      },
    },
  },
  render: (args) => (
    <div className="max-w-xl">
      <EmptyState {...args} />
    </div>
  ),
} satisfies Meta<typeof EmptyState>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: "データなし" };

function CreateExample() {
  const [view, setView] = useState<"empty" | "form" | "created">("empty");
  const [name, setName] = useState("");
  const createButtonRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  return (
    <div className="max-w-xl">
      {view === "empty" ? (
        <EmptyState title="企画はまだありません">
          <Button
            ref={createButtonRef}
            onClick={() => {
              setView("form");
              requestAnimationFrame(() => inputRef.current?.focus());
            }}
          >
            企画を作成
          </Button>
        </EmptyState>
      ) : view === "form" ? (
        <form
          className="ds-stack"
          onSubmit={(event) => {
            event.preventDefault();
            if (!name.trim()) return;
            setView("created");
            requestAnimationFrame(() => headingRef.current?.focus());
          }}
        >
          <Field label="企画名" required>
            {(props) => (
              <Input
                {...props}
                ref={inputRef}
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            )}
          </Field>
          <div className="ds-row">
            <Button type="submit" disabled={!name.trim()}>
              作成
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setView("empty");
                requestAnimationFrame(() => createButtonRef.current?.focus());
              }}
            >
              キャンセル
            </Button>
          </div>
        </form>
      ) : (
        <ContentCard>
          <h2 ref={headingRef} tabIndex={-1}>
            {name}
          </h2>
          <p role="status">企画を作成しました。</p>
        </ContentCard>
      )}
    </div>
  );
}

export const WithAction: Story = {
  name: "初回の作成",
  render: () => <CreateExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    canvas.getByRole("button", { name: "企画を作成" }).focus();
    await userEvent.keyboard("{Enter}");
    await userEvent.click(canvas.getByRole("button", { name: "キャンセル" }));
    await waitFor(() =>
      expect(canvas.getByRole("button", { name: "企画を作成" })).toHaveFocus(),
    );
    await userEvent.keyboard("{Enter}");
    const input = canvas.getByRole("textbox", { name: /企画名\s*（必須）/ });
    await waitFor(() => expect(input).toHaveFocus());
    await userEvent.type(input, "九大カフェ");
    await userEvent.click(canvas.getByRole("button", { name: "作成" }));
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "企画を作成しました。",
    );
    await waitFor(() =>
      expect(canvas.getByRole("heading", { name: "九大カフェ" })).toHaveFocus(),
    );
    await expect(
      canvas.queryByText("企画はまだありません"),
    ).not.toBeInTheDocument();
  },
};

function FilterExample() {
  const [query, setQuery] = useState("ステージ");
  const inputRef = useRef<HTMLInputElement>(null);
  const projects = ["九大カフェ", "星空写真展"].filter((name) =>
    name.includes(query),
  );
  return (
    <div className="ds-stack max-w-xl">
      <Field label="企画名で検索">
        {(props) => (
          <Input
            {...props}
            type="search"
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        )}
      </Field>
      <p role="status">{projects.length}件の企画</p>
      {projects.length ? (
        <ul className="divide-y">
          {projects.map((name) => (
            <li key={name} className="py-3">
              {name}
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState title="条件に合う企画がありません">
          <Button
            variant="outline"
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
          >
            検索条件をクリア
          </Button>
        </EmptyState>
      )}
    </div>
  );
}

export const Filtered: Story = {
  name: "検索結果なし",
  render: () => <FilterExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("status")).toHaveTextContent("0件");
    await userEvent.click(
      canvas.getByRole("button", { name: "検索条件をクリア" }),
    );
    await expect(
      canvas.getByRole("searchbox", { name: "企画名で検索" }),
    ).toHaveValue("");
    await expect(canvas.getByRole("searchbox")).toHaveFocus();
    await expect(canvas.getByRole("status")).toHaveTextContent("2件");
    await expect(canvas.getByText("九大カフェ")).toBeVisible();
  },
};

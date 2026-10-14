import type { Meta, StoryObj } from "@storybook/react-vite";

import { Check, FilePenLine, ListChecks } from "lucide-react";
import { useId, useRef, useState } from "react";
import { expect, userEvent, within, waitFor } from "storybook/test";

import { Button } from "./button";
import { Notice as Alert, LabeledCheckbox as Checkbox, Field } from "./compositions";
import { Input } from "./input";
import { NativeSelect as Select } from "./native-select";
import { ProcessSteps } from "./process-steps";
import { Textarea } from "./textarea";

function ApplicationForm({
  fail = false,
  readOnly = false,
  initialStep = "input",
  initialInvalid = false,
}: {
  fail?: boolean;
  readOnly?: boolean;
  initialStep?: "input" | "review" | "receipt";
  initialInvalid?: boolean;
}) {
  const [name, setName] = useState(readOnly || initialStep !== "input" ? "九大カフェ" : "");
  const [category, setCategory] = useState("模擬店");
  const [description, setDescription] = useState("");
  const [checked, setChecked] = useState(readOnly || initialStep !== "input");
  const [submitted, setSubmitted] = useState(initialInvalid);
  const [step, setStep] = useState<"input" | "review" | "receipt">(initialStep);
  const [state, setState] = useState<"idle" | "pending" | "success" | "error">("idle");
  const nameRef = useRef<HTMLInputElement>(null);
  const checkRef = useRef<HTMLElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const consentErrorId = useId();
  const nameError = submitted && !name.trim() ? "企画名を入力してください。" : undefined;
  const checkError = submitted && !checked ? "内容を確認してチェックを入れてください。" : undefined;
  const moveFocus = () => requestAnimationFrame(() => headingRef.current?.focus());
  return (
    <main className="ds-shell ds-stack ds-form">
      <header className="ds-stack">
        <p className="ds-hint">第79回九大祭</p>
        <h1>企画情報の提出</h1>
        <p className="ds-hint">提出締切：10月20日 17:00</p>
      </header>
      {!readOnly && (
        <ProcessSteps
          label="提出の手順"
          steps={[
            {
              id: "input",
              title: "入力",
              icon: FilePenLine,
              status: step === "input" ? "current" : "complete",
            },
            {
              id: "review",
              title: "確認",
              icon: ListChecks,
              status: step === "review" ? "current" : step === "receipt" ? "complete" : "upcoming",
            },
            {
              id: "receipt",
              title: "受付",
              icon: Check,
              status: step === "receipt" ? "complete" : "upcoming",
            },
          ]}
        />
      )}
      {readOnly && (
        <Alert title="受付期間が終了しました" tone="warning">
          提出済みの内容を確認できます。変更が必要な場合は担当者に連絡してください。
        </Alert>
      )}
      {step === "receipt" ? (
        <div className="ds-stack">
          <h2 ref={headingRef} tabIndex={-1}>
            受付結果
          </h2>
          <Alert title="企画情報を提出しました" tone="success" role="status">
            受付番号：A-2026-001
          </Alert>
          <p>企画名：{name}</p>
          <p>この受付番号と提出内容を控えとして確認できます。</p>
        </div>
      ) : (
        <form
          noValidate
          className="ds-stack"
          onSubmit={async (event) => {
            event.preventDefault();
            if (state === "pending" || readOnly) return;
            if (step === "input") {
              setSubmitted(true);
              setState("idle");
              if (!name.trim() || !checked) {
                requestAnimationFrame(() => summaryRef.current?.focus());
                return;
              }
              setStep("review");
              moveFocus();
              return;
            }
            setState("pending");
            await new Promise((resolve) => setTimeout(resolve, 350));
            setState(fail ? "error" : "success");
            if (!fail) {
              setStep("receipt");
              moveFocus();
            }
          }}
        >
          {step === "input" ? (
            <>
              <p>必須とある項目は入力が必要です。</p>
              {(nameError || checkError) && (
                <Alert
                  title="入力内容を確認してください"
                  tone="danger"
                  role="alert"
                  ref={summaryRef}
                  tabIndex={-1}
                >
                  <ul>
                    {nameError && (
                      <li>
                        <a
                          href={`#${nameRef.current?.id}`}
                          onClick={(event) => {
                            event.preventDefault();
                            nameRef.current?.focus();
                          }}
                        >
                          {nameError}
                        </a>
                      </li>
                    )}
                    {checkError && (
                      <li>
                        <a
                          href={`#${consentErrorId}`}
                          onClick={(event) => {
                            event.preventDefault();
                            checkRef.current?.focus();
                          }}
                        >
                          {checkError}
                        </a>
                      </li>
                    )}
                  </ul>
                </Alert>
              )}
              <Field
                label="企画名"
                required
                error={nameError}
                hint="来場者向けに公開する名称です。100文字以内で入力してください。"
              >
                {(props) => (
                  <Input
                    {...props}
                    ref={nameRef}
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    readOnly={readOnly}
                    maxLength={100}
                  />
                )}
              </Field>
              <Field label="企画区分" required>
                {(props) => (
                  <Select
                    {...props}
                    disabled={readOnly}
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                  >
                    <option>模擬店</option>
                    <option>展示</option>
                  </Select>
                )}
              </Field>
              <Field label="企画紹介" hint="200文字以内で入力してください。">
                {(props) => (
                  <Textarea
                    {...props}
                    maxLength={200}
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    readOnly={readOnly}
                  />
                )}
              </Field>
              <Checkbox
                ref={checkRef}
                checked={checked}
                onCheckedChange={setChecked}
                disabled={readOnly}
                aria-invalid={!!checkError || undefined}
                aria-describedby={checkError ? consentErrorId : undefined}
              >
                掲載内容を確認しました
              </Checkbox>
              {checkError && (
                <p id={consentErrorId} className="ds-error">
                  {checkError}
                </p>
              )}
              <div>
                <Button type="submit" disabled={readOnly}>
                  提出内容を確認
                </Button>
              </div>
            </>
          ) : (
            <>
              <h2 ref={headingRef} tabIndex={-1}>
                提出内容の確認
              </h2>
              <dl className="ds-stack">
                <div>
                  <dt>企画名</dt>
                  <dd>{name}</dd>
                </div>
                <div>
                  <dt>企画区分</dt>
                  <dd>{category}</dd>
                </div>
                <div>
                  <dt>企画紹介</dt>
                  <dd>{description || "記入なし"}</dd>
                </div>
              </dl>
              <p>この内容を第79回九大祭の企画情報として提出します。</p>
              {state === "error" && (
                <Alert title="提出できませんでした" tone="danger" role="alert">
                  受け付けられていないことを確認しました。入力内容は残っています。もう一度提出してください。
                </Alert>
              )}
              <div className="ds-row">
                <Button
                  variant="outline"
                  disabled={state === "pending"}
                  onClick={() => {
                    setStep("input");
                    setState("idle");
                    requestAnimationFrame(() => nameRef.current?.focus());
                  }}
                >
                  入力へ戻る
                </Button>
                <Button type="submit" pending={state === "pending"}>
                  {state === "pending" ? "提出中…" : "企画情報を提出"}
                </Button>
              </div>
            </>
          )}
        </form>
      )}
    </main>
  );
}

const meta = {
  title: "Patterns/ApplicationForm",
  component: ApplicationForm,
  render: (args) => <ApplicationForm key={JSON.stringify(args)} {...args} />,
  args: {
    fail: false,
    readOnly: false,
    initialStep: "input",
    initialInvalid: false,
  },
  argTypes: {
    fail: {
      control: "boolean",
      description: "提出操作後に再試行できるエラーを表示します。",
    },
    readOnly: {
      control: "boolean",
      description: "受付終了後は提出済みの内容を表示します。",
    },
    initialStep: {
      control: "select",
      options: ["input", "review", "receipt"],
      description: "最初に表示する工程。",
    },
    initialInvalid: {
      control: "boolean",
      description: "必須項目が未入力の状態。",
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "入力・内容確認・提出を組み合わせたフォームの例です。確認画面から戻っても入力を保持し、エラー一覧から該当する項目へ移動できます。\n\nここでは企画申請を例にしています。項目や受付条件、提出後の編集可否は、それぞれの手続きに合わせて決めてください。",
      },
    },
  },
} satisfies Meta<typeof ApplicationForm>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  name: "申請フォーム",
  render: (args) => <ApplicationForm key={JSON.stringify(args)} {...args} />,
};
export const Review: Story = {
  name: "提出内容の確認",
  args: { initialStep: "review" },
};
export const Receipt: Story = {
  name: "受付結果",
  args: { initialStep: "receipt" },
};
export const Invalid: Story = {
  name: "入力エラー",
  args: { initialInvalid: true },
};
export const Flow: Story = {
  name: "入力から受付まで",
  tags: ["!dev", "!autodocs"],
  render: () => <ApplicationForm />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "提出内容を確認" }));
    const input = canvas.getByLabelText("企画名（必須）");
    await waitFor(() => expect(canvas.getByRole("alert")).toHaveFocus());
    await userEvent.click(canvas.getByRole("link", { name: "企画名を入力してください。" }));
    await expect(input).toHaveFocus();
    await expect(input).toHaveAttribute("aria-invalid", "true");
    await userEvent.type(input, "九大カフェ");
    await userEvent.click(canvas.getByRole("checkbox", { name: "掲載内容を確認しました" }));
    await userEvent.click(canvas.getByRole("button", { name: "提出内容を確認" }));
    await expect(canvas.getByRole("heading", { name: "提出内容の確認" })).toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: "入力へ戻る" }));
    await expect(canvas.getByLabelText("企画名（必須）")).toHaveValue("九大カフェ");
    await userEvent.click(canvas.getByRole("button", { name: "提出内容を確認" }));
    await userEvent.click(canvas.getByRole("button", { name: "企画情報を提出" }));
    await expect(canvas.getByRole("button", { name: "提出中…" })).toBeDisabled();
    await waitFor(() =>
      expect(canvas.getByRole("status")).toHaveTextContent("企画情報を提出しました"),
    );
    await expect(canvas.getByText("受付番号：A-2026-001")).toBeInTheDocument();
  },
};
export const SubmissionFailure: Story = {
  name: "未受理を確認した提出失敗",
  render: () => <ApplicationForm fail />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText("企画名（必須）"), "九大カフェ");
    await userEvent.click(canvas.getByRole("checkbox", { name: "掲載内容を確認しました" }));
    await userEvent.click(canvas.getByRole("button", { name: "提出内容を確認" }));
    await userEvent.click(canvas.getByRole("button", { name: "企画情報を提出" }));
    await expect(await canvas.findByRole("alert")).toHaveTextContent("提出できませんでした");
    await userEvent.click(canvas.getByRole("button", { name: "入力へ戻る" }));
    await expect(canvas.getByLabelText("企画名（必須）")).toHaveValue("九大カフェ");
  },
};
export const ResultUnknown: Story = {
  name: "受付結果を確認できない",
  render: () => (
    <div className="ds-stack ds-form">
      <h1>企画情報の提出</h1>
      <Alert title="受け付けたか確認しています" tone="warning" role="status">
        通信が途切れたため、結果を確認できていません。同じ内容を再提出せず、この画面でお待ちください。
      </Alert>
      <p>企画名：九大カフェ</p>
      <p>
        受付状況を照会中です。確認に時間がかかる場合は、企画番号 K-080
        を添えて担当者へ連絡してください。
      </p>
      <Button disabled>受付結果を確認中…</Button>
    </div>
  ),
};
export const Conflict: Story = {
  name: "ほかの担当者による更新",
  render: () => (
    <div className="ds-stack ds-form">
      <h1>企画情報の編集</h1>
      <Alert title="保存前に最新の内容を確認してください" tone="warning">
        ほかの担当者がこの企画を更新しました。入力内容はこの画面に残っています。最新の内容と比較してから変更を反映してください。
      </Alert>
      <Field label="手元の企画名">
        {(props) => <Input {...props} defaultValue="九大カフェ" readOnly />}
      </Field>
      <p>最新の企画名：九大カフェ 秋の特別店</p>
    </div>
  ),
};
export const Deadline: Story = {
  name: "期限後の閲覧",
  render: () => <ApplicationForm readOnly />,
};

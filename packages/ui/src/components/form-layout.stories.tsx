import type { Meta, StoryObj } from "@storybook/react-vite";

import { useEffect, useId, useRef, useState } from "react";
import { expect, userEvent, within } from "storybook/test";

import { Button } from "./button";
import { InputTable, Repeater } from "./collection-fields";
import { Field, LabeledCheckbox, Notice } from "./compositions";
import { FileInput } from "./file-input";
import { DateInput, EmailInput, NumberInput, OtpInput, TimeInput, UrlInput } from "./form-controls";
import { Input } from "./input";
import { NativeSelect, NativeSelectOption } from "./native-select";
import { CheckboxGroup, SocialProfileInput } from "./selection-fields";
import { Textarea } from "./textarea";

function FormLayout({ initialErrors = false, disabled = false, readOnly = false }) {
  const formId = useId();
  const [values, setValues] = useState<Record<string, string>>({
    name: "",
    email: "",
    description: "",
    url: "",
    count: "",
    date: "",
    time: "",
    code: "",
    format: "text",
  });
  const [errors, setErrors] = useState<Record<string, string>>(
    initialErrors
      ? { name: "名前を入力してください。", email: "メールアドレスを入力してください。" }
      : {},
  );
  const [confirmed, setConfirmed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [showUrl, setShowUrl] = useState(false);
  const [choices, setChoices] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [profiles, setProfiles] = useState<string[]>([]);
  const [noAccount, setNoAccount] = useState(false);
  const [rows, setRows] = useState([{ id: "row-1", label: "", count: "" }]);
  const nextRow = useRef(2);
  const formRef = useRef<HTMLFormElement>(null);
  const dateRef = useRef<HTMLInputElement>(null);
  const timeRef = useRef<HTMLInputElement>(null);
  const fieldNames: Record<string, string> = {
    name: "名前",
    email: "メールアドレス",
    url: "Webサイト",
    count: "数量",
    date: "日付",
    time: "時刻",
    code: "確認コード",
    "day-1": "月曜日の数量",
    "day-2": "火曜日の数量",
  };
  const findControl = (key: string) =>
    key === "date"
      ? dateRef.current
      : key === "time"
        ? timeRef.current
        : (formRef.current?.elements.namedItem(key) as HTMLInputElement | null);
  const controlState = { disabled, readOnly };
  const update = (key: string, value: string) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "" }));
    setConfirmed(false);
  };
  useEffect(() => {
    if (attempt > 0) formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [attempt]);
  return (
    <form
      id={formId}
      ref={formRef}
      noValidate
      className="ds-form mx-auto space-y-8"
      onChange={() => setConfirmed(false)}
      onSubmit={(event) => {
        event.preventDefault();
        if (disabled || readOnly) return;
        const next: Record<string, string> = {};
        if (!values.name?.trim()) next.name = "名前を入力してください。";
        const email = event.currentTarget.elements.namedItem("email") as HTMLInputElement;
        if (!values.email || !email.validity.valid)
          next.email = "有効なメールアドレスを入力してください。";
        if (values.code && values.code.length !== 6)
          next.code = "確認コードは6桁で入力してください。";
        for (const key of ["url", "count", "date", "time", "day-1", "day-2"]) {
          const input =
            key === "date"
              ? dateRef.current
              : key === "time"
                ? timeRef.current
                : (event.currentTarget.elements.namedItem(key) as HTMLInputElement | null);
          if (input && !input.validity.valid)
            next[key] = key.startsWith("day-")
              ? "数量は0以上の整数で入力してください。"
              : "入力条件を確認してください。";
        }
        setErrors(next);
        setAttempt((current) => current + 1);
        setConfirmed(Object.keys(next).length === 0);
      }}
    >
      <header className="space-y-2">
        <h1>入力項目を組み合わせる</h1>
        <p className="ds-hint">
          項目を目的ごとに分けたフォームの見本です。入力内容はこの画面内だけで扱います。
        </p>
      </header>
      {Object.values(errors).some(Boolean) ? (
        <Notice title="入力内容を確認してください" tone="danger" role="alert">
          <ul className="space-y-1">
            {Object.entries(errors)
              .filter(([, message]) => message)
              .map(([key, message]) => (
                <li key={key}>
                  <a
                    href={`#${findControl(key)?.id || formId}`}
                    onClick={(event) => {
                      event.preventDefault();
                      findControl(key)?.focus();
                    }}
                  >
                    {fieldNames[key]}：{message}
                  </a>
                </li>
              ))}
          </ul>
        </Notice>
      ) : null}
      <section aria-labelledby={`${formId}-basic`} className="space-y-6">
        <h2 id={`${formId}-basic`}>基本情報</h2>
        <Field label="名前" required hint="100文字以内で入力してください。" error={errors.name}>
          {(props) => (
            <Input
              {...props}
              {...controlState}
              name="name"
              autoComplete="name"
              value={values.name}
              maxLength={100}
              onChange={(event) => update("name", event.target.value)}
            />
          )}
        </Field>
        <Field label="メールアドレス" required error={errors.email}>
          {(props) => (
            <EmailInput
              {...props}
              {...controlState}
              name="email"
              value={values.email}
              onChange={(event) => update("email", event.target.value)}
            />
          )}
        </Field>
        <Field label="説明" hint="目的や補足を300文字以内で入力できます。">
          {(props) => (
            <Textarea
              {...props}
              {...controlState}
              name="description"
              value={values.description}
              maxLength={300}
              rows={4}
              onChange={(event) => update("description", event.target.value)}
            />
          )}
        </Field>
        <LabeledCheckbox
          checked={showUrl}
          {...controlState}
          onCheckedChange={(checked) => {
            setShowUrl(checked);
            if (!checked) setErrors((current) => ({ ...current, url: "" }));
          }}
        >
          Webサイトを追加
        </LabeledCheckbox>
        {showUrl ? (
          <Field
            label="Webサイト"
            hint="https://またはhttp://で始まるURLを入力してください。"
            error={errors.url}
          >
            {(props) => (
              <UrlInput
                {...props}
                {...controlState}
                name="url"
                pattern="https?://.+"
                value={values.url}
                onChange={(event) => update("url", event.target.value)}
              />
            )}
          </Field>
        ) : null}
      </section>
      <section aria-labelledby={`${formId}-details`} className="space-y-6">
        <h2 id={`${formId}-details`}>日時と選択</h2>
        <p className="ds-hint">関連する短い項目は横に並べ、狭い画面では縦に並べます。</p>
        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="日付" error={errors.date}>
            {(props) => (
              <DateInput
                {...props}
                {...controlState}
                name="date"
                ref={dateRef}
                value={values.date}
                onValueChange={(value) => update("date", value)}
              />
            )}
          </Field>
          <Field label="時刻" error={errors.time}>
            {(props) => (
              <TimeInput
                {...props}
                {...controlState}
                name="time"
                ref={timeRef}
                value={values.time}
                onValueChange={(value) => update("time", value)}
              />
            )}
          </Field>
        </div>
        <Field label="数量" hint="0以上100以下の整数を入力してください。" error={errors.count}>
          {(props) => (
            <NumberInput
              {...props}
              {...controlState}
              name="count"
              value={values.count}
              integer
              min={0}
              max={100}
              onChange={(event) => update("count", event.target.value)}
            />
          )}
        </Field>
        <Field label="表示形式">
          {(props) => (
            <NativeSelect
              {...props}
              disabled={disabled || readOnly}
              value={values.format}
              onChange={(event) => update("format", event.target.value)}
            >
              <NativeSelectOption value="text">文字</NativeSelectOption>
              <NativeSelectOption value="image">画像</NativeSelectOption>
              <NativeSelectOption value="both">文字と画像</NativeSelectOption>
            </NativeSelect>
          )}
        </Field>
        <CheckboxGroup
          label="使用するもの"
          hint="2つまで選択できます。"
          options={[
            { value: "desk", label: "机" },
            { value: "chair", label: "椅子" },
            { value: "board", label: "掲示板" },
          ]}
          maxSelections={2}
          {...controlState}
          value={choices}
          onValueChange={(value) => {
            setChoices(value);
            setConfirmed(false);
          }}
        />
      </section>
      <section aria-labelledby={`${formId}-files`} className="space-y-6">
        <h2 id={`${formId}-files`}>添付とプロフィール</h2>
        <FileInput
          label="添付ファイル"
          hint="PDF・テキストを2ファイルまで、各1MB以内で選択できます。"
          accept=".pdf,.txt"
          maxFiles={2}
          maxBytes={1024 * 1024}
          {...controlState}
          value={files}
          onValueChange={(value) => {
            setFiles(value);
            setConfirmed(false);
          }}
        />
        <SocialProfileInput
          label="プロフィール"
          hint="登録済みの候補から選択してください。"
          options={[
            { value: "photos", label: "写真のプロフィール", description: "@example" },
            { value: "website", label: "Webサイト", description: "example.com" },
          ]}
          value={profiles}
          onValueChange={(value) => {
            setProfiles(value);
            setConfirmed(false);
          }}
          noAccount={noAccount}
          onNoAccountChange={(value) => {
            setNoAccount(value);
            setConfirmed(false);
          }}
          {...controlState}
        />
      </section>
      <section aria-labelledby={`${formId}-rows`} className="space-y-6">
        <h2 id={`${formId}-rows`}>繰り返す項目</h2>
        <Repeater
          label="項目の一覧"
          hint="3件まで追加できます。"
          items={rows.map((row) => ({ id: row.id }))}
          minItems={1}
          maxItems={3}
          {...controlState}
          onAdd={() => {
            setRows((current) => [
              ...current,
              { id: `row-${nextRow.current++}`, label: "", count: "" },
            ]);
            setConfirmed(false);
          }}
          onRemove={(id) => {
            setRows((current) => current.filter((row) => row.id !== id));
            setConfirmed(false);
          }}
          renderItem={(item, index, state) => {
            const row = rows.find((entry) => entry.id === item.id)!;
            return (
              <Field label="名称">
                {(props) => (
                  <Input
                    {...props}
                    {...state}
                    aria-label={`${index + 1}件目の名称`}
                    value={row.label}
                    onChange={(event) =>
                      setRows((current) =>
                        current.map((entry) =>
                          entry.id === item.id ? { ...entry, label: event.target.value } : entry,
                        ),
                      )
                    }
                  />
                )}
              </Field>
            );
          }}
        />
        <InputTable
          label="曜日ごとの数量"
          rows={[
            { id: "day-1", label: "月曜日" },
            { id: "day-2", label: "火曜日" },
          ]}
          columns={[{ key: "quantity", label: "数量" }]}
          {...controlState}
          renderCell={(rowId, _column, state) => (
            <div className="space-y-2">
              <NumberInput
                {...state}
                name={rowId}
                aria-label={`${rowId === "day-1" ? "月曜日" : "火曜日"} 数量`}
                aria-invalid={errors[rowId] ? true : undefined}
                aria-describedby={errors[rowId] ? `${formId}-${rowId}-error` : undefined}
                integer
                min={0}
                value={values[rowId] ?? ""}
                onChange={(event) => update(rowId, event.target.value)}
              />
              {errors[rowId] ? (
                <p className="ds-error" id={`${formId}-${rowId}-error`}>
                  {errors[rowId]}
                </p>
              ) : null}
            </div>
          )}
        />
      </section>
      <section aria-labelledby={`${formId}-code`} className="space-y-6">
        <h2 id={`${formId}-code`}>確認コード</h2>
        <Field
          label="確認コード"
          hint="利用する場合は6桁の数字を入力してください。貼り付けも使えます。"
          error={errors.code}
        >
          {(props) => (
            <OtpInput
              {...props}
              {...controlState}
              name="code"
              value={values.code ?? ""}
              onValueChange={(value) => update("code", value)}
            />
          )}
        </Field>
      </section>
      {!readOnly ? (
        <Button type="submit" disabled={disabled}>
          入力内容を確認
        </Button>
      ) : null}
      <div role="status">
        {confirmed ? (
          <Notice title="入力内容を確認しました" tone="success">
            この見本では保存・送信を行いません。入力した値は画面に残っています。
          </Notice>
        ) : null}
      </div>
    </form>
  );
}

const meta = {
  title: "Patterns/FormLayout",
  component: FormLayout,
  args: { initialErrors: false, disabled: false, readOnly: false },
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "入力部品を節ごとに配置した汎用フォームです。各部品の役割と間隔、任意項目の表示、繰り返し、入力表を確認できます。認証やサービス固有の手続きを含みません。",
      },
    },
  },
} satisfies Meta<typeof FormLayout>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "入力内容を確認" }));
    const name = canvas.getByRole("textbox", { name: /名前\s*（必須）/ });
    await expect(name).toHaveFocus();
    await expect(name).toHaveAccessibleDescription(
      "100文字以内で入力してください。 名前を入力してください。",
    );
    await userEvent.click(
      canvas.getByRole("link", {
        name: "メールアドレス：有効なメールアドレスを入力してください。",
      }),
    );
    await expect(canvas.getByRole("textbox", { name: /メールアドレス\s*（必須）/ })).toHaveFocus();
    await userEvent.type(name, "見本の名前");
    await userEvent.type(
      canvas.getByRole("textbox", { name: /メールアドレス\s*（必須）/ }),
      "sample@example.com",
    );
    await userEvent.click(canvas.getByRole("checkbox", { name: "Webサイトを追加" }));
    await userEvent.type(canvas.getByRole("textbox", { name: "Webサイト" }), "https://example.com");
    await userEvent.click(canvas.getByRole("checkbox", { name: "Webサイトを追加" }));
    await userEvent.click(canvas.getByRole("checkbox", { name: "Webサイトを追加" }));
    await expect(canvas.getByRole("textbox", { name: "Webサイト" })).toHaveValue(
      "https://example.com",
    );
    await userEvent.click(canvas.getByRole("button", { name: "入力内容を確認" }));
    await expect(canvas.getByRole("status")).toHaveTextContent("入力内容を確認しました");
    await expect(name).toHaveValue("見本の名前");
    const quantity = canvas.getByRole("spinbutton", { name: "月曜日 数量" });
    await userEvent.type(quantity, "-1");
    await userEvent.click(canvas.getByRole("button", { name: "入力内容を確認" }));
    await expect(quantity).toHaveFocus();
    await expect(quantity).toHaveAttribute("aria-invalid", "true");
    await expect(quantity).toHaveAccessibleDescription("数量は0以上の整数で入力してください。");
    await expect(canvas.getByRole("status")).not.toHaveTextContent("入力内容を確認しました");
    await userEvent.clear(quantity);
    await userEvent.type(quantity, "1.5");
    await userEvent.click(canvas.getByRole("button", { name: "入力内容を確認" }));
    await expect(quantity).toHaveAttribute("aria-invalid", "true");
    await userEvent.clear(quantity);
    await userEvent.type(quantity, "2");
    await userEvent.click(canvas.getByRole("button", { name: "入力内容を確認" }));
    await expect(canvas.getByRole("status")).toHaveTextContent("入力内容を確認しました");
  },
};
export const WithErrors: Story = { args: { initialErrors: true } };
export const Disabled: Story = { args: { disabled: true } };
export const ReadOnly: Story = { args: { readOnly: true } };

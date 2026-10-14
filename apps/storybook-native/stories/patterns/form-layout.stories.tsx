import type { Meta, StoryObj } from "@storybook/react-native";

import {
  Button,
  Checkbox,
  CheckboxGroup,
  DateInput,
  EmailInput,
  Field,
  FileInput,
  InputTable,
  Notice,
  NumberInput,
  OtpInput,
  Repeater,
  SelectInput,
  Separator,
  SocialProfileInput,
  Text,
  TimeInput,
  UrlInput,
} from "@kyudaisai/ui-native";
import { useEffect, useRef, useState } from "react";
import { TextInput, View } from "react-native";

import { useLocalFiles } from "../components/form-control-examples";

function FormLayout({ initialErrors = false, disabled = false, readOnly = false }) {
  const [values, setValues] = useState<Record<string, string>>({
    name: "",
    email: "",
    description: "",
    url: "",
    quantity: "",
    date: "",
    time: "",
    code: "",
    format: "text",
    monday: "",
    tuesday: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>(
    initialErrors
      ? {
          name: "名前を入力してください。",
          email: "メールアドレスを入力してください。",
        }
      : {},
  );
  const [confirmed, setConfirmed] = useState(false);
  const [showUrl, setShowUrl] = useState(false);
  const [choices, setChoices] = useState<string[]>([]);
  const [profiles, setProfiles] = useState<string[]>([]);
  const [noAccount, setNoAccount] = useState(false);
  const [items, setItems] = useState([{ id: "item-1", name: "" }]);
  const nextItem = useRef(2);
  const inputRefs = useRef<Record<string, TextInput | null>>({});
  const pendingFocus = useRef<string | undefined>(undefined);
  const files = useLocalFiles();
  const state = { disabled, readOnly };

  useEffect(() => {
    const key = pendingFocus.current;
    pendingFocus.current = undefined;
    if (key) inputRefs.current[key]?.focus();
  }, [errors]);

  function update(key: string, value: string) {
    setValues((previous) => ({ ...previous, [key]: value }));
    setErrors((previous) => ({ ...previous, [key]: "" }));
    setConfirmed(false);
  }

  function check() {
    if (disabled || readOnly) return;
    const next: Record<string, string> = {};
    if (!values.name?.trim()) next.name = "名前を入力してください。";
    if (
      !/^[^\s@]+@[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)*$/i.test(
        values.email ?? "",
      )
    )
      next.email = "有効なメールアドレスを入力してください。";
    if (showUrl && values.url) {
      try {
        const url = new URL(values.url);
        if (!["http:", "https:"].includes(url.protocol) || !url.hostname || /\s/.test(values.url))
          next.url = "有効なhttp://またはhttps://で始まるURLを入力してください。";
      } catch {
        next.url = "有効なhttp://またはhttps://で始まるURLを入力してください。";
      }
    }
    for (const key of ["quantity", "monday", "tuesday"]) {
      const raw = values[key];
      if (
        raw &&
        (!/^-?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?$/.test(raw) ||
          !Number.isInteger(Number(raw)) ||
          Number(raw) < 0)
      )
        next[key] = "0以上の整数で入力してください。";
    }
    if (values.quantity && Number(values.quantity) > 100)
      next.quantity = "100以下で入力してください。";
    if (values.code && values.code.length !== 6) next.code = "6桁の確認コードを入力してください。";
    if (files.error) next.files = files.error;
    pendingFocus.current = ["name", "email", "url", "quantity", "monday", "tuesday", "code"].find(
      (key) => next[key],
    );
    setErrors(next);
    setConfirmed(Object.keys(next).length === 0);
  }

  return (
    <View style={{ gap: 32 }}>
      <View style={{ gap: 8 }}>
        <Text variant="title">入力項目を組み合わせる</Text>
        <Text tone="muted">
          項目を目的ごとに分けたフォームの見本です。入力内容はこの画面内だけで扱います。
        </Text>
      </View>
      {Object.values(errors).some(Boolean) ? (
        <Notice title="入力内容を確認してください" tone="danger">
          <Text>各項目の下に修正方法を表示しています。</Text>
        </Notice>
      ) : null}
      <View style={{ gap: 24 }}>
        <Text variant="heading">基本情報</Text>
        <Field
          ref={(input) => {
            inputRefs.current.name = input;
          }}
          label="名前"
          required
          hint="100文字以内で入力してください。"
          value={values.name}
          error={errors.name}
          maxLength={100}
          autoComplete="name"
          editable={!disabled}
          readOnly={readOnly}
          onChangeText={(value) => update("name", value)}
        />
        <EmailInput
          ref={(input) => {
            inputRefs.current.email = input;
          }}
          label="メールアドレス"
          required
          value={values.email ?? ""}
          error={errors.email}
          onValueChange={(value) => update("email", value)}
          {...state}
        />
        <Field
          label="説明"
          hint="目的や補足を300文字以内で入力できます。"
          multiline
          maxLength={300}
          value={values.description}
          editable={!disabled}
          readOnly={readOnly}
          onChangeText={(value) => update("description", value)}
        />
        <Checkbox
          label="Webサイトを追加"
          checked={showUrl}
          disabled={disabled || readOnly}
          onCheckedChange={(value) => {
            setShowUrl(value);
            setErrors((previous) => ({ ...previous, url: "" }));
            setConfirmed(false);
          }}
        />
        {showUrl ? (
          <UrlInput
            ref={(input) => {
              inputRefs.current.url = input;
            }}
            label="Webサイト"
            hint="http://またはhttps://で始まるURLを入力してください。"
            value={values.url ?? ""}
            error={errors.url}
            onValueChange={(value) => update("url", value)}
            {...state}
          />
        ) : null}
      </View>
      <Separator />
      <View style={{ gap: 24 }}>
        <Text variant="heading">日時と選択</Text>
        <DateInput
          label="日付"
          value={values.date ?? ""}
          onValueChange={(value) => update("date", value)}
          {...state}
        />
        <TimeInput
          label="時刻"
          value={values.time ?? ""}
          onValueChange={(value) => update("time", value)}
          {...state}
        />
        <NumberInput
          ref={(input) => {
            inputRefs.current.quantity = input;
          }}
          label="数量"
          min={0}
          max={100}
          integer
          value={values.quantity ?? ""}
          error={errors.quantity}
          onValueChange={(value) => update("quantity", value)}
          {...state}
        />
        <SelectInput
          label="表示形式"
          options={[
            { value: "text", label: "文字" },
            { value: "image", label: "画像" },
            { value: "both", label: "文字と画像" },
          ]}
          value={values.format ?? ""}
          onValueChange={(value) => update("format", value)}
          {...state}
        />
        <CheckboxGroup
          label="使用するもの"
          options={[
            { value: "desk", label: "机" },
            { value: "chair", label: "椅子" },
            { value: "board", label: "掲示板" },
          ]}
          maxSelections={2}
          value={choices}
          onValueChange={(value) => {
            setChoices(value);
            setConfirmed(false);
          }}
          {...state}
        />
      </View>
      <Separator />
      <View style={{ gap: 24 }}>
        <Text variant="heading">添付とプロフィール</Text>
        <FileInput
          label="添付ファイル"
          value={files.files}
          maxFiles={3}
          maxBytes={5 * 1024 * 1024}
          acceptLabel="PDF・テキスト・画像"
          choosing={files.choosing}
          error={files.error}
          onChoose={() => {
            setConfirmed(false);
            setErrors((previous) => ({ ...previous, files: "" }));
            void files.choose();
          }}
          onRemove={(id) => {
            files.remove(id);
            setConfirmed(false);
            setErrors((previous) => ({ ...previous, files: "" }));
          }}
          {...state}
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
          allowNoAccount
          {...state}
        />
      </View>
      <Separator />
      <View style={{ gap: 24 }}>
        <Text variant="heading">繰り返す項目</Text>
        <Repeater
          label="項目の一覧"
          items={items}
          minItems={1}
          maxItems={3}
          onAdd={() => {
            const id = `item-${nextItem.current++}`;
            setItems((previous) => [...previous, { id, name: "" }]);
            setConfirmed(false);
          }}
          onRemove={(id) => {
            setItems((previous) => previous.filter((item) => item.id !== id));
            setConfirmed(false);
          }}
          renderItem={(item, index, control) => (
            <Field
              label="名称"
              accessibilityLabel={`${index + 1}件目の名称`}
              value={item.name}
              editable={!control.disabled}
              readOnly={control.readOnly}
              onChangeText={(value) => {
                setItems((previous) =>
                  previous.map((entry) =>
                    entry.id === item.id ? { ...entry, name: value } : entry,
                  ),
                );
                setConfirmed(false);
              }}
            />
          )}
          {...state}
        />
        <InputTable
          label="曜日ごとの数量"
          rows={[
            { id: "monday", label: "月曜日" },
            { id: "tuesday", label: "火曜日" },
          ]}
          columns={[{ key: "quantity", label: "数量" }]}
          renderCell={(rowId, _column, control) => (
            <NumberInput
              ref={(input) => {
                inputRefs.current[rowId] = input;
              }}
              label="数量"
              accessibilityLabel={`${rowId === "monday" ? "月曜日" : "火曜日"}の数量`}
              value={values[rowId] ?? ""}
              min={0}
              integer
              error={errors[rowId]}
              onValueChange={(value) => update(rowId, value)}
              {...control}
            />
          )}
          {...state}
        />
      </View>
      <Separator />
      <View style={{ gap: 24 }}>
        <Text variant="heading">確認コード</Text>
        <OtpInput
          ref={(input) => {
            inputRefs.current.code = input;
          }}
          label="確認コード"
          hint="利用する場合だけ入力します。貼り付けも使えます。"
          value={values.code ?? ""}
          error={errors.code}
          onValueChange={(value) => update("code", value)}
          {...state}
        />
      </View>
      {!readOnly ? (
        <Button title="入力内容を確認" disabled={disabled || files.choosing} onPress={check} />
      ) : null}
      {confirmed ? (
        <Notice title="入力内容を確認しました" tone="success">
          <Text>この見本では保存・送信を行いません。入力した値は画面に残っています。</Text>
        </Notice>
      ) : null}
    </View>
  );
}

const meta = {
  title: "Patterns/FormLayout",
  component: FormLayout,
  args: { initialErrors: false, disabled: false, readOnly: false },
  parameters: {
    notes:
      "共通入力部品を項目のまとまりごとに配置する例です。必須・形式・数値の条件は確認操作時に表示し、入力値を保持します。ファイルはOSの選択画面を利用します。認証、保存、送信処理は含みません。",
  },
} satisfies Meta<typeof FormLayout>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const WithErrors: Story = { args: { initialErrors: true } };
export const Disabled: Story = { args: { disabled: true } };
export const ReadOnly: Story = { args: { readOnly: true } };
export const Dark: Story = { parameters: { nativeTheme: "dark" } };

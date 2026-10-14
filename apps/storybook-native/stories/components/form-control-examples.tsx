import {
  Field,
  InputTable,
  NumberInput,
  Repeater,
  SocialProfileInput,
  type NativeFileAsset,
} from "@kyudaisai/ui-native";
import * as DocumentPicker from "expo-document-picker";
import { File } from "expo-file-system";
import { useEffect, useRef, useState } from "react";
import { AppState, View } from "react-native";

export function useStoryValue<Value>(initial: Value, onChange?: (value: Value) => void) {
  const [value, setValue] = useState(initial);
  useEffect(() => setValue(initial), [initial]);
  return [
    value,
    (next: Value) => {
      setValue(next);
      onChange?.(next);
    },
  ] as const;
}

const emptyFiles: readonly NativeFileAsset[] = [];

export function useLocalFiles(
  initial: readonly NativeFileAsset[] = emptyFiles,
  limits: { maxFiles?: number; maxBytes?: number } = { maxFiles: 3, maxBytes: 5 * 1024 * 1024 },
) {
  const [files, setFiles] = useState<readonly NativeFileAsset[]>(initial);
  const [choosing, setChoosing] = useState(false);
  const [error, setError] = useState<string>();
  const mounted = useRef(true);
  const locked = useRef(false);
  const temporary = useRef(new Set<string>());
  const count = useRef(1);
  const generation = useRef({ value: 0 });
  const latest = useRef(files);
  const currentLimits = useRef(limits);
  latest.current = files;
  currentLimits.current = limits;
  function clean() {
    for (const uri of temporary.current) {
      try {
        new File(uri).delete();
      } catch {
        /* The OS may already have cleared this cache file. */
      }
    }
    temporary.current.clear();
  }
  useEffect(() => {
    const currentGeneration = generation.current;
    mounted.current = true;
    return () => {
      mounted.current = false;
      ++currentGeneration.value;
      if (!locked.current) clean();
    };
  }, []);
  useEffect(() => {
    setFiles(initial);
    setError(undefined);
    ++generation.current.value;
  }, [initial]);
  async function choose() {
    if (locked.current || !mounted.current || AppState.currentState !== "active") return;
    locked.current = true;
    const attempt = ++generation.current.value;
    setChoosing(true);
    setError(undefined);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "text/plain", "image/*"],
        copyToCacheDirectory: true,
        multiple: true,
      });
      if (result.canceled) return;
      for (const asset of result.assets) temporary.current.add(asset.uri);
      if (!mounted.current || attempt !== generation.current.value) return;
      const { maxFiles, maxBytes } = currentLimits.current;
      if (maxFiles !== undefined && latest.current.length + result.assets.length > maxFiles) {
        setError(`ファイルは${maxFiles}つまで選べます。選択数を減らしてください。`);
        return;
      }
      if (
        maxBytes !== undefined &&
        result.assets.some((asset) => asset.size !== undefined && asset.size > maxBytes)
      ) {
        setError(
          `1ファイル${Number((maxBytes / (1024 * 1024)).toFixed(1))} MBまで選べます。容量の小さいファイルを選んでください。`,
        );
        return;
      }
      if (
        result.assets.some(
          (asset) =>
            asset.mimeType &&
            !["application/pdf", "text/plain"].includes(asset.mimeType) &&
            !asset.mimeType.startsWith("image/"),
        )
      ) {
        setError("PDF・テキスト・画像ファイルから選んでください。");
        return;
      }
      const usedIds = new Set(latest.current.map((file) => file.id));
      const additions = result.assets.map((asset) => {
        let id: string;
        do {
          id = `file-${count.current++}`;
        } while (usedIds.has(id));
        usedIds.add(id);
        return {
          id,
          name: asset.name,
          uri: asset.uri,
          size: asset.size,
          mimeType: asset.mimeType,
        };
      });
      setFiles((previous) => [...previous, ...additions]);
    } catch {
      if (mounted.current && attempt === generation.current.value)
        setError("ファイルを選べませんでした。もう一度試してください。");
    } finally {
      locked.current = false;
      if (mounted.current) setChoosing(false);
      else clean();
    }
  }
  return {
    files,
    choosing,
    error,
    choose,
    remove: (id: string) => {
      setFiles((previous) => previous.filter((file) => file.id !== id));
      setError(undefined);
    },
  };
}

export interface InputExampleState {
  disabled?: boolean;
  readOnly?: boolean;
  error?: string;
}

export function RepeaterExample(props: InputExampleState) {
  const [items, setItems] = useState([{ id: "item-1", name: "項目A", quantity: "1" }]);
  const next = useRef(2);
  function update(id: string, patch: Partial<(typeof items)[number]>) {
    setItems((previous) => previous.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }
  return (
    <Repeater
      {...props}
      label="繰り返し入力"
      hint="同じ項目を複数件入力できます。"
      items={items}
      minItems={1}
      maxItems={4}
      onAdd={() => {
        const id = next.current++;
        setItems((previous) => [...previous, { id: `item-${id}`, name: "", quantity: "1" }]);
      }}
      onRemove={(id) => setItems((previous) => previous.filter((item) => item.id !== id))}
      renderItem={(item, index, state) => (
        <View style={{ gap: 12 }}>
          <Field
            label="名称"
            accessibilityLabel={`${index + 1}件目の名称`}
            value={item.name}
            onChangeText={(name) => update(item.id, { name })}
            editable={!state.disabled}
            readOnly={state.readOnly}
          />
          <NumberInput
            label="数量"
            accessibilityLabel={`${index + 1}件目の数量`}
            value={item.quantity}
            onValueChange={(quantity) => update(item.id, { quantity })}
            min={1}
            integer
            {...state}
          />
        </View>
      )}
    />
  );
}

export function InputTableExample(props: InputExampleState) {
  const [rows, setRows] = useState([
    { id: "row-a", label: "項目A", quantity: "1", note: "" },
    { id: "row-b", label: "項目B", quantity: "2", note: "" },
  ]);
  const next = useRef(3);
  function update(id: string, key: string, value: string) {
    setRows((previous) => previous.map((row) => (row.id === id ? { ...row, [key]: value } : row)));
  }
  return (
    <InputTable
      {...props}
      label="表形式の入力"
      rows={rows}
      columns={[
        { key: "quantity", label: "数量" },
        { key: "note", label: "補足" },
      ]}
      minRows={1}
      maxRows={4}
      onAdd={() => {
        const id = next.current++;
        setRows((previous) => [
          ...previous,
          { id: `row-${id}`, label: `項目${id}`, quantity: "", note: "" },
        ]);
      }}
      onRemove={(id) => setRows((previous) => previous.filter((row) => row.id !== id))}
      renderCell={(rowId, key, state) => {
        const row = rows.find((item) => item.id === rowId)!;
        return key === "quantity" ? (
          <NumberInput
            label="数量"
            accessibilityLabel={`${row.label}の数量`}
            value={row.quantity}
            onValueChange={(value) => update(rowId, key, value)}
            min={0}
            integer
            {...state}
          />
        ) : (
          <Field
            label="補足"
            accessibilityLabel={`${row.label}の補足`}
            value={row.note}
            onChangeText={(value) => update(rowId, key, value)}
            editable={!state.disabled}
            readOnly={state.readOnly}
          />
        );
      }}
    />
  );
}

export function SocialProfileExample({
  noAccount: initial = false,
  ...props
}: InputExampleState & { noAccount?: boolean }) {
  const [value, setValue] = useState<string[]>(initial ? [] : ["profile-1"]);
  const [noAccount, setNoAccount] = useState(initial);
  useEffect(() => {
    setNoAccount(initial);
    setValue(initial ? [] : ["profile-1"]);
  }, [initial]);
  return (
    <SocialProfileInput
      {...props}
      label="SNS・Webサイト"
      hint="登録済みのプロフィールから選びます。"
      options={[
        {
          value: "profile-1",
          label: "Instagram",
          description: "@sample_account",
          provider: "instagram",
        },
        {
          value: "profile-2",
          label: "Webサイト",
          description: "https://example.com",
          provider: "homepage",
        },
      ]}
      value={value}
      onValueChange={setValue}
      noAccount={noAccount}
      onNoAccountChange={setNoAccount}
      allowNoAccount
      maxSelections={2}
    />
  );
}

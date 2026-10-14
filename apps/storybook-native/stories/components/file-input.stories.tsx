import type { Meta, StoryObj } from "@storybook/react-native";

import { FileInput } from "@kyudaisai/ui-native";
import { action } from "storybook/actions";

import { useLocalFiles } from "./form-control-examples";

const selected = [
  { id: "sample-document", name: "サンプル.pdf", size: 245760, mimeType: "application/pdf" },
];
const meta = {
  title: "Components/FileInput",
  component: FileInput,
  args: {
    label: "添付ファイル",
    value: [],
    maxFiles: 3,
    maxBytes: 5 * 1024 * 1024,
    acceptLabel: "PDF・テキスト・画像",
    hint: "選択したファイルの名前と容量を確認できます。",
    onChoose: action("choose-file"),
    onRemove: action("remove-file"),
  },
  parameters: {
    notes:
      "共通部品は選択済みファイルの情報と選ぶ・外す操作だけを扱います。OSのファイル選択は利用側が呼び出します。このStoryでは端末内で選択し、外部への送信は行いません。キャンセルは選択済みの値を変更しません。",
  },
  render: function Example(args) {
    const files = useLocalFiles(args.value, { maxFiles: args.maxFiles, maxBytes: args.maxBytes });
    return (
      <FileInput
        {...args}
        value={files.files}
        choosing={files.choosing || args.choosing}
        error={files.error ?? args.error}
        onChoose={() => {
          args.onChoose();
          void files.choose();
        }}
        onRemove={(id) => {
          args.onRemove(id);
          files.remove(id);
        }}
      />
    );
  },
} satisfies Meta<typeof FileInput>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Selected: Story = { args: { value: selected } };
export const Invalid: Story = { args: { error: "1ファイル5 MBまで選べます。" } };
export const Disabled: Story = { args: { value: selected, disabled: true } };
export const ReadOnly: Story = { args: { value: selected, readOnly: true } };
export const Choosing: Story = { args: { choosing: true } };
export const Dark: Story = { parameters: { nativeTheme: "dark" } };

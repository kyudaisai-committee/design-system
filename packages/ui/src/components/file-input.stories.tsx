import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn, userEvent, within } from "storybook/test";

import { FileInput } from "./file-input";
import { useStoryControls } from "./story-controls";

const meta = {
  title: "Components/FileInput",
  component: FileInput,
  args: {
    label: "添付ファイル",
    hint: "PDF・テキストを2ファイルまで、各1MB以内で選択できます。",
    accept: ".pdf,.txt",
    maxFiles: 2,
    maxBytes: 1024 * 1024,
    value: [] as File[],
    required: false,
    disabled: false,
    readOnly: false,
    onValueChange: fn(),
  },
  argTypes: { value: { control: false }, onValueChange: { control: false } },
  parameters: {
    docs: {
      description: {
        component:
          "ファイルを選択し、名前・容量を確認して取り除けます。選択内容はvalueで管理します。新しく選択すると置き換わります。acceptはファイル選択画面の絞り込みです。ファイルの送信や保存は利用側で行います。",
      },
    },
  },
  render: function Example(incoming) {
    const [args, updateArgs] = useStoryControls(incoming);
    return (
      <div className="max-w-lg">
        <FileInput
          {...args}
          onValueChange={(value) => {
            updateArgs({ value });
            args.onValueChange(value);
          }}
        />
      </div>
    );
  },
} satisfies Meta<typeof FileInput>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText("添付ファイル");
    const file = new File(["見本"], "sample.txt", { type: "text/plain" });
    await userEvent.upload(input, file);
    await expect(canvas.getByText("sample.txt")).toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: "sample.txtを取り除く" }));
    await expect(canvas.queryByText("sample.txt")).not.toBeInTheDocument();
    await expect(input).toHaveFocus();
    await userEvent.upload(input, file);
    await expect(canvas.getByText("sample.txt")).toBeInTheDocument();
  },
};
export const SizeLimit: Story = {
  args: { maxBytes: 16, hint: "各16バイト以内で選択してください。" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText("添付ファイル");
    await userEvent.upload(input, new File(["x".repeat(17)], "large.txt", { type: "text/plain" }));
    await expect(input).toHaveAttribute("aria-invalid", "true");
    await expect(canvas.queryByText("large.txt")).not.toBeInTheDocument();
    await userEvent.upload(input, new File(["ok"], "small.txt", { type: "text/plain" }));
    await expect(input).not.toHaveAttribute("aria-invalid");
    await expect(canvas.getByText("small.txt")).toBeInTheDocument();
  },
};
export const Invalid: Story = { args: { required: true, error: "ファイルを選択してください。" } };
export const Disabled: Story = { args: { disabled: true } };
export const ReadOnly: Story = {
  args: { readOnly: true, value: [new File(["sample"], "sample.txt", { type: "text/plain" })] },
};

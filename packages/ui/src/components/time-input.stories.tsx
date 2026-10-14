import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn, userEvent, within } from "storybook/test";

import { Field } from "./compositions";
import { TimeInput } from "./form-controls";
import { useStoryControls } from "./story-controls";

const meta = {
  title: "Components/TimeInput",
  component: TimeInput,
  args: { value: "09:30", required: true, disabled: false, readOnly: false, onValueChange: fn() },
  argTypes: {
    defaultValue: {
      control: false,
      description:
        "初回表示時とフォームリセット後の値。新しい初期値で始める場合はkeyを変えて再表示します。",
    },
    value: { control: "text" },
    disabled: { control: "boolean" },
    readOnly: { control: "boolean" },
    required: { control: "boolean" },
    "aria-invalid": { control: "boolean" },
  },
  parameters: {
    docs: {
      description: {
        component:
          "24時間表記の HH:mm で手入力するか、時と分を選んで確定します。値の保存と業務上の検証は利用側で行います。",
      },
    },
  },
  render: function Example(incoming) {
    const [args, updateArgs] = useStoryControls(incoming);
    return (
      <form className="max-w-md" onSubmit={(event) => event.preventDefault()}>
        <Field
          label="開始時刻"
          hint="24時間表記（例：09:30）で指定してください。"
          required={args.required}
          error={args["aria-invalid"] ? "時刻を指定してください。" : undefined}
        >
          {(props) => (
            <TimeInput
              {...args}
              {...props}
              name="time"
              onValueChange={(value) => {
                updateArgs({ value });
                args.onValueChange?.(value);
              }}
            />
          )}
        </Field>
      </form>
    );
  },
} satisfies Meta<typeof TimeInput>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole("textbox", { name: /^開始時刻/ });
    await expect(input).toHaveAttribute("type", "text");
    await expect(input).toHaveValue("09:30");
    await expect(input).toBeRequired();
  },
};
export const Empty: Story = { args: { value: "" } };
export const SelectTime: Story = {
  play: async ({ canvasElement, args }) => {
    const input = within(canvasElement).getByRole("textbox", { name: /^開始時刻/ });
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      within(canvasElement).getByRole("button", { name: "時刻の選択画面を開く" }),
    );
    await userEvent.selectOptions(page.getByRole("combobox", { name: "時" }), "14");
    await userEvent.selectOptions(page.getByRole("combobox", { name: "分" }), "45");
    await expect(input).toHaveValue("09:30");
    await expect(args.onValueChange).not.toHaveBeenCalled();
    await userEvent.click(page.getByRole("button", { name: "時刻を決定" }));
    await expect(within(canvasElement).getByRole("textbox", { name: /^開始時刻/ })).toHaveValue(
      "14:45",
    );
    await expect(args.onValueChange).toHaveBeenLastCalledWith("14:45");
    await expect(new FormData(canvasElement.querySelector("form")!).get("time")).toBe("14:45");
  },
};
export const LimitedRange: Story = {
  args: { min: "09:00", max: "17:00" },
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      within(canvasElement).getByRole("button", { name: "時刻の選択画面を開く" }),
    );
    await userEvent.selectOptions(page.getByRole("combobox", { name: "時" }), "18");
    await expect(page.getByRole("button", { name: "時刻を決定" })).toBeDisabled();
    await expect(page.getByRole("alert")).toHaveTextContent("17:00以前");
    await userEvent.click(page.getByRole("button", { name: "キャンセル" }));
    await expect(within(canvasElement).getByRole("textbox", { name: /^開始時刻/ })).toHaveValue(
      "09:30",
    );
  },
};
export const Invalid: Story = { args: { "aria-invalid": true, value: "" } };
export const Disabled: Story = { args: { disabled: true } };
export const ReadOnly: Story = { args: { readOnly: true } };

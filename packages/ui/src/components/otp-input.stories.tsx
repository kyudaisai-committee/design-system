import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fireEvent, fn, userEvent, within } from "storybook/test";

import { Field } from "./compositions";
import { OtpInput } from "./form-controls";
import { useStoryControls } from "./story-controls";

const meta = {
  title: "Components/OtpInput",
  component: OtpInput,
  args: {
    value: "",
    length: 6,
    required: true,
    disabled: false,
    readOnly: false,
    onValueChange: fn(),
  },
  argTypes: {
    value: { control: "text" },
    length: { control: { type: "number", min: 1, max: 12 } },
    onValueChange: { control: false },
  },
  parameters: {
    docs: {
      description: {
        component:
          "確認コードを桁ごとの下線で表示します。操作中の桁を示し、入力・貼り付け・OSの自動入力を各桁へ配分します。実際の入力欄は一つなので、先頭の0、矢印キー、範囲選択と編集を保てます。全角数字と空白を含むコードは半角数字に整えます。入力しただけでは送信せず、コードの発行・有効期限・照合は利用側で扱います。",
      },
    },
  },
  render: function Example(incoming) {
    const [args, updateArgs] = useStoryControls(incoming);
    return (
      <div className="max-w-sm">
        <Field
          label="確認コード"
          hint={`${args.length}桁の数字を入力してください。コード全体を貼り付けられます。`}
          required={args.required}
          error={args["aria-invalid"] ? "確認コードをもう一度確認してください。" : undefined}
        >
          {(props) => (
            <OtpInput
              {...args}
              {...props}
              onValueChange={(value) => {
                updateArgs({ value });
                args.onValueChange(value);
              }}
            />
          )}
        </Field>
      </div>
    );
  },
} satisfies Meta<typeof OtpInput>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole("textbox", { name: /確認コード/ });
    await expect(input).toHaveAttribute("autocomplete", "one-time-code");
    await expect(input).toHaveAttribute("inputmode", "numeric");
    await userEvent.click(input);
    await userEvent.paste("０１２ ３４５");
    await expect(input).toHaveValue("012345");
    await expect(input).toBeValid();
    await userEvent.keyboard("{End}{Backspace}");
    await expect(input).toHaveValue("01234");
    await expect(input).toBeInvalid();
    await userEvent.keyboard("6");
    await expect(input).toHaveValue("012346");
    await expect(canvasElement.querySelectorAll(".ds-otp-slot")).toHaveLength(6);
    await expect(within(canvasElement).getAllByRole("textbox")).toHaveLength(1);
    await userEvent.keyboard("{Home}{ArrowRight}");
    (input as HTMLInputElement).setSelectionRange(1, 2);
    fireEvent.select(input);
    await userEvent.keyboard("9");
    await expect(input).toHaveValue("092346");
    await userEvent.keyboard("{Home}{Delete}");
    await expect(input).toHaveValue("92346");
    await userEvent.keyboard("{End}0");
    await expect(input).toHaveValue("923460");
  },
};
export const FourDigits: Story = {
  args: { length: 4, value: "" },
  play: async ({ canvasElement }) => {
    const group = canvasElement.querySelector(".ds-otp")!;
    const bounds = group.getBoundingClientRect();
    const parent = group.parentElement!.getBoundingClientRect();
    await expect(Math.abs(bounds.left + bounds.right - parent.left - parent.right)).toBeLessThan(2);
  },
};
export const Autofill: Story = {
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole("textbox");
    await userEvent.click(input);
    fireEvent.input(input, {
      target: { value: "０１２-３４５" },
      inputType: "insertReplacementText",
    });
    await expect(input).toHaveValue("012345");
    await expect(input).toBeValid();
    await expect(
      Array.from(canvasElement.querySelectorAll(".ds-otp-slot"), (slot) => slot.textContent).join(
        "",
      ),
    ).toBe("012345");
  },
};
export const Invalid: Story = { args: { value: "012345", "aria-invalid": true } };
export const Disabled: Story = { args: { value: "012345", disabled: true } };
export const ReadOnly: Story = {
  args: { value: "012345", readOnly: true },
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole("textbox");
    await userEvent.click(input);
    await userEvent.keyboard("{Backspace}9");
    await expect(input).toHaveValue("012345");
    await expect(input).toHaveFocus();
  },
};
export const Composition: Story = {
  tags: ["!dev", "!autodocs"],
  play: async ({ canvasElement, args }) => {
    const input = within(canvasElement).getByRole("textbox");
    await userEvent.click(input);
    fireEvent.compositionStart(input);
    fireEvent.input(input, { target: { value: "０１２" }, isComposing: true });
    await expect(input).toHaveValue("０１２");
    await expect(args.onValueChange).not.toHaveBeenCalled();
    fireEvent.compositionEnd(input, { data: "０１２" });
    await expect(input).toHaveValue("012");
    await expect(args.onValueChange).toHaveBeenLastCalledWith("012");
    await userEvent.keyboard("345");
    await expect(input).toHaveValue("012345");
    await expect(input).toBeValid();
  },
};

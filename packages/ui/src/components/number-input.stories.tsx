import type { Meta, StoryObj } from "@storybook/react-vite";

import { useState } from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";

import { Button } from "./button";
import { Field } from "./compositions";
import { NumberInput } from "./form-controls";
import { useStoryControls } from "./story-controls";

const meta = {
  title: "Components/NumberInput",
  component: NumberInput,
  args: {
    value: "12",
    required: true,
    disabled: false,
    readOnly: false,
    onChange: fn(),
    integer: true,
    min: 0,
    max: 100,
  },
  argTypes: {
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
          "数値の入力に使います。integerを指定すると小数を不正な値として扱い、min/maxが小数でも範囲内の整数を選べます。Fieldでラベル・条件・エラーを関連付けます。値の保存と業務上の検証は利用側で行います。",
      },
    },
  },
  render: function Example(incoming) {
    const [args, updateArgs] = useStoryControls(incoming);
    const condition = [
      args.integer ? "整数" : "数値",
      args.min !== undefined ? `${args.min}以上` : undefined,
      args.max !== undefined ? `${args.max}以下` : undefined,
    ]
      .filter(Boolean)
      .join("・");
    return (
      <div className="max-w-md">
        <Field
          label="数量"
          hint={`${condition}で入力してください。`}
          required={args.required}
          error={args["aria-invalid"] ? "入力条件に合う数値を入力してください。" : undefined}
        >
          {(props) => (
            <NumberInput
              {...args}
              {...props}
              onChange={(event) => {
                updateArgs({ value: event.target.value });
                args.onChange?.(event);
              }}
            />
          )}
        </Field>
      </div>
    );
  },
} satisfies Meta<typeof NumberInput>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole("spinbutton");
    await userEvent.clear(input);
    await expect(input).toHaveValue(null);
    await userEvent.type(input, "101");
    await expect(input).toBeInvalid();
    await userEvent.clear(input);
    await userEvent.type(input, "3.5");
    await expect(input).toBeInvalid();
    await userEvent.clear(input);
    await userEvent.type(input, "3");
    await expect(input).toBeValid();
  },
};
export const Empty: Story = { args: { value: "" } };
export const Invalid: Story = { args: { "aria-invalid": true, value: "" } };
export const Disabled: Story = { args: { disabled: true } };
export const ReadOnly: Story = { args: { readOnly: true } };
export const IntegerWithoutBounds: Story = {
  args: { min: undefined, max: undefined, value: "1.5" },
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole("spinbutton");
    await expect(input).toBeInvalid();
    await userEvent.clear(input);
    await userEvent.type(input, "2");
    await userEvent.tab();
    await expect(input).toBeValid();
    await userEvent.clear(input);
    await userEvent.type(input, "1.5");
    await userEvent.tab();
    await expect(input).toBeInvalid();
  },
};
export const FractionalBounds: Story = {
  args: { min: 0.5, max: 2.8, step: 0.5, value: "1.5" },
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole("spinbutton");
    await expect(input).toBeInvalid();
    await userEvent.clear(input);
    await userEvent.type(input, "2");
    await expect(input).toBeValid();
    await userEvent.clear(input);
    await userEvent.type(input, "3");
    await expect(input).toBeInvalid();
    await userEvent.clear(input);
    await userEvent.type(input, "0");
    await expect(input).toBeInvalid();
  },
};
export const Decimal: Story = {
  args: { integer: false, value: "1.5" },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("spinbutton")).toBeValid();
  },
};
export const SignedNumber: Story = {
  args: { min: -10, max: 10, integer: false, value: "" },
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole("spinbutton");
    await expect(input).toHaveAttribute("inputmode", "text");
    await userEvent.type(input, "-1.5");
    await expect(input).toHaveValue(-1.5);
    await expect(input).toBeValid();
  },
};
export const UncontrolledInteger: Story = {
  args: { min: undefined, max: undefined, value: undefined, defaultValue: "1.5" },
  render: (args) => <Field label="整数">{(props) => <NumberInput {...args} {...props} />}</Field>,
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole("spinbutton");
    await expect(input).toBeInvalid();
    await userEvent.clear(input);
    await userEvent.type(input, "2");
    await expect(input).toBeValid();
  },
};
export const IntegerUpdatesWhileDisabled: Story = {
  tags: ["!dev", "!autodocs"],
  render: function Example(args) {
    const [value, setValue] = useState("1.5");
    const [disabled, setDisabled] = useState(false);
    return (
      <div className="space-y-4">
        <Field label="整数">
          {(props) => (
            <NumberInput
              {...args}
              {...props}
              value={value}
              disabled={disabled}
              onChange={(event) => setValue(event.target.value)}
            />
          )}
        </Field>
        <Button
          onClick={() => {
            setValue("2");
            setDisabled(true);
          }}
        >
          整数に更新
        </Button>
        <Button onClick={() => setDisabled(false)}>編集を再開</Button>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("spinbutton");
    await expect(input).toBeInvalid();
    await userEvent.click(canvas.getByRole("button", { name: "整数に更新" }));
    await expect(input).toBeDisabled();
    await expect(input).toHaveValue(2);
    await userEvent.click(canvas.getByRole("button", { name: "編集を再開" }));
    await expect(input).toBeEnabled();
    await expect(input).toBeValid();
  },
};

export const ResetInteger: Story = {
  tags: ["!dev", "!autodocs"],
  args: { value: undefined, defaultValue: "1.5", min: undefined, max: undefined },
  render: (args) => (
    <form className="space-y-4">
      <Field label="整数">{(props) => <NumberInput {...args} {...props} />}</Field>
      <Button type="reset">入力をリセット</Button>
    </form>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("spinbutton");
    await expect(input).toBeInvalid();
    await userEvent.clear(input);
    await userEvent.type(input, "2");
    await expect(input).toBeValid();
    await userEvent.click(canvas.getByRole("button", { name: "入力をリセット" }));
    await waitFor(() => expect(input).toHaveValue(1.5));
    await expect(input).toBeInvalid();
  },
};

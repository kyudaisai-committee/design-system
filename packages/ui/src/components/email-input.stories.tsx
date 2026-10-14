import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn, userEvent, within } from "storybook/test";

import { Field } from "./compositions";
import { EmailInput } from "./form-controls";
import { useStoryControls } from "./story-controls";

const meta = {
  title: "Components/EmailInput",
  component: EmailInput,
  args: {
    value: "name@example.com",
    required: true,
    disabled: false,
    readOnly: false,
    onChange: fn(),
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
          "連絡を受け取るメールアドレスを入力してください。 Fieldでラベル・条件・エラーを関連付けます。値の保存と業務上の検証は利用側で行います。",
      },
    },
  },
  render: function Example(incoming) {
    const [args, updateArgs] = useStoryControls(incoming);
    return (
      <div className="max-w-md">
        <Field
          label="メールアドレス"
          hint="連絡を受け取るメールアドレスを入力してください。"
          required={args.required}
          error={args["aria-invalid"] ? "有効なメールアドレスを入力してください。" : undefined}
        >
          {(props) => (
            <EmailInput
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
} satisfies Meta<typeof EmailInput>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox", { name: /メールアドレス/ });
    await expect(input).toHaveAttribute("type", "email");
    await expect(input).toHaveAttribute("autocomplete", "email");
    await userEvent.clear(input);
    await userEvent.type(input, "not-an-address");
    await expect(input).toBeInvalid();
    await userEvent.clear(input);
    await userEvent.type(input, "contact+sample@example.com");
    await expect(input).toBeValid();
  },
};
export const Empty: Story = { args: { value: "" } };
export const Invalid: Story = { args: { "aria-invalid": true, value: "" } };
export const Disabled: Story = { args: { disabled: true } };
export const ReadOnly: Story = { args: { readOnly: true } };

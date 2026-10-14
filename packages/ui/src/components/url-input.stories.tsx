import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn, userEvent, within } from "storybook/test";

import { Field } from "./compositions";
import { UrlInput } from "./form-controls";
import { useStoryControls } from "./story-controls";

const meta = {
  title: "Components/UrlInput",
  component: UrlInput,
  args: {
    value: "https://example.com",
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
          "https://から始まるURLを入力してください。 Fieldでラベル・条件・エラーを関連付けます。値の保存と業務上の検証は利用側で行います。",
      },
    },
  },
  render: function Example(incoming) {
    const [args, updateArgs] = useStoryControls(incoming);
    return (
      <div className="max-w-md">
        <Field
          label="Webサイト"
          hint="https://から始まるURLを入力してください。"
          required={args.required}
          error={args["aria-invalid"] ? "有効なURLを入力してください。" : undefined}
        >
          {(props) => (
            <UrlInput
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
} satisfies Meta<typeof UrlInput>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole("textbox");
    await userEvent.clear(input);
    await userEvent.type(input, "example");
    await expect(input).toBeInvalid();
    await userEvent.clear(input);
    await userEvent.type(input, "https://example.com/about");
    await expect(input).toBeValid();
  },
};
export const Empty: Story = { args: { value: "" } };
export const Invalid: Story = { args: { "aria-invalid": true, value: "" } };
export const Disabled: Story = { args: { disabled: true } };
export const ReadOnly: Story = { args: { readOnly: true } };

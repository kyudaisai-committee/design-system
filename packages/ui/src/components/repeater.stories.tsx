import type { Meta, StoryObj } from "@storybook/react-vite";

import { useRef, useState } from "react";
import { expect, fn, userEvent, within } from "storybook/test";

import { Button } from "./button";
import { Repeater } from "./collection-fields";
import { Field } from "./compositions";
import { EmailInput } from "./form-controls";
import { Input } from "./input";

const meta = {
  title: "Components/Repeater",
  component: Repeater,
  args: {
    label: "連絡先",
    hint: "1件から3件まで追加できます。",
    minItems: 1,
    maxItems: 3,
    disabled: false,
    readOnly: false,
    items: [{ id: "contact-1" }],
    onAdd: fn(),
    onRemove: fn(),
    renderItem: () => null,
  },
  argTypes: { items: { control: false }, renderItem: { control: false } },
  parameters: {
    docs: {
      description: {
        component:
          "同じ入力項目のまとまりを追加・削除できます。利用側で変わらないidと各行の回答を管理し、削除で別の行の回答を入れ替えないようにします。renderItemが受け取るdisabled/readOnlyは子の入力に渡してください。",
      },
    },
  },
  render: function Example(args) {
    const next = useRef(2);
    const [rows, setRows] = useState([{ id: "contact-1", name: "", email: "" }]);
    return (
      <div className="max-w-lg">
        <Repeater
          {...args}
          items={rows}
          onAdd={() => {
            setRows((current) => [
              ...current,
              { id: `contact-${next.current++}`, name: "", email: "" },
            ]);
            args.onAdd();
          }}
          onRemove={(id) => {
            setRows((current) => current.filter((row) => row.id !== id));
            args.onRemove(id);
          }}
          renderItem={(item, index, state) => {
            const row = rows.find((entry) => entry.id === item.id)!;
            return (
              <div className="space-y-3">
                <Field label="名前">
                  {(props) => (
                    <Input
                      {...props}
                      {...state}
                      aria-label={`連絡先${index + 1}の名前`}
                      value={row.name}
                      onChange={(event) =>
                        setRows((current) =>
                          current.map((entry) =>
                            entry.id === row.id ? { ...entry, name: event.target.value } : entry,
                          ),
                        )
                      }
                    />
                  )}
                </Field>
                <Field label="メールアドレス">
                  {(props) => (
                    <EmailInput
                      {...props}
                      {...state}
                      aria-label={`連絡先${index + 1}のメールアドレス`}
                      value={row.email}
                      onChange={(event) =>
                        setRows((current) =>
                          current.map((entry) =>
                            entry.id === row.id ? { ...entry, email: event.target.value } : entry,
                          ),
                        )
                      }
                    />
                  )}
                </Field>
              </div>
            );
          }}
        />
      </div>
    );
  },
} satisfies Meta<typeof Repeater>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("button", { name: "1件目を削除" })).toBeDisabled();
    await userEvent.type(canvas.getByLabelText("連絡先1の名前"), "一人目");
    await userEvent.click(canvas.getByRole("button", { name: "項目を追加" }));
    await expect(canvas.getByLabelText("連絡先2の名前")).toHaveFocus();
    await userEvent.type(canvas.getByLabelText("連絡先2の名前"), "二人目");
    await userEvent.click(canvas.getByRole("button", { name: "項目を追加" }));
    await expect(canvas.getByLabelText("連絡先3の名前")).toHaveFocus();
    await userEvent.type(canvas.getByLabelText("連絡先3の名前"), "三人目");
    await expect(canvas.getByRole("button", { name: "項目を追加" })).toBeDisabled();
    await userEvent.click(canvas.getByRole("button", { name: "2件目を削除" }));
    await expect(canvas.getByLabelText("連絡先1の名前")).toHaveValue("一人目");
    await expect(canvas.getByLabelText("連絡先2の名前")).toHaveValue("三人目");
    await expect(canvas.getByLabelText("連絡先2の名前")).toHaveFocus();
  },
};
export const Invalid: Story = { args: { error: "各連絡先の名前を入力してください。" } };
export const Disabled: Story = { args: { disabled: true } };
export const ReadOnly: Story = { args: { readOnly: true } };

export const EmptyCollection: Story = {
  tags: ["!dev", "!autodocs"],
  args: { minItems: 0 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "1件目を削除" }));
    await expect(canvas.getByRole("button", { name: "項目を追加" })).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(canvas.getByLabelText("連絡先1の名前")).toHaveFocus();
  },
};
export const DelayedRemoval: Story = {
  tags: ["!dev", "!autodocs"],
  render: function Example(args) {
    const [items, setItems] = useState([{ id: "contact-1" }, { id: "contact-2" }]);
    const [pending, setPending] = useState<string | null>(null);
    return (
      <div className="space-y-4">
        <Repeater
          {...args}
          items={items}
          onRemove={setPending}
          renderItem={(_item, index) => <Input aria-label={`連絡先${index + 1}の名前`} />}
        />
        <Button
          onClick={() => setItems((current) => current.filter((item) => item.id !== pending))}
        >
          削除を完了
        </Button>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "1件目を削除" }));
    const complete = canvas.getByRole("button", { name: "削除を完了" });
    await userEvent.click(complete);
    await expect(canvas.getAllByRole("textbox")).toHaveLength(1);
    await expect(complete).toHaveFocus();
  },
};

import type { Meta, StoryObj } from "@storybook/react-vite";

import { useState } from "react";
import { expect, fn, userEvent, within } from "storybook/test";

import { InputTable } from "./collection-fields";
import { NumberInput, TimeInput } from "./form-controls";

const rows = [
  { id: "morning", label: "午前" },
  { id: "afternoon", label: "午後" },
];
const columns = [
  { key: "time", label: "開始時刻" },
  { key: "count", label: "数量" },
];
const meta = {
  title: "Components/InputTable",
  component: InputTable,
  args: {
    label: "時間帯ごとの入力",
    hint: "行と列の対応を保ったまま入力できます。狭い画面では表を横にスクロールします。",
    rows,
    columns,
    renderCell: () => null,
    disabled: false,
    readOnly: false,
  },
  argTypes: {
    rows: { control: false },
    columns: { control: false },
    renderCell: { control: false },
  },
  parameters: {
    docs: {
      description: {
        component:
          "同じ列を持つ回答を入力する表です。行・列に見出しを付け、各入力にも両方を含む名前を付けます。固定行にも、onAdd/onRemoveを渡す可変行にも使えます。セルの入力と回答の保持は利用側で行います。",
      },
    },
  },
  render: function Example(args) {
    const [currentRows, setCurrentRows] = useState([...args.rows]);
    const [values, setValues] = useState<Record<string, string>>({
      "morning-time": "09:00",
      "afternoon-time": "13:00",
    });
    return (
      <div className="max-w-2xl">
        <InputTable
          {...args}
          rows={currentRows}
          onRemove={
            args.onRemove
              ? (id) => {
                  setCurrentRows((current) => current.filter((row) => row.id !== id));
                  args.onRemove?.(id);
                }
              : undefined
          }
          renderCell={(rowId, columnKey, state) => {
            const key = `${rowId}-${columnKey}`;
            const inputProps = {
              ...state,
              "aria-label": `${rows.find((row) => row.id === rowId)?.label} ${columns.find((column) => column.key === columnKey)?.label}`,
              value: values[key] ?? "",
              onChange: (event: React.ChangeEvent<HTMLInputElement>) =>
                setValues((current) => ({ ...current, [key]: event.target.value })),
            };
            return columnKey === "time" ? (
              <TimeInput
                {...state}
                aria-label={inputProps["aria-label"]}
                value={inputProps.value}
                onValueChange={(value) => setValues((current) => ({ ...current, [key]: value }))}
              />
            ) : (
              <NumberInput {...inputProps} integer min={0} />
            );
          }}
        />
      </div>
    );
  },
} satisfies Meta<typeof InputTable>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("table", { name: "時間帯ごとの入力" })).toBeInTheDocument();
    await userEvent.type(canvas.getByRole("spinbutton", { name: "午前 数量" }), "12");
    await userEvent.type(canvas.getByRole("spinbutton", { name: "午後 数量" }), "8");
    await expect(canvas.getByRole("spinbutton", { name: "午前 数量" })).toHaveValue(12);
    await expect(canvas.getByRole("spinbutton", { name: "午後 数量" })).toHaveValue(8);
  },
};
export const Invalid: Story = { args: { error: "数量は0以上で入力してください。" } };
export const RemovableRows: Story = {
  args: { onRemove: fn(), minRows: 1 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole("spinbutton", { name: "午後 数量" }), "8");
    await userEvent.click(canvas.getByRole("button", { name: "午前を削除" }));
    await expect(canvas.queryByRole("spinbutton", { name: "午前 数量" })).not.toBeInTheDocument();
    await expect(canvas.getByRole("spinbutton", { name: "午後 数量" })).toHaveValue(8);
    await expect(canvas.getByRole("button", { name: "午後を削除" })).toBeDisabled();
    await expect(canvas.getByRole("textbox", { name: "午後 開始時刻" })).toHaveFocus();
  },
};
export const Disabled: Story = { args: { disabled: true } };
export const ReadOnly: Story = { args: { readOnly: true } };

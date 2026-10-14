import type { Meta, StoryObj } from "@storybook/react-vite";

import { useState } from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";

import { Button } from "./button";
import { Field } from "./compositions";
import { DateInput, TimeInput } from "./form-controls";
import { useStoryControls } from "./story-controls";

const meta = {
  title: "Components/DateInput",
  component: DateInput,
  args: {
    value: "2026-11-01",
    required: true,
    disabled: false,
    readOnly: false,
    onValueChange: fn(),
  },
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
          "yyyy/mm/dd で手入力するか、日本語の月間カレンダーから選びます。日付をクリックするか Enter を押すと反映されます。値とフォーム送信には YYYY-MM-DD を使います。矢印キーで日付、Page Up / Down で月、Shift と併用すると年を移動できます。選ばずに Escape で閉じた場合は元の値を保持します。",
      },
    },
  },
  render: function Example(incoming) {
    const [args, updateArgs] = useStoryControls(incoming);
    return (
      <form className="max-w-md" onSubmit={(event) => event.preventDefault()}>
        <Field
          label="日付"
          hint="yyyy/mm/dd（年/月/日）で入力するか、カレンダーから選んでください。"
          required={args.required}
          error={args["aria-invalid"] ? "日付を指定してください。" : undefined}
        >
          {(props) => (
            <DateInput
              {...args}
              {...props}
              name="date"
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
} satisfies Meta<typeof DateInput>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole("textbox", { name: /^日付/ });
    await expect(input).toHaveAttribute("type", "text");
    await expect(input).toHaveValue("2026/11/01");
    await expect(input).toBeRequired();
    await expect(new FormData(canvasElement.querySelector("form")!).get("date")).toBe("2026-11-01");
  },
};
export const Empty: Story = { args: { value: "" } };
export const CalendarSelection: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox", { name: /^日付/ });
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole("button", { name: "日付の選択画面を開く" }));
    await expect(page.getByRole("grid", { name: "2026年11月" })).toBeInTheDocument();
    const first = page.getByRole("button", { name: "2026年11月1日（日曜日）" });
    await waitFor(() => expect(first).toHaveFocus());
    await userEvent.keyboard("{ArrowRight}");
    await expect(page.getByRole("button", { name: "2026年11月2日（月曜日）" })).toHaveFocus();
    await expect(input).toHaveValue("2026/11/01");
    await expect(args.onValueChange).not.toHaveBeenCalled();
    await userEvent.keyboard("{Enter}");
    await expect(canvas.getByRole("textbox", { name: /^日付/ })).toHaveValue("2026/11/02");
    await expect(args.onValueChange).toHaveBeenLastCalledWith("2026-11-02");
    await waitFor(() => expect(page.queryByRole("grid")).not.toBeInTheDocument());
    await waitFor(() =>
      expect(canvas.getByRole("button", { name: "日付の選択画面を開く" })).toHaveFocus(),
    );
    await userEvent.click(canvas.getByRole("button", { name: "日付の選択画面を開く" }));
    await userEvent.click(page.getByRole("button", { name: "2026年11月3日（火曜日）" }));
    await expect(canvas.getByRole("textbox", { name: /^日付/ })).toHaveValue("2026/11/03");
    await expect(args.onValueChange).toHaveBeenLastCalledWith("2026-11-03");
    await expect(new FormData(canvasElement.querySelector("form")!).get("date")).toBe("2026-11-03");
    await waitFor(() => expect(page.queryByRole("grid")).not.toBeInTheDocument());
    await waitFor(() =>
      expect(canvas.getByRole("button", { name: "日付の選択画面を開く" })).toHaveFocus(),
    );
  },
};
export const CalendarNavigation: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox", { name: /^日付/ });
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole("button", { name: "日付の選択画面を開く" }));
    await waitFor(() =>
      expect(page.getByRole("button", { name: "2026年11月1日（日曜日）" })).toHaveFocus(),
    );
    await userEvent.keyboard("{ArrowRight}{PageDown}");
    await expect(page.getByRole("grid", { name: "2026年12月" })).toBeInTheDocument();
    await userEvent.click(page.getByRole("button", { name: "次の月" }));
    await expect(page.getByRole("grid", { name: "2027年1月" })).toBeInTheDocument();
    await userEvent.selectOptions(page.getByRole("combobox", { name: "月" }), "5");
    const year = page.getByRole("spinbutton", { name: "年" });
    await userEvent.clear(year);
    await userEvent.type(year, "2028");
    await userEvent.tab();
    await expect(page.getByRole("grid", { name: "2028年6月" })).toBeInTheDocument();
    await expect(input).toHaveValue("2026/11/01");
    await expect(args.onValueChange).not.toHaveBeenCalled();
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(page.queryByRole("grid")).not.toBeInTheDocument());
    await expect(canvas.getByRole("textbox", { name: /^日付/ })).toHaveValue("2026/11/01");
    await expect(args.onValueChange).not.toHaveBeenCalled();
    await waitFor(() =>
      expect(canvas.getByRole("button", { name: "日付の選択画面を開く" })).toHaveFocus(),
    );
  },
};
export const ManualEntry: Story = {
  args: { value: "", min: "2024-02-01", max: "2024-03-31" },
  play: async ({ canvasElement, args }) => {
    const input = within(canvasElement).getByRole("textbox", { name: /^日付/ }) as HTMLInputElement;
    await userEvent.type(input, "2024/02/30");
    await expect(input.checkValidity()).toBe(false);
    await expect(args.onValueChange).not.toHaveBeenCalled();
    await userEvent.clear(input);
    await userEvent.type(input, "2024/02/29");
    await expect(input.checkValidity()).toBe(true);
    await expect(args.onValueChange).toHaveBeenLastCalledWith("2024-02-29");
    await expect(new FormData(canvasElement.querySelector("form")!).get("date")).toBe("2024-02-29");
    await userEvent.clear(input);
    await userEvent.type(input, "2024/04/01");
    await expect(input.checkValidity()).toBe(false);
    await userEvent.clear(input);
    await expect(input.validity.valueMissing).toBe(true);
  },
};
export const LimitedRange: Story = {
  args: { min: "2026-11-10", max: "2026-11-20", value: "2026-11-15" },
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      within(canvasElement).getByRole("button", { name: "日付の選択画面を開く" }),
    );
    await expect(page.getByRole("button", { name: "2026年11月9日（月曜日）" })).toBeDisabled();
    await expect(page.getByRole("button", { name: "前の月" })).toBeDisabled();
    await expect(page.getByRole("button", { name: "次の月" })).toBeDisabled();
    await waitFor(() =>
      expect(page.getByRole("button", { name: "2026年11月15日（日曜日）" })).toHaveFocus(),
    );
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(page.queryByRole("grid")).not.toBeInTheDocument());
  },
};
export const Clearable: Story = {
  args: { required: false },
  play: async ({ canvasElement, args }) => {
    await userEvent.click(
      within(canvasElement).getByRole("button", { name: "日付の選択画面を開く" }),
    );
    await userEvent.click(
      within(canvasElement.ownerDocument.body).getByRole("button", { name: "クリア" }),
    );
    await expect(within(canvasElement).getByRole("textbox", { name: /^日付/ })).toHaveValue("");
    await expect(args.onValueChange).toHaveBeenLastCalledWith("");
  },
};
export const Invalid: Story = { args: { "aria-invalid": true, value: "" } };
export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("button")).toBeDisabled();
  },
};
export const ReadOnly: Story = {
  args: { readOnly: true },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("button")).toBeDisabled();
    await expect(within(canvasElement).getByRole("textbox")).toHaveAttribute("readonly");
  },
};

export const ControlledValue: Story = {
  render: (args) => (
    <form>
      <Field label="日付" hint="この例では親が変更を採用しないため、値を維持します。">
        {(props) => <DateInput {...args} {...props} name="date" value="2026-11-01" />}
      </Field>
    </form>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole("button", { name: "日付の選択画面を開く" }));
    await userEvent.click(page.getByRole("button", { name: "2026年11月3日（火曜日）" }));
    await expect(args.onValueChange).toHaveBeenLastCalledWith("2026-11-03");
    await expect(canvas.getByRole("textbox", { name: /^日付/ })).toHaveValue("2026/11/01");
    await expect(new FormData(canvasElement.querySelector("form")!).get("date")).toBe("2026-11-01");
    await userEvent.clear(canvas.getByRole("textbox", { name: /^日付/ }));
    await expect(canvas.getByRole("textbox", { name: /^日付/ })).toHaveValue("2026/11/01");
    await expect(new FormData(canvasElement.querySelector("form")!).get("date")).toBe("2026-11-01");
  },
};

export const CancelledReset: Story = {
  tags: ["!dev", "!autodocs"],
  render: () => (
    <form onReset={(event) => event.preventDefault()} className="space-y-4">
      <Field label="日付">
        {(props) => <DateInput {...props} name="date" defaultValue="2026-11-01" />}
      </Field>
      <Button type="reset">入力をリセット</Button>
    </form>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox", { name: "日付" });
    await userEvent.clear(input);
    await userEvent.type(input, "2026/12/01");
    await userEvent.click(canvas.getByRole("button", { name: "入力をリセット" }));
    await expect(input).toHaveValue("2026/12/01");
    await expect(new FormData(canvasElement.querySelector("form")!).get("date")).toBe("2026-12-01");
  },
};

export const ResetOwnership: Story = {
  tags: ["!dev", "!autodocs"],
  render: function Example() {
    const [cancelReset, setCancelReset] = useState(true);
    const [updatedDefaults, setUpdatedDefaults] = useState(false);
    return (
      <div className="space-y-4">
        <form
          id="datetime-reset-form"
          onReset={(event) => {
            if (cancelReset) event.preventDefault();
          }}
        >
          <Button type="reset">入力をリセット</Button>
        </form>
        <DateInput
          form="datetime-reset-form"
          name="date"
          aria-label="日付"
          defaultValue={updatedDefaults ? "2027-01-01" : "2026-11-01"}
        />
        <TimeInput
          form="datetime-reset-form"
          name="time"
          aria-label="時刻"
          defaultValue={updatedDefaults ? "12:00" : "09:00"}
        />
        <DateInput
          form="datetime-reset-form"
          name="controlled-date"
          aria-label="固定の日付"
          value="2026-12-01"
        />
        <TimeInput
          form="datetime-reset-form"
          name="controlled-time"
          aria-label="固定の時刻"
          value="10:00"
        />
        <Button onClick={() => setUpdatedDefaults(true)}>既定値を更新</Button>
        <Button onClick={() => setCancelReset(false)}>リセットを許可</Button>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const date = canvas.getByRole("textbox", { name: "日付" });
    const time = canvas.getByRole("textbox", { name: "時刻" });
    await userEvent.clear(date);
    await userEvent.type(date, "2026/12/31");
    await userEvent.clear(time);
    await userEvent.type(time, "13:30");
    await userEvent.click(canvas.getByRole("button", { name: "既定値を更新" }));
    await userEvent.click(canvas.getByRole("button", { name: "入力をリセット" }));
    await expect(date).toHaveValue("2026/12/31");
    await expect(time).toHaveValue("13:30");
    await userEvent.click(canvas.getByRole("button", { name: "リセットを許可" }));
    await userEvent.click(canvas.getByRole("button", { name: "入力をリセット" }));
    await expect(date).toHaveValue("2026/11/01");
    await expect(time).toHaveValue("09:00");
    await expect(canvas.getByRole("textbox", { name: "固定の日付" })).toHaveValue("2026/12/01");
    await expect(canvas.getByRole("textbox", { name: "固定の時刻" })).toHaveValue("10:00");
    const data = new FormData(canvasElement.querySelector("form")!);
    await expect(data.get("date")).toBe("2026-11-01");
    await expect(data.get("time")).toBe("09:00");
  },
};

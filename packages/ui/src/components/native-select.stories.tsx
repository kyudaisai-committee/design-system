import type { Meta, StoryObj } from "@storybook/react-vite";
import { useStoryControls } from "./story-controls";
import { expect, fn, userEvent, within } from "storybook/test";
import {
  NativeSelect,
  NativeSelectOption,
  NativeSelectOptGroup,
} from "./native-select";
import { Label } from "./label";

const options = (
  <>
    <NativeSelectOption value="food">模擬店</NativeSelectOption>
    <NativeSelectOption value="exhibition">展示</NativeSelectOption>
    <NativeSelectOption value="stage">ステージ</NativeSelectOption>
  </>
);
const meta = {
  title: "Components/NativeSelect",
  component: NativeSelect,
  subcomponents: { NativeSelectOption, NativeSelectOptGroup },
  args: {
    value: "food",
    size: "default",
    disabled: false,
    required: false,
    onChange: fn(),
    children: options,
  },
  argTypes: {
    value: {
      control: "select",
      options: ["food", "exhibition", "stage"],
      description: "選択する option の value。",
    },
    size: {
      control: "inline-radio",
      options: ["default", "sm"],
      description: "操作領域の高さ。標準は default。",
      table: { defaultValue: { summary: "default" } },
    },
    disabled: { control: "boolean" },
    required: { control: "boolean" },
    "aria-invalid": { control: "boolean" },
    children: {
      control: false,
      description:
        "NativeSelectOption と NativeSelectOptGroup。ブラウザー標準の選択肢を使う。",
    },
    onChange: { control: false },
  },
  parameters: {
    docs: {
      description: {
        component:
          "ブラウザーやOSの選択メニューから、一つの値を選びます。選択肢を常に並べて表示する余地が少ない場合に使います。少数の選択肢を見比べて選ぶ場合はRadioGroupを使います。\n\n入力項目のラベルを付け、NativeSelectOptionで選択肢を指定します。関連する選択肢はNativeSelectOptGroupでまとめられます。",
      },
    },
  },
  render: function Render(incoming, { id }) {
    const [args, updateArgs] = useStoryControls(incoming);
    return (
      <div className="ds-stack max-w-sm">
        <Label htmlFor={`${id}-select`}>企画区分</Label>
        <NativeSelect
          {...args}
          id={`${id}-select`}
          onChange={(event) => {
            updateArgs({ value: event.target.value });
            args.onChange?.(event);
          }}
        />
      </div>
    );
  },
} satisfies Meta<typeof NativeSelect>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "基本",
  play: async ({ canvasElement }) => {
    const select = within(canvasElement).getByRole("combobox", {
      name: "企画区分",
    });
    await userEvent.selectOptions(select, "exhibition");
    await expect(select).toHaveValue("exhibition");
  },
};
export const Small: Story = { name: "コンパクト", args: { size: "sm" } };
export const Disabled: Story = { name: "無効", args: { disabled: true } };
export const Invalid: Story = {
  name: "未選択エラー",
  args: { value: "", "aria-invalid": true, required: true },
  render: (args) => (
    <div className="ds-stack max-w-sm">
      <Label htmlFor="missing-category">
        企画区分 <span>必須</span>
      </Label>
      <NativeSelect
        {...args}
        value={undefined}
        defaultValue=""
        id="missing-category"
        aria-describedby="category-error"
      >
        <NativeSelectOption value="" disabled>
          選択してください
        </NativeSelectOption>
        {options}
      </NativeSelect>
      <p id="category-error" className="text-sm text-destructive">
        企画区分を選択してください。
      </p>
    </div>
  ),
};
export const Grouped: Story = {
  name: "選択肢のグループ",
  render: () => (
    <div className="ds-stack max-w-sm">
      <Label htmlFor="venue">使用会場</Label>
      <NativeSelect id="venue" defaultValue="lecture">
        <NativeSelectOptGroup label="屋内">
          <NativeSelectOption value="lecture">
            センター2号館・講義室
          </NativeSelectOption>
          <NativeSelectOption value="hall">
            センター1号館・多目的ホール
          </NativeSelectOption>
        </NativeSelectOptGroup>
        <NativeSelectOptGroup label="屋外">
          <NativeSelectOption value="plaza">
            ビッグさんど前広場
          </NativeSelectOption>
          <NativeSelectOption value="stage" disabled>
            屋外ステージ（受付終了）
          </NativeSelectOption>
        </NativeSelectOptGroup>
      </NativeSelect>
    </div>
  ),
};

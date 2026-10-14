import type { Meta, StoryObj } from "@storybook/react-native";

import {
  Button,
  Notice,
  ProcessSteps,
  Text,
  sequenceIconNames,
  type ProcessStepsProps,
  type SequenceIconName,
} from "@kyudaisai/ui-native";
import { useState } from "react";
import { View } from "react-native";

type IconChoice = SequenceIconName | "既定（番号）";
type ProcessStepsStoryArgs = ProcessStepsProps & {
  firstIcon: IconChoice;
  secondIcon: IconChoice;
  thirdIcon: IconChoice;
};
const iconOptions = ["既定（番号）", ...sequenceIconNames];

function ProcessStepsExample({ firstIcon, secondIcon, thirdIcon, ...args }: ProcessStepsStoryArgs) {
  const icons = [firstIcon, secondIcon, thirdIcon];
  return (
    <ProcessSteps
      {...args}
      items={args.items.map((item, index) => {
        const icon = icons[index];
        return icon ? { ...item, icon: icon === "既定（番号）" ? undefined : icon } : item;
      })}
    />
  );
}

const meta = {
  title: "Components/ProcessSteps",
  component: ProcessSteps,
  args: {
    current: 1,
    currentTint: "neutral",
    firstIcon: "edit",
    secondIcon: "search",
    thirdIcon: "flag",
    items: [
      { id: "input", label: "入力", statusLabel: "入力済み", icon: "edit" },
      { id: "check", label: "内容の確認", statusLabel: "確認中", icon: "search" },
      { id: "result", label: "受付結果", icon: "flag" },
    ],
  },
  argTypes: {
    currentTint: { control: "inline-radio", options: ["neutral", "info"] },
    firstIcon: {
      name: "1番目のアイコン",
      control: "select",
      options: iconOptions,
    },
    secondIcon: {
      name: "2番目のアイコン",
      control: "select",
      options: iconOptions,
    },
    thirdIcon: {
      name: "3番目のアイコン",
      control: "select",
      options: iconOptions,
    },
    items: { control: false },
  },
  parameters: {
    notes:
      "各段階のiconはcircle/edit/upload/search/check/undo/clock/flagから選びます。Controlsでは3段階それぞれのアイコンを変更できます。「既定（番号）」はiconを省略した表示です。段階が完了しても、意味を表すアイコンは変更しません。現在位置は背景・太字・読み上げで示し、状態名を残します。",
  },
  render: (args) => <ProcessStepsExample {...args} />,
} satisfies Meta<ProcessStepsStoryArgs>;
export default meta;
type Story = StoryObj<typeof meta>;
export const CurrentStep: Story = {};
export const FirstStep: Story = {
  args: {
    current: 0,
    items: [
      { label: "入力", statusLabel: "入力中", icon: "edit" },
      { label: "内容の確認", icon: "search" },
      { label: "受付結果", icon: "flag" },
    ],
  },
};
export const Completed: Story = {
  args: {
    current: 3,
    items: [
      { label: "入力", statusLabel: "入力済み", icon: "edit" },
      { label: "内容の確認", statusLabel: "確認済み", icon: "search" },
      { label: "受付結果", statusLabel: "受付済み", icon: "flag" },
    ],
  },
};
export const ActionRequired: Story = {
  args: {
    current: 1,
    items: [
      { label: "入力", status: "complete", statusLabel: "入力済み", icon: "edit" },
      {
        label: "内容の確認",
        status: "current",
        statusLabel: "要修正",
        tone: "warning",
        icon: "search",
        description: "添付資料に日付を追記してください。",
      },
      { label: "受付結果", status: "upcoming", icon: "flag" },
    ],
  },
};
export const ExtendedDeadline: Story = {
  args: {
    current: 0,
    firstIcon: "upload",
    items: [
      {
        label: "提出",
        icon: "upload",
        statusLabel: "提出待ち",
        metadata: "提出期限：10月20日 17:00（延長済み・日本時間）",
      },
      { label: "確認", icon: "search" },
      { label: "結果", icon: "flag" },
    ],
  },
};
export const CurrentBackgroundComparison: Story = {
  render: (args) => (
    <View style={{ gap: 24 }}>
      <Text>既定は中立色です。状態を表す色と、現在位置の強調を分けます。</Text>
      <View style={{ gap: 12 }}>
        <Text variant="heading">中立色（既定）</Text>
        <ProcessStepsExample {...args} currentTint="neutral" />
      </View>
      <View style={{ gap: 12 }}>
        <Text variant="heading">情報色</Text>
        <ProcessStepsExample {...args} currentTint="info" />
      </View>
    </View>
  ),
};
function DeadlineDataFailureExample(args: ProcessStepsStoryArgs) {
  const [loaded, setLoaded] = useState(false);
  return (
    <View style={{ gap: 24 }}>
      <Text variant="title">進行状況</Text>
      {loaded ? (
        <ProcessStepsExample
          {...args}
          current={0}
          items={[
            {
              label: "提出",
              icon: "upload",
              statusLabel: "提出待ち",
              metadata: "提出期限：10月20日 17:00（延長済み・日本時間）",
            },
            { label: "確認", icon: "search" },
            { label: "結果", icon: "flag" },
          ]}
        />
      ) : (
        <Notice title="この画面を表示できません" tone="danger">
          <Text>期限の情報を取得できませんでした。再度読み込んでください。</Text>
          <Button title="再読み込み" variant="outline" onPress={() => setLoaded(true)} />
        </Notice>
      )}
    </View>
  );
}
export const MissingDeadlineData: Story = {
  args: { firstIcon: "upload" },
  render: (args) => <DeadlineDataFailureExample {...args} />,
};
export const Dark: Story = { parameters: { nativeTheme: "dark" } };

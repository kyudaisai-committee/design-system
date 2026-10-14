import type { Meta, StoryObj } from "@storybook/react-vite";

import { ArrowDownToLine, ArrowRight, Plus, Search } from "lucide-react";
import { expect, fn, userEvent, within } from "storybook/test";

import { Button, buttonVariants } from "./button";

const meta = {
  title: "Components/Button",
  component: Button,
  args: {
    children: "変更を保存",
    variant: "default",
    size: "default",
    disabled: false,
    pending: false,
    onClick: fn(),
  },
  argTypes: {
    children: {
      control: "text",
      description: "操作の結果が分かる名前。アイコンのみの場合は aria-label を指定する。",
    },
    variant: {
      control: "select",
      options: ["default", "outline", "secondary", "ghost", "destructive", "link"],
      description:
        "操作の優先度と影響に応じた表示。主な操作はdefault、削除など影響のある操作はdestructive。",
      table: { defaultValue: { summary: "default" } },
    },
    size: {
      control: "select",
      options: ["default", "xs", "sm", "lg", "icon", "icon-xs", "icon-sm", "icon-lg"],
      description:
        "標準の高さは44px。一覧などで小さいサイズを使う場合は、隣のボタンを押し間違えない間隔を確保する。",
      table: { defaultValue: { summary: "default" } },
    },
    disabled: {
      control: "boolean",
      description: "操作を無効にする。利用できない理由は近くの文面で示す。",
    },
    pending: {
      control: "boolean",
      description: "aria-busy を付けて操作を無効にする。処理内容は children で示す。",
    },
    onClick: {
      control: false,
      description: "クリック、Enter、Space による操作を受け取る。",
    },
    render: {
      control: false,
      description:
        "描画する要素や部品を指定する。ページへの移動にはbuttonVariantsを適用したa要素を使う。",
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "保存・提出・削除などの処理を実行します。「変更を保存」のように、操作の結果が分かる名前を付けてください。ページへの移動にはリンクを使います。\n\n主な操作は`default`、補助操作は`outline`や`ghost`、削除など影響のある操作は`destructive`で表示します。処理中は`pending`を指定し、ボタンの文言も「保存中…」などに変更してください。",
      },
    },
  },
} satisfies Meta<typeof Button>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "基本",
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole("button", {
      name: "変更を保存",
    });
    button.focus();
    await userEvent.keyboard("{Enter}");
    await expect(args.onClick).toHaveBeenCalledOnce();
    await userEvent.keyboard(" ");
    await expect(args.onClick).toHaveBeenCalledTimes(2);
  },
};

export const Variants: Story = {
  name: "優先度",
  render: () => (
    <div className="ds-row">
      <Button>変更を保存</Button>
      <Button variant="outline">キャンセル</Button>
      <Button variant="secondary">下書きを保存</Button>
      <Button variant="ghost">詳細を表示</Button>
      <Button variant="destructive">企画を削除</Button>
      <Button variant="link">条件をリセット</Button>
    </div>
  ),
};

export const Sizes: Story = {
  name: "サイズ",
  render: () => (
    <div className="flex flex-wrap items-end gap-6">
      {(["xs", "sm", "default", "lg"] as const).map((size) => (
        <div key={size} className="grid justify-items-start gap-2">
          <span className="text-sm text-muted-foreground">{size}</span>
          <Button size={size}>変更を保存</Button>
        </div>
      ))}
    </div>
  ),
};

export const WithIcon: Story = {
  name: "アイコン付き",
  render: () => (
    <div className="ds-row">
      <Button>
        <Plus aria-hidden="true" data-icon="inline-start" />
        申請を作成
      </Button>
      <Button variant="outline">
        <ArrowDownToLine aria-hidden="true" data-icon="inline-start" />
        控えを保存
      </Button>
      <Button variant="secondary">
        内容を確認
        <ArrowRight aria-hidden="true" data-icon="inline-end" />
      </Button>
    </div>
  ),
};

export const IconOnly: Story = {
  name: "アイコンのみ",
  render: () => (
    <div className="flex flex-wrap items-end gap-6">
      {(["icon-xs", "icon-sm", "icon", "icon-lg"] as const).map((size) => (
        <div key={size} className="grid justify-items-start gap-2">
          <span className="text-sm text-muted-foreground">{size}</span>
          <Button size={size} variant="outline" aria-label="申請を検索">
            <Search aria-hidden="true" />
          </Button>
        </div>
      ))}
    </div>
  ),
};

export const Disabled: Story = {
  name: "無効",
  args: { children: "受付期間外", disabled: true },
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole("button", {
      name: "受付期間外",
    });
    await expect(button).toBeDisabled();
    await expect(Number(getComputedStyle(button).opacity)).toBeLessThan(1);
  },
};

export const StateClassName: Story = {
  name: "状態に応じたスタイル",
  args: {
    disabled: true,
    children: "受付期間外",
    className: fn((state: { disabled: boolean }) => (state.disabled ? "border-dashed" : undefined)),
  },
  play: async ({ args }) => {
    await expect(args.className).toHaveBeenCalledWith(expect.objectContaining({ disabled: true }));
  },
};
export const Pending: Story = {
  name: "処理中",
  args: { children: "変更を保存中…", pending: true },
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole("button", {
      name: "変更を保存中…",
    });
    await expect(button).toBeDisabled();
    await expect(button).toHaveAttribute("aria-busy", "true");
    await userEvent.tab();
    await expect(button).not.toHaveFocus();
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

export const LongLabel: Story = {
  name: "狭い領域の長い操作名",
  render: () => (
    <div style={{ width: 256, maxWidth: "100%" }}>
      <Button style={{ fontSize: "1.75rem" }}>入力した内容を確認して申請書を提出する</Button>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole("button");
    await expect(button.getBoundingClientRect().width).toBeLessThanOrEqual(
      button.parentElement!.getBoundingClientRect().width,
    );
    await expect(button.scrollWidth).toBeLessThanOrEqual(button.clientWidth);
    await expect(button.scrollHeight).toBeLessThanOrEqual(button.clientHeight);
  },
};

export const AsLink: Story = {
  name: "リンク",
  args: {
    children: "提出内容へ",
    variant: "outline",
  },
  render: (args) => (
    <div className="ds-stack">
      <a href="#submission" className={buttonVariants({ variant: args.variant, size: args.size })}>
        {args.children}
      </a>
      <section id="submission" tabIndex={-1}>
        <h2>提出内容</h2>
        <p>企画申請書・会場使用申請書</p>
      </section>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "リンクをボタンと同じ見た目で表示する例です。buttonVariantsをa要素に適用します。",
      },
    },
  },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("link", { name: "提出内容へ" })).toHaveAttribute(
      "href",
      "#submission",
    );
  },
};

export const PrimaryLink: Story = {
  ...AsLink,
  name: "主要なリンク",
  args: { ...AsLink.args, variant: "default" },
  parameters: {
    docs: {
      description: {
        story: "主要な移動先を、主な操作と同じ見た目で示す例です。",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole("link", {
      name: "提出内容へ",
    });
    const style = getComputedStyle(link);
    const canvas = canvasElement.ownerDocument.createElement("canvas");
    canvas.width = canvas.height = 1;
    const context = canvas.getContext("2d")!;
    const luminance = (color: string) => {
      context.fillStyle = color;
      context.fillRect(0, 0, 1, 1);
      const channels = Array.from(context.getImageData(0, 0, 1, 1).data)
        .slice(0, 3)
        .map((channel) => {
          const value = channel / 255;
          return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
        });
      return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
    };
    const foreground = luminance(style.color);
    const background = luminance(style.backgroundColor);
    await expect(
      (Math.max(foreground, background) + 0.05) / (Math.min(foreground, background) + 0.05),
    ).toBeGreaterThanOrEqual(4.5);
  },
};

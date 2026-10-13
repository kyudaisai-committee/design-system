import { useState, type ComponentProps } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import {
  Building2,
  CalendarDays,
  ClipboardList,
  Inbox,
  PanelsTopLeft,
} from "lucide-react";
import { Field } from "./compositions";
import { Input } from "./input";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "./sidebar";

const navigationGroups = [
  {
    label: "企画運営",
    items: [
      { id: "applications", title: "申請", icon: ClipboardList },
      { id: "messages", title: "連絡", icon: Inbox },
    ],
  },
  {
    label: "当日",
    items: [{ id: "event", title: "当日の案内", icon: CalendarDays }],
  },
] as const;
type NavigationItem = (typeof navigationGroups)[number]["items"][number];
const pages = navigationGroups.flatMap<NavigationItem>((group) => group.items);
type Page = (typeof pages)[number]["id"] | "settings";

function DemoContent({
  initialPage = "applications",
  longLabels = false,
  loading = false,
  ...props
}: ComponentProps<typeof Sidebar> & {
  initialPage?: Page;
  longLabels?: boolean;
  loading?: boolean;
}) {
  const [page, setPage] = useState<Page>(initialPage);
  const [projectName, setProjectName] = useState("九大カフェ");
  const { setOpenMobile, isMobile } = useSidebar();
  const select = (next: Page) => {
    setPage(next);
    setOpenMobile(false);
  };
  const title =
    page === "settings"
      ? "団体設定"
      : pages.find((item) => item.id === page)!.title;
  return (
    <>
      <Sidebar {...props}>
        <SidebarHeader className="px-4 py-5 group-data-[collapsible=icon]:px-2">
          <div className="flex min-h-11 items-center gap-3">
            <PanelsTopLeft
              className="size-5 shrink-0 group-data-[collapsible=icon]:mx-3"
              aria-hidden="true"
            />
            <div className="min-w-0 group-data-[collapsible=icon]:sr-only">
              <p className="font-semibold">九大祭 システム</p>
              <p className="mt-1 text-xs text-muted-foreground">企画団体</p>
            </div>
          </div>
        </SidebarHeader>
        <SidebarSeparator />
        <SidebarContent>
          {loading ? (
            <div
              role="status"
              aria-label="メニューを読み込んでいます"
              className="p-2"
            >
              <span className="sr-only">メニューを読み込んでいます</span>
              {[1, 2, 3].map((item) => (
                <SidebarMenuSkeleton key={item} showIcon aria-hidden="true" />
              ))}
            </div>
          ) : (
            <nav aria-label="企画団体のメニュー" className="space-y-3">
              {navigationGroups.map((group) => (
                <SidebarGroup
                  key={group.label}
                  role="group"
                  aria-label={group.label}
                >
                  <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {group.items.map(({ id, title: name, icon: Icon }) => {
                        const label =
                          longLabels && id === "event"
                            ? "会場への搬入・搬出と当日の受付について"
                            : name;
                        return (
                          <SidebarMenuItem key={id}>
                            <SidebarMenuButton
                              isActive={page === id}
                              tooltip={label}
                              onClick={() => select(id)}
                            >
                              <Icon aria-hidden="true" />
                              <span>{label}</span>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        );
                      })}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              ))}
            </nav>
          )}
        </SidebarContent>
        <SidebarSeparator />
        <SidebarFooter>
          <SidebarGroup role="group" aria-label="管理" className="p-0">
            <SidebarGroupLabel>管理</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={page === "settings"}
                    tooltip="団体設定"
                    onClick={() => select("settings")}
                  >
                    <Building2 aria-hidden="true" />
                    <span>
                      {longLabels
                        ? "九州大学の研究を体験する科学実験企画の団体設定"
                        : "団体設定"}
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex min-h-16 items-center gap-3 border-b px-4">
          {(props.collapsible !== "none" || isMobile) && <SidebarTrigger />}
          <p className="min-w-0 truncate text-sm text-muted-foreground">
            九大カフェ
          </p>
        </header>
        <div className="grid max-w-2xl gap-5 p-5 sm:p-8">
          <h1>{title}</h1>
          {page === "applications" && (
            <>
              <p>企画申請書の修正をお願いします。</p>
              <dl className="grid gap-3 text-sm">
                <div className="flex flex-wrap gap-x-4">
                  <dt className="text-muted-foreground">再提出期限</dt>
                  <dd>
                    <time dateTime="2026-10-20T17:00:00+09:00">
                      10月20日 17:00
                    </time>
                  </dd>
                </div>
                <div className="flex flex-wrap gap-x-4">
                  <dt className="text-muted-foreground">修正内容</dt>
                  <dd>配置図に避難経路を追記してください。</dd>
                </div>
              </dl>
            </>
          )}
          {page === "messages" && (
            <>
              <h2>搬入日時の確認</h2>
              <p>
                搬入は10月30日
                14:00〜16:00です。会場の受付で企画番号をお伝えください。
              </p>
            </>
          )}
          {page === "event" && (
            <>
              <h2>当日の集合場所</h2>
              <p>10月31日 8:30にセンター2号館の1階ロビーへ集合してください。</p>
            </>
          )}
          {page === "settings" && (
            <Field label="企画名">
              {(controlProps) => (
                <Input
                  {...controlProps}
                  value={projectName}
                  onChange={(event) => setProjectName(event.target.value)}
                />
              )}
            </Field>
          )}
        </div>
      </SidebarInset>
    </>
  );
}

function SidebarDemo({
  defaultOpen = true,
  ...props
}: ComponentProps<typeof DemoContent> & { defaultOpen?: boolean }) {
  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <DemoContent {...props} />
    </SidebarProvider>
  );
}

const source = `import { useState } from "react";
import { Building2, CalendarDays, ClipboardList, Inbox } from "lucide-react";
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarFooter,
  SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarSeparator,
  SidebarMenu, SidebarMenuItem, SidebarMenuButton,
  SidebarInset, SidebarTrigger, useSidebar } from "@kyudaisai/ui";

const groups = [
  { label: "企画運営", items: [
    { title: "申請", icon: ClipboardList },
    { title: "連絡", icon: Inbox },
  ] },
  { label: "当日", items: [{ title: "当日の案内", icon: CalendarDays }] },
];

export function NavigationExample() {
  return <SidebarProvider><NavigationContent /></SidebarProvider>;
}

function NavigationContent() {
  const [page, setPage] = useState("申請");
  const { setOpenMobile } = useSidebar();
  const selectPage = (next: string) => {
    setPage(next);
    setOpenMobile(false);
  };
  return (
    <>
      <Sidebar collapsible="icon">
        <SidebarHeader>九大祭 システム</SidebarHeader>
        <SidebarContent>
          <nav aria-label="主なメニュー" className="space-y-3">
            {groups.map(group => (
              <SidebarGroup key={group.label} role="group" aria-label={group.label}>
                <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {group.items.map(({title, icon: Icon}) => (
                      <SidebarMenuItem key={title}>
                        <SidebarMenuButton isActive={page === title} tooltip={title} onClick={() => selectPage(title)}>
                          <Icon aria-hidden="true" /><span>{title}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}
          </nav>
        </SidebarContent>
        <SidebarSeparator />
        <SidebarFooter>
          <SidebarGroup role="group" aria-label="管理" className="p-0">
            <SidebarGroupLabel>管理</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton isActive={page === "団体設定"} tooltip="団体設定" onClick={() => selectPage("団体設定")}>
                    <Building2 aria-hidden="true" /><span>団体設定</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header><SidebarTrigger /></header>
        <h1>{page}</h1>
      </SidebarInset>
    </>
  );
}`;

const meta = {
  title: "Components/Sidebar",
  component: Sidebar,
  subcomponents: {
    SidebarProvider,
    SidebarHeader,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarInset,
    SidebarTrigger,
  },
  args: {
    side: "left",
    variant: "sidebar",
    collapsible: "icon",
    label: "主なメニュー",
  },
  argTypes: {
    side: { control: "inline-radio", options: ["left", "right"] },
    variant: {
      control: "inline-radio",
      options: ["sidebar", "inset", "floating"],
    },
    collapsible: {
      control: "inline-radio",
      options: ["icon", "offcanvas", "none"],
      description: "広い画面での表示方法。iconはアイコンのみ、offcanvasは全体を隠し、noneは常に表示します。",
    },
    label: {
      control: "text",
      description: "スマートフォンで開くメニューの読み上げ名。",
    },
    children: { control: false },
  },
  parameters: {
    layout: "fullscreen",
    docs: {
      story: { inline: false, height: "560px" },
      source: { language: "tsx", code: source },
      description: {
        component:
          "複数の画面で共通する主要ナビゲーションです。関連する項目をグループにまとめ、現在のページを明示します。\n\nSidebarProviderで全体を囲み、本文をSidebarInsetに配置します。項目はSidebarGroupでまとめ、SidebarGroupLabelに見出しを書きます。現在地は`isActive`で指定してください。\n\n広い画面ではアイコンだけの表示にも切り替えられます。幅48rem未満では、ボタンで開閉するメニューになります。",
      },
    },
  },
  render: (args) => <SidebarDemo {...args} />,
} satisfies Meta<typeof Sidebar>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "基本",
  parameters: { docs: { story: { inline: true } } },
  decorators: [
    (Story, context) =>
      context.viewMode === "docs" ? (
        <div className="relative isolate h-[560px] overflow-hidden [transform:translateZ(0)] [&_[data-slot=sidebar-wrapper]]:h-full [&_[data-slot=sidebar-wrapper]]:min-h-full [&_[data-slot=sidebar-container]]:absolute [&_[data-slot=sidebar-container]]:h-full [&_[data-slot=sidebar-inset]]:overflow-auto">
          <Story />
        </div>
      ) : (
        <Story />
      ),
  ],
};
export const Collapsed: Story = {
  name: "アイコン表示",
  render: (args) => <SidebarDemo {...args} defaultOpen={false} />,
};
export const Offcanvas: Story = {
  name: "全体を隠す",
  args: { collapsible: "offcanvas" },
};
export const AlwaysExpanded: Story = {
  name: "PCでは常時表示",
  args: { collapsible: "none" },
};
export const Inset: Story = {
  name: "本文を区切る",
  args: { variant: "inset" },
};
export const Floating: Story = {
  name: "余白を付ける",
  args: { variant: "floating" },
};
export const Right: Story = { name: "右側", args: { side: "right" } };
export const LongLabels: Story = {
  name: "長い日本語",
  render: (args) => <SidebarDemo {...args} longLabels />,
};
export const Loading: Story = {
  name: "メニューの読み込み",
  render: (args) => <SidebarDemo {...args} loading />,
};

export const Keyboard: Story = {
  name: "キーボードと狭い画面",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const mobile =
      canvasElement.ownerDocument.defaultView!.matchMedia(
        "(width < 48rem)",
      ).matches;
    const trigger = canvas.getByRole("button", {
      name: mobile ? "メニューを開く" : "サイドバーを折りたたむ",
    });
    trigger.focus();
    await userEvent.keyboard("{Enter}");
    if (mobile) {
      const dialog = await body.findByRole("dialog", { name: "主なメニュー" });
      await expect(
        within(dialog).getByRole("button", { name: "申請" }),
      ).toHaveAttribute("aria-current", "page");
      within(dialog).getByRole("button", { name: "団体設定" }).focus();
      await new Promise((resolve) => setTimeout(resolve, 650));
      await userEvent.keyboard("{Escape}");
      await waitFor(() =>
        expect(body.queryByRole("dialog")).not.toBeInTheDocument(),
      );
      await expect(trigger).toHaveFocus();
    } else {
      await expect(trigger).toHaveAttribute("aria-expanded", "false");
      await userEvent.keyboard("{Enter}");
      await expect(trigger).toHaveAttribute("aria-expanded", "true");
      await userEvent.click(canvas.getByRole("button", { name: "連絡" }));
      await expect(
        canvas.getByRole("heading", { name: "連絡", level: 1 }),
      ).toBeVisible();
      await expect(
        canvas.getByRole("button", { name: "連絡" }),
      ).toHaveAttribute("aria-current", "page");
      await expect(
        canvas.getByRole("button", { name: "申請" }),
      ).not.toHaveAttribute("aria-current");
    }
  },
};

export const ShortcutDuringInput: Story = {
  name: "入力中のショートカット",
  render: (args) => <SidebarDemo {...args} initialPage="settings" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox", { name: "企画名" });
    const trigger = canvas.getByRole("button", {
      name: /サイドバーを折りたたむ|メニューを開く/,
    });
    const before = trigger.getAttribute("aria-expanded");
    await userEvent.click(input);
    await userEvent.keyboard("{Meta>}b{/Meta}");
    await expect(input).toHaveFocus();
    await expect(trigger).toHaveAttribute("aria-expanded", before);
    trigger.focus();
    await userEvent.keyboard("{Meta>}b{/Meta}");
    await expect(trigger).toHaveAttribute(
      "aria-expanded",
      before === "true" ? "false" : "true",
    );
  },
};

const onOpenChange = fn();
export const ProviderNotification: Story = {
  name: "開閉の通知",
  render: (args) => (
    <SidebarProvider onOpenChange={onOpenChange}>
      <DemoContent {...args} />
    </SidebarProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    if (
      canvasElement.ownerDocument.defaultView!.matchMedia("(width < 48rem)")
        .matches
    )
      return;
    const trigger = canvas.getByRole("button", {
      name: "サイドバーを折りたたむ",
    });
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(onOpenChange).toHaveBeenLastCalledWith(false);
  },
};

const onDisabledClick = fn();
export const DisabledItems: Story = {
  name: "無効な項目",
  render: (args) => (
    <SidebarProvider>
      <Sidebar {...args}>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton disabled onClick={onDisabledClick}>
                申請（受付前）
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                disabled
                tooltip="受付前です"
                onClick={onDisabledClick}
              >
                物品申込（受付前）
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>連絡を確認</SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <SidebarTrigger />
      </SidebarInset>
    </SidebarProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    let menu = canvas;
    if (
      canvasElement.ownerDocument.defaultView!.matchMedia("(width < 48rem)")
        .matches
    ) {
      await userEvent.click(
        canvas.getByRole("button", { name: "メニューを開く" }),
      );
      menu = within(
        await within(canvasElement.ownerDocument.body).findByRole("dialog", {
          name: "主なメニュー",
        }),
      );
    }
    onDisabledClick.mockClear();
    for (const name of ["申請（受付前）", "物品申込（受付前）"]) {
      const button = menu.getByRole("button", { name });
      await expect(button).toBeDisabled();
      button.click();
      button.focus();
      await expect(button).not.toHaveFocus();
    }
    await expect(onDisabledClick).not.toHaveBeenCalled();
  },
};

import { useRef, useState } from "react";
import applicationShellCode from "./application-shell.stories.tsx?raw";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import {
  Building2,
  CalendarDays,
  ClipboardList,
  Inbox,
  PanelsTopLeft,
} from "lucide-react";
import { Button } from "./button";
import {
  EmptyState,
  Field,
  Notice,
  StatusBadge,
  type Tone,
} from "./compositions";
import { Input } from "./input";
import { NativeSelect, NativeSelectOption } from "./native-select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";
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
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "./sidebar";

const applications = [
  {
    id: "plan",
    name: "企画申請書",
    status: "要修正",
    tone: "warning" as Tone,
    deadline: "10月20日 17:00",
    dateTime: "2026-10-20T17:00:00+09:00",
    description: "会場配置図に避難経路を追記してください。",
  },
  {
    id: "equipment",
    name: "使用設備申請書",
    status: "下書き",
    tone: undefined,
    deadline: "10月22日 17:00",
    dateTime: "2026-10-22T17:00:00+09:00",
    description: "机・椅子・電源の使用数を申請する書類です。",
  },
  {
    id: "pamphlet",
    name: "パンフレット掲載情報",
    status: "提出済み",
    tone: undefined,
    deadline: "10月15日 17:00",
    dateTime: "2026-10-15T17:00:00+09:00",
    description: "掲載する企画名と紹介文を受け付けました。",
  },
];
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
const navigation = navigationGroups.flatMap<NavigationItem>(
  (group) => group.items,
);
type Page = (typeof navigation)[number]["id"] | "settings";

function ShellContent({ groupName }: { groupName: string }) {
  const [page, setPage] = useState<Page>("applications");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("すべて");
  const [selected, setSelected] = useState<
    (typeof applications)[number] | null
  >(null);
  const [projectName, setProjectName] = useState("九大カフェ");
  const [saved, setSaved] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const { isMobile, setOpenMobile } = useSidebar();
  const selectPage = (next: Page) => {
    setPage(next);
    setSelected(null);
    setOpenMobile(false);
    if (!isMobile) requestAnimationFrame(() => headingRef.current?.focus());
  };
  const focusHeading = () =>
    requestAnimationFrame(() => headingRef.current?.focus());
  const filtered = applications.filter(
    (application) =>
      application.name.includes(query) &&
      (status === "すべて" || application.status === status),
  );
  const title =
    selected?.name ??
    (page === "settings"
      ? "団体設定"
      : navigation.find((item) => item.id === page)!.title);
  return (
    <>
      <Sidebar collapsible="icon">
        <SidebarHeader className="px-4 py-5 group-data-[collapsible=icon]:px-2">
          <div className="flex min-h-11 items-center gap-3">
            <PanelsTopLeft
              className="size-5 shrink-0 group-data-[collapsible=icon]:mx-3"
              aria-hidden="true"
            />
            <div className="min-w-0 group-data-[collapsible=icon]:sr-only">
              <p className="font-semibold">九大祭 システム</p>
              <p className="mt-1 break-words text-xs text-muted-foreground">
                {groupName}
              </p>
            </div>
          </div>
        </SidebarHeader>
        <SidebarSeparator />
        <SidebarContent>
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
                    {group.items.map(({ id, title: name, icon: Icon }) => (
                      <SidebarMenuItem key={id}>
                        <SidebarMenuButton
                          isActive={page === id}
                          tooltip={name}
                          aria-label={
                            id === "messages" ? "連絡（未読2件）" : name
                          }
                          className={id === "messages" ? "pr-10" : undefined}
                          onClick={() => selectPage(id)}
                        >
                          <Icon aria-hidden="true" />
                          <span>{name}</span>
                        </SidebarMenuButton>
                        {id === "messages" && (
                          <SidebarMenuBadge aria-hidden="true">
                            2
                          </SidebarMenuBadge>
                        )}
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
                  <SidebarMenuButton
                    isActive={page === "settings"}
                    tooltip="団体設定"
                    onClick={() => selectPage("settings")}
                  >
                    <Building2 aria-hidden="true" />
                    <span>団体設定</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex min-h-16 items-center gap-3 border-b px-4 sm:px-6">
          <SidebarTrigger />
          <span className="h-5 border-l" aria-hidden="true" />
          <p className="min-w-0 truncate text-sm">{projectName}</p>
          <p className="ml-auto shrink-0 text-xs text-muted-foreground">
            企画団体
          </p>
        </header>
        <div className="grid w-full max-w-6xl gap-6 p-4 sm:p-8">
          <div className="grid gap-3">
            {selected && (
              <div>
                <Button
                  variant="link"
                  className="px-0"
                  onClick={() => {
                    setSelected(null);
                    focusHeading();
                  }}
                >
                  申請一覧へ戻る
                </Button>
              </div>
            )}
            <h1 ref={headingRef} tabIndex={-1}>
              {title}
            </h1>
          </div>
          {page === "applications" && !selected && (
            <>
              <div className="grid items-end gap-4 sm:grid-cols-[minmax(12rem,1fr)_12rem]">
                <Field label="申請名で検索">
                  {(props) => (
                    <Input
                      {...props}
                      type="search"
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                    />
                  )}
                </Field>
                <Field label="提出状況">
                  {(props) => (
                    <NativeSelect
                      {...props}
                      value={status}
                      onChange={(event) => setStatus(event.target.value)}
                    >
                      {["すべて", "下書き", "要修正", "提出済み"].map(
                        (value) => (
                          <NativeSelectOption key={value}>
                            {value}
                          </NativeSelectOption>
                        ),
                      )}
                    </NativeSelect>
                  )}
                </Field>
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-sm" role="status">
                  {filtered.length}件の申請
                </p>
                <p className="text-xs text-muted-foreground">日時は日本時間</p>
              </div>
              {filtered.length ? (
                <>
                  <div className="hidden sm:block">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>申請名</TableHead>
                          <TableHead>状態</TableHead>
                          <TableHead>期限</TableHead>
                          <TableHead>
                            <span className="sr-only">操作</span>
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filtered.map((application) => (
                          <TableRow key={application.id}>
                            <TableCell className="font-medium">
                              {application.name}
                            </TableCell>
                            <TableCell>
                              <StatusBadge tone={application.tone}>
                                {application.status}
                              </StatusBadge>
                            </TableCell>
                            <TableCell>
                              <time
                                className="whitespace-nowrap tabular-nums"
                                dateTime={application.dateTime}
                              >
                                {application.deadline}
                              </time>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                aria-label={`${application.name}の内容を確認`}
                                onClick={() => {
                                  setSelected(application);
                                  focusHeading();
                                }}
                              >
                                内容を確認
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <ul className="divide-y border-y sm:hidden">
                    {filtered.map((application) => (
                      <li key={application.id} className="grid gap-3 py-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <h2 className="text-base!">{application.name}</h2>
                          <StatusBadge tone={application.tone}>
                            {application.status}
                          </StatusBadge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          期限{" "}
                          <time
                            className="tabular-nums"
                            dateTime={application.dateTime}
                          >
                            {application.deadline}
                          </time>
                        </p>
                        <div>
                          <Button
                            variant="outline"
                            aria-label={`${application.name}の内容を確認`}
                            onClick={() => {
                              setSelected(application);
                              focusHeading();
                            }}
                          >
                            内容を確認
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <EmptyState title="条件に合う申請がありません">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setQuery("");
                      setStatus("すべて");
                    }}
                  >
                    検索条件をクリア
                  </Button>
                </EmptyState>
              )}
            </>
          )}
          {selected && (
            <section className="grid max-w-2xl gap-6">
              <div>
                <StatusBadge tone={selected.tone}>
                  {selected.status}
                </StatusBadge>
              </div>
              <dl className="grid gap-2">
                <dt className="text-sm text-muted-foreground">提出期限</dt>
                <dd>
                  <time dateTime={selected.dateTime}>
                    {selected.deadline}（日本時間）
                  </time>
                </dd>
              </dl>
              {selected.status === "要修正" ? (
                <Notice title="再提出をお願いします" tone="warning">
                  {selected.description}
                </Notice>
              ) : (
                <p>{selected.description}</p>
              )}
            </section>
          )}
          {page === "messages" && (
            <div className="max-w-3xl divide-y border-y">
              <article className="grid gap-2 py-5">
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <h2>搬入日時の確認</h2>
                  <time
                    className="text-sm text-muted-foreground"
                    dateTime="2026-10-12"
                  >
                    10月12日
                  </time>
                </div>
                <p>
                  搬入は10月30日
                  14:00〜16:00です。会場の受付で企画番号をお伝えください。
                </p>
              </article>
              <article className="grid gap-2 py-5">
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <h2>会場配置図の修正について</h2>
                  <time
                    className="text-sm text-muted-foreground"
                    dateTime="2026-10-10"
                  >
                    10月10日
                  </time>
                </div>
                <p>
                  来場者の避難経路が分かるよう、配置図に矢印を追記してください。
                </p>
              </article>
            </div>
          )}
          {page === "event" && (
            <section className="grid max-w-2xl gap-6">
              <h2>集合と受付</h2>
              <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-4">
                <dt className="text-muted-foreground">集合日時</dt>
                <dd>
                  <time dateTime="2026-10-31T08:30:00+09:00">
                    10月31日 8:30
                  </time>
                </dd>
                <dt className="text-muted-foreground">集合場所</dt>
                <dd>センター2号館 1階ロビー</dd>
                <dt className="text-muted-foreground">持ち物</dt>
                <dd>企画番号の控え、学生証</dd>
              </dl>
            </section>
          )}
          {page === "settings" && (
            <form
              className="grid max-w-xl gap-6"
              onSubmit={(event) => {
                event.preventDefault();
                setSaved(true);
              }}
            >
              <Field label="企画名" required>
                {(props) => (
                  <Input
                    {...props}
                    value={projectName}
                    onChange={(event) => {
                      setProjectName(event.target.value);
                      setSaved(false);
                    }}
                  />
                )}
              </Field>
              <Field label="所属団体">
                {(props) => <Input {...props} value={groupName} readOnly />}
              </Field>
              <div>
                <Button type="submit">変更を保存</Button>
              </div>
              <p role="status">{saved ? "企画名を保存しました。" : ""}</p>
            </form>
          )}
        </div>
      </SidebarInset>
    </>
  );
}

function ApplicationShell({
  defaultOpen = true,
  groupName = "喫茶研究会",
}: {
  defaultOpen?: boolean;
  groupName?: string;
}) {
  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <ShellContent groupName={groupName} />
    </SidebarProvider>
  );
}

const meta = {
  title: "Patterns/ApplicationShell",
  component: ApplicationShell,
  args: { defaultOpen: true, groupName: "喫茶研究会" },
  argTypes: {
    defaultOpen: { control: false, description: "広い画面での初回表示時の開閉状態。" },
    groupName: { control: "text", description: "利用中の団体名。" },
  },
  parameters: {
    layout: "fullscreen",
    docs: {
      story: { inline: false, height: "600px" },
      source: {
        language: "tsx",
        code:
          `import { useRef, useState } from "react";
import { Building2, CalendarDays, ClipboardList, Inbox, PanelsTopLeft } from "lucide-react";
import { Button, EmptyState, Field, Notice, StatusBadge, type Tone, Input,
  NativeSelect, NativeSelectOption, Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow, Sidebar, SidebarContent, SidebarFooter, SidebarGroup,
  SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarInset, SidebarMenu,
  SidebarMenuBadge, SidebarMenuButton, SidebarMenuItem, SidebarProvider,
  SidebarSeparator, SidebarTrigger, useSidebar } from "@kyudaisai/ui";

` +
          applicationShellCode
            .slice(
              applicationShellCode.indexOf("const applications ="),
              applicationShellCode.indexOf("\nconst meta ="),
            )
            .replace(
              "function ApplicationShell(",
              "export function ApplicationShell(",
            ),
      },
      description: {
        component:
          "サイドバーと本文を組み合わせた画面構成の例です。ここでは企画団体向けの申請・連絡・当日の案内・団体設定を表示しています。\n\n狭い画面ではサイドバーを開閉式のメニューにし、一覧の各項目を縦に並べます。ナビゲーション項目は、利用するサービスに合わせて設定してください。",
      },
    },
  },
} satisfies Meta<typeof ApplicationShell>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "企画団体の申請一覧",
  parameters: { docs: { story: { inline: true } } },
  decorators: [
    (Story, context) =>
      context.viewMode === "docs" ? (
        <div className="relative isolate h-[600px] overflow-hidden [transform:translateZ(0)] [&_[data-slot=sidebar-wrapper]]:h-full [&_[data-slot=sidebar-wrapper]]:min-h-full [&_[data-slot=sidebar-container]]:absolute [&_[data-slot=sidebar-container]]:h-full [&_[data-slot=sidebar-inset]]:overflow-auto">
          <Story />
        </div>
      ) : (
        <Story />
      ),
  ],
};
export const Collapsed: Story = {
  name: "サイドバーを縮小",
  args: { defaultOpen: false },
};
export const LongGroupName: Story = {
  name: "長い団体名",
  args: {
    groupName: "九州大学の研究を体験する科学実験とワークショップ実行チーム",
  },
};
export const Navigation: Story = {
  name: "移動と一覧の操作",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const mobile =
      canvasElement.ownerDocument.defaultView!.matchMedia(
        "(width < 48rem)",
      ).matches;
    await userEvent.type(
      canvas.getByRole("searchbox", { name: "申請名で検索" }),
      "企画",
    );
    await expect(canvas.getByRole("status")).toHaveTextContent("1件の申請");
    if (mobile)
      await userEvent.click(
        canvas.getByRole("button", { name: "メニューを開く" }),
      );
    await userEvent.click(
      body.getByRole("button", { name: "連絡（未読2件）" }),
    );
    await expect(
      canvas.getByRole("heading", { name: "連絡", level: 1 }),
    ).toBeVisible();
    if (mobile) {
      await waitFor(() =>
        expect(body.queryByRole("dialog")).not.toBeInTheDocument(),
      );
      await userEvent.click(
        canvas.getByRole("button", { name: "メニューを開く" }),
      );
    }
    await userEvent.click(body.getByRole("button", { name: "申請" }));
    if (mobile)
      await waitFor(() =>
        expect(body.queryByRole("dialog")).not.toBeInTheDocument(),
      );
    await expect(canvas.getByRole("searchbox")).toHaveValue("企画");
    await userEvent.click(
      canvas.getByRole("button", { name: "企画申請書の内容を確認" }),
    );
    await expect(
      canvas.getByRole("heading", { name: "企画申請書", level: 1 }),
    ).toBeVisible();
    await userEvent.click(
      canvas.getByRole("button", { name: "申請一覧へ戻る" }),
    );
    await expect(canvas.getByRole("searchbox")).toHaveValue("企画");
    await userEvent.clear(canvas.getByRole("searchbox"));
    await expect(canvas.getByRole("status")).toHaveTextContent("3件の申請");
  },
};

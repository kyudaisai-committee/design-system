import { useState, type ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  ArrowUpRight,
  Check,
  ChevronDown,
  CircleHelp,
  FileText,
  ListFilter,
  Send,
} from "lucide-react";
import { expect, userEvent, within } from "storybook/test";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  Alert,
  AlertTitle,
  Badge,
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbPage,
  Button,
  Card,
  CardContent,
  Checkbox,
  DateDetails,
  Field,
  Input,
  Label,
  LabeledCheckbox,
  NativeSelect,
  Notice,
  StatusBadge,
  ContentCard,
  LoadingState,
  EmptyState,
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  ProcessSteps,
  Progress,
  ProgressLabel,
  ProgressValue,
  RadioGroup,
  RadioGroupItem,
  Separator,
  Skeleton,
  Switch,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Tabs,
  TabsList,
  TabsTrigger,
  Textarea,
  Timeline,
} from "../index";

type CatalogEntry = { name: string; purpose: string; preview: ReactNode };
type CatalogGroup = { title: string; items: CatalogEntry[] };

const groups: CatalogGroup[] = [
  {
    title: "操作・移動",
    items: [
      {
        name: "Button",
        purpose: "保存・提出などの操作",
        preview: <Button>下書きを保存</Button>,
      },
      {
        name: "Breadcrumb",
        purpose: "上位の画面へ戻る経路",
        preview: (
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>申請</BreadcrumbItem>
              <span aria-hidden>/</span>
              <BreadcrumbItem>
                <BreadcrumbPage>企画情報</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        ),
      },
      {
        name: "Pagination",
        purpose: "一覧をページごとに移動",
        preview: (
          <Pagination>
            <PaginationContent>
              {[1, 2, 3].map((n) => (
                <PaginationItem key={n}>
                  <PaginationLink isActive={n === 1}>{n}</PaginationLink>
                </PaginationItem>
              ))}
            </PaginationContent>
          </Pagination>
        ),
      },
      {
        name: "Sidebar",
        purpose: "画面をまたぐ主要ナビゲーション",
        preview: (
          <div className="grid grid-cols-[6rem_1fr] gap-4">
            <div className="grid gap-1 border-r border-sidebar-border pr-3 text-xs">
              <strong>九大祭</strong>
              <span className="text-[10px] text-muted-foreground">
                企画運営
              </span>
              <span className="bg-sidebar-accent px-2 py-1 font-medium">
                申請
              </span>
              <span className="px-2">連絡</span>
              <span className="mt-2 text-[10px] text-muted-foreground">
                当日
              </span>
              <span className="px-2">当日の案内</span>
              <span className="mt-2 text-[10px] text-muted-foreground">
                管理
              </span>
              <span className="px-2">団体設定</span>
            </div>
            <div className="grid content-start gap-2 pt-1">
              <span className="h-2 w-4/5 bg-muted" />
              <span className="h-2 bg-muted" />
            </div>
          </div>
        ),
      },
      {
        name: "Tabs",
        purpose: "同じ画面内の表示を切り替え",
        preview: (
          <Tabs defaultValue="submitted">
            <TabsList variant="line">
              <TabsTrigger value="submitted">提出済み</TabsTrigger>
              <TabsTrigger value="draft">下書き</TabsTrigger>
            </TabsList>
          </Tabs>
        ),
      },
      {
        name: "DropdownMenu",
        purpose: "対象に対する操作の一覧",
        preview: (
          <Button variant="outline">
            操作
            <ChevronDown aria-hidden />
          </Button>
        ),
      },
    ],
  },
  {
    title: "入力・選択",
    items: [
      {
        name: "Input",
        purpose: "企画名・メールなどの一行入力",
        preview: <Input value="九大カフェ" readOnly aria-label="企画名" />,
      },
      {
        name: "Textarea",
        purpose: "紹介文などの複数行入力",
        preview: (
          <Textarea
            value="秋のキャンパスで、ひと休み。"
            readOnly
            aria-label="企画紹介"
          />
        ),
      },
      {
        name: "Checkbox",
        purpose: "複数選択や内容の確認",
        preview: (
          <div className="ds-row">
            <Checkbox checked aria-label="掲載内容を確認" readOnly />
            <span>内容を確認しました</span>
          </div>
        ),
      },
      {
        name: "RadioGroup",
        purpose: "並べた選択肢から一つ選ぶ",
        preview: (
          <RadioGroup value="tent" aria-label="出店場所">
            <div className="ds-row">
              <RadioGroupItem value="tent" aria-label="屋外" />
              <span>屋外</span>
            </div>
            <div className="ds-row">
              <RadioGroupItem value="room" aria-label="教室" />
              <span>教室</span>
            </div>
          </RadioGroup>
        ),
      },
      {
        name: "Switch",
        purpose: "設定をその場で切り替え",
        preview: (
          <div className="ds-row">
            <Switch checked aria-label="通知を受け取る" readOnly />
            <span>通知を受け取る</span>
          </div>
        ),
      },
      {
        name: "NativeSelect",
        purpose: "OSの選択メニューを開く",
        preview: (
          <NativeSelect aria-label="企画区分" defaultValue="模擬店">
            <option>模擬店</option>
            <option>展示</option>
          </NativeSelect>
        ),
      },
      {
        name: "Label",
        purpose: "入力項目の名前",
        preview: (
          <Label>
            企画名<span>（必須）</span>
          </Label>
        ),
      },
      {
        name: "Field",
        purpose: "ラベル・補足・エラーをまとめる",
        preview: (
          <Field label="企画名" required>
            {(props) => <Input {...props} placeholder="例：九大カフェ" />}
          </Field>
        ),
      },
      {
        name: "LabeledCheckbox",
        purpose: "文章と押せる領域を持つ確認欄",
        preview: (
          <LabeledCheckbox checked readOnly>
            掲載内容を確認しました
          </LabeledCheckbox>
        ),
      },
    ],
  },
  {
    title: "情報・状態",
    items: [
      {
        name: "Badge",
        purpose: "短い分類やラベル",
        preview: (
          <div className="ds-row">
            <Badge>模擬店</Badge>
            <Badge variant="outline">第79回</Badge>
          </div>
        ),
      },
      {
        name: "StatusBadge",
        purpose: "意味に対応する色と状態名",
        preview: (
          <div className="ds-row">
            <StatusBadge>審査中</StatusBadge>
            <StatusBadge tone="warning">要修正</StatusBadge>
          </div>
        ),
      },
      {
        name: "Alert",
        purpose: "画面内に残すメッセージ",
        preview: (
          <Alert>
            <CircleHelp aria-hidden />
            <AlertTitle>締切は10月20日です</AlertTitle>
          </Alert>
        ),
      },
      {
        name: "Notice",
        purpose: "案内・完了・注意・失敗",
        preview: <Notice title="企画情報を提出しました" tone="success" />,
      },
      {
        name: "Card",
        purpose: "見出しや操作を含む情報のまとまり",
        preview: (
          <Card>
            <CardContent>
              企画情報
              <Badge variant="secondary" className="ml-2">
                提出済み
              </Badge>
            </CardContent>
          </Card>
        ),
      },
      {
        name: "ContentCard",
        purpose: "余白を持つ本文領域",
        preview: (
          <ContentCard>
            <strong>星空写真展</strong>
            <p className="ds-hint">センター1号館</p>
          </ContentCard>
        ),
      },
      {
        name: "Table",
        purpose: "同じ項目で複数の対象を比較",
        preview: (
          <Table>
            <TableBody>
              <TableRow>
                <TableCell>九大カフェ</TableCell>
                <TableCell>審査中</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>星空写真展</TableCell>
                <TableCell>承認済み</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        ),
      },
      {
        name: "Progress",
        purpose: "量を測れる処理の進捗",
        preview: (
          <Progress value={65}>
            <ProgressLabel>ファイルを送信中</ProgressLabel>
            <ProgressValue />
          </Progress>
        ),
      },
      {
        name: "Skeleton",
        purpose: "読み込み後の形を示す",
        preview: (
          <div className="ds-stack">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4" />
          </div>
        ),
      },
      {
        name: "LoadingState",
        purpose: "読み込み中を伝える領域",
        preview: <LoadingState label="企画一覧を読み込み中" />,
      },
      {
        name: "EmptyState",
        purpose: "情報がないときの次の操作",
        preview: <EmptyState title="申請はまだありません" />,
      },
      {
        name: "DateDetails",
        purpose: "締切・予定・実績の日付",
        preview: (
          <DateDetails
            items={[
              {
                id: "deadline",
                label: "提出締切",
                value: "10月20日 17:00",
                emphasis: true,
              },
              { id: "submitted", label: "提出日", value: "10月12日" },
            ]}
          />
        ),
      },
      {
        name: "Separator",
        purpose: "異なる情報群の区切り",
        preview: (
          <div className="ds-stack">
            <span>企画情報</span>
            <Separator />
            <span>連絡先</span>
          </div>
        ),
      },
    ],
  },
  {
    title: "開閉・補足",
    items: [
      {
        name: "Accordion",
        purpose: "関連する詳細を折りたたむ",
        preview: (
          <Accordion>
            <AccordionItem value="help">
              <AccordionTrigger>提出後に変更できますか</AccordionTrigger>
            </AccordionItem>
          </Accordion>
        ),
      },
      {
        name: "Dialog",
        purpose: "画面を離れず短い作業を行う",
        preview: <Button variant="outline">連絡先を編集</Button>,
      },
      {
        name: "AlertDialog",
        purpose: "重要な判断の前に確認",
        preview: <Button variant="destructive">申請を取り消す</Button>,
      },
      {
        name: "ConfirmDialog",
        purpose: "確認後の処理と再試行",
        preview: (
          <Button>
            企画情報を提出
            <Send aria-hidden />
          </Button>
        ),
      },
      {
        name: "Sheet",
        purpose: "画面端に補助作業のパネルを開く",
        preview: (
          <Button variant="outline">
            <ListFilter aria-hidden />
            絞り込み
          </Button>
        ),
      },
      {
        name: "Tooltip",
        purpose: "アイコンなどへの短い補足",
        preview: (
          <Button variant="ghost" size="icon" aria-label="締切について">
            <CircleHelp aria-hidden />
          </Button>
        ),
      },
    ],
  },
  {
    title: "進行・履歴",
    items: [
      {
        name: "ProcessSteps",
        purpose: "手続きがどこまで進んだかを示す",
        preview: (
          <ProcessSteps
            label="申請の進行"
            orientation="vertical"
            steps={[
              {
                id: "input",
                title: "入力",
                status: "complete",
                icon: FileText,
              },
              { id: "review", title: "審査", status: "current", icon: Check },
            ]}
          />
        ),
      },
      {
        name: "Timeline",
        purpose: "出来事を日時とともに読む",
        preview: (
          <Timeline
            label="申請の履歴"
            events={[
              {
                id: "submit",
                title: "企画情報を提出",
                icon: Send,
                timestamp: {
                  dateTime: "2026-10-12T10:30:00+09:00",
                  label: "10月12日 10:30",
                },
              },
            ]}
          />
        ),
      },
    ],
  },
];

function ComponentCatalog() {
  const [query, setQuery] = useState("");
  const normalized = query.trim().toLocaleLowerCase();
  const filtered = groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) =>
        `${item.name} ${item.purpose} ${group.title}`
          .toLocaleLowerCase()
          .includes(normalized),
      ),
    }))
    .filter((group) => group.items.length);
  const count = filtered.reduce((sum, group) => sum + group.items.length, 0);
  return (
    <main className="sb-catalog">
      <header className="sb-catalog-header">
        <h1>コンポーネント一覧</h1>
        <p>
          九大祭のシステムに共通する部品です。用途から選び、表示・操作・使い方を確認できます。
        </p>
        <nav className="sb-catalog-links" aria-label="設計資料">
          <a href="/system/DESIGN/" target="_top">
            デザイン指針
          </a>
          <a href="./?path=/story/foundations-colors--palette" target="_top">
            色・文字・余白
          </a>
          <a
            href="./?path=/story/patterns-applicationform--default"
            target="_top"
          >
            画面の構成例
          </a>
        </nav>
      </header>
      <div className="sb-catalog-search">
        <label htmlFor="component-search">
          コンポーネントを探す
          <Input
            id="component-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="名前・用途で検索"
          />
        </label>
        <p role="status">{count}コンポーネント</p>
      </div>
      {filtered.map((group) => (
        <section className="sb-catalog-section" key={group.title}>
          <h2>{group.title}</h2>
          <div className="sb-catalog-grid">
            {group.items.map((item) => (
              <article key={item.name} className="sb-catalog-item">
                <div className="sb-catalog-preview" aria-hidden="true" inert>
                  {item.preview}
                </div>
                <a
                  className="sb-catalog-label"
                  href={`./?path=/docs/components-${item.name.toLowerCase()}--docs`}
                  target="_top"
                >
                  {item.name}
                  <ArrowUpRight size={16} aria-hidden />
                </a>
                <p>{item.purpose}</p>
              </article>
            ))}
          </div>
        </section>
      ))}
      {count === 0 && (
        <EmptyState title="該当するコンポーネントがありません">
          <p>別の名前や用途で検索してください。</p>
          <Button variant="outline" onClick={() => setQuery("")}>
            検索を解除
          </Button>
        </EmptyState>
      )}
    </main>
  );
}

const meta = {
  title: "Overview/Component Catalog",
  component: ComponentCatalog,
  tags: ["!autodocs"],
  parameters: { layout: "fullscreen", controls: { disable: true } },
} satisfies Meta<typeof ComponentCatalog>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Browse: Story = { name: "コンポーネント一覧" };
export const Search: Story = {
  name: "検索",
  tags: ["!dev"],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole("searchbox"), "button");
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "1コンポーネント",
    );
    await expect(canvas.getByRole("link", { name: "Button" })).toHaveAttribute(
      "href",
      "./?path=/docs/components-button--docs",
    );
    await userEvent.clear(canvas.getByRole("searchbox"));
    await userEvent.type(canvas.getByRole("searchbox"), "存在しない部品");
    await expect(
      canvas.getByRole("heading", {
        name: "該当するコンポーネントがありません",
      }),
    ).toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: "検索を解除" }));
    await expect(
      canvas.getByRole("link", { name: "Timeline" }),
    ).toBeInTheDocument();
  },
};

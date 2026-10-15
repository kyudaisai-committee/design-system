import { useRef, useState } from "react";

import sample from "../../../../apps/storybook-native/assets/crop-sample.png";
import {
  AssignmentBoard,
  Button,
  ComparisonView,
  ConditionEditor,
  ConversationLayout,
  ConversationList,
  FormBuilder,
  ImageGallery,
  MapEditor,
  MapView,
  MarkdownContent,
  MessageComposer,
  MessageList,
  PhotoPicker,
  PublicImage,
  QrScanner,
  ResultChart,
  ThreadPanel,
  type BoardItem,
  type BuilderField,
  type ConditionGroup,
  type ImageAsset,
  type MapPoint,
} from "../index";
export type ExampleProps = {
  disabled?: boolean;
  empty?: boolean;
  failed?: boolean;
  loading?: boolean;
};
export const source =
  "## 当日のご案内\n\n受付は **10時** からです。[案内を開く](https://example.com/guide)\n\n- 会場を確認\n- 資料を準備\n\n> 雨天時は案内を確認してください。\n\n| 場所 | 時間 |\n| --- | --- |\n| 中央広場 | 10:00 |\n\n```text\n受付番号を確認してください\n```\n\n![切り抜き範囲の見本](sample)";
const image: ImageAsset = {
  id: "sample",
  src: sample,
  alt: "切り抜き範囲の見本",
  width: 1600,
  height: 1200,
};
const initialPoints: MapPoint[] = [
  { id: "plaza", label: "中央広場", x: 30, y: 40, description: "本部前・10時開始" },
  { id: "hall", label: "講堂", x: 75, y: 65, description: "北側入口" },
];
const initialFields: BuilderField[] = [
  { id: "title", label: "企画名", kind: "text", required: true, max: 100 },
];
export function MarkdownExample() {
  return <MarkdownContent source={source} resolveImage={() => image} />;
}
export function ImageExample({ failed, loading }: ExampleProps) {
  return (
    <PublicImage
      asset={{ ...image, state: loading ? "loading" : failed ? "error" : "ready" }}
      onRetry={() => {}}
    />
  );
}
export function GalleryExample({ empty }: ExampleProps) {
  return (
    <ImageGallery
      label="共有された写真"
      assets={
        empty ? [] : [image, { id: "ended", alt: "閲覧期間が終了した写真", state: "unavailable" }]
      }
      scopeLabel="団体の担当者に共有"
    />
  );
}
export function MapExample({ empty }: ExampleProps) {
  const [id, setId] = useState<string>();
  return (
    <MapView
      label="会場の地図"
      points={empty ? [] : initialPoints}
      selectedId={id}
      onSelect={(point) => setId(point.id)}
      updatedLabel="10月15日 09:00更新"
    />
  );
}
export function MapEditingExample({ disabled, empty }: ExampleProps) {
  const [points, setPoints] = useState(empty ? [] : initialPoints);
  const id = useRef(0);
  return (
    <MapEditor
      label="配置を編集"
      points={points}
      onChange={setPoints}
      createId={() => `point-${++id.current}`}
      disabled={disabled}
    />
  );
}
export function ChartExample({ empty, failed }: ExampleProps) {
  return (
    <ResultChart
      label="公開された結果"
      unit="票"
      data={
        empty
          ? []
          : [
              { id: "a", label: "九大カフェ", rank: 1, value: failed ? NaN : 120 },
              { id: "b", label: "工学展示", rank: 2, value: 90 },
            ]
      }
      note="公開された順位と値を表示しています。"
    />
  );
}
export function ConversationExample({ empty }: ExampleProps) {
  const [view, setView] = useState<"list" | "conversation" | "thread">("list");
  const [followed, setFollowed] = useState(false);
  const parent = {
    id: "first",
    author: "運営担当",
    context: "会場担当",
    time: "10月15日 09:00",
    body: "受付の場所を確認してください。",
    replyCount: 1,
  };
  return (
    <ConversationLayout
      view={view}
      toolbar={
        <Button type="button" variant="outline" onClick={() => setView("list")}>
          会話一覧へ戻る
        </Button>
      }
      list={
        <ConversationList
          selectedId={view === "list" ? undefined : "main"}
          items={
            empty
              ? []
              : [
                  {
                    id: "main",
                    title: "当日の連絡",
                    kind: "企画の会話",
                    excerpt: parent.body,
                    updatedAt: parent.time,
                    unreadCount: 2,
                    mentionCount: 1,
                  },
                ]
          }
          hrefFor={() => "#conversation"}
          onSelect={() => setView("conversation")}
          showPreview
        />
      }
      conversation={
        <MessageList
          messages={empty ? [] : [parent]}
          renderBody={(body) => <p>{body}</p>}
          onReply={() => setView("thread")}
          firstUnreadId="first"
        />
      }
      thread={
        view === "thread" ? (
          <ThreadPanel
            parent={parent}
            renderBody={(body) => <p>{body}</p>}
            onClose={() => setView("conversation")}
            followed={followed}
            onFollowChange={setFollowed}
          >
            <p>入口を確認しました。</p>
          </ThreadPanel>
        ) : undefined
      }
    />
  );
}
export function ComposerExample({ disabled, failed, loading }: ExampleProps) {
  const [text, setText] = useState("受付の場所を確認しました。");
  const [sent, setSent] = useState(false);
  return (
    <MessageComposer
      target="当日の連絡"
      value={text}
      onValueChange={setText}
      disabled={disabled}
      state={loading ? "sending" : failed ? "failed" : sent ? "sent" : "idle"}
      onSubmit={() => setSent(true)}
      attachments={[{ id: "photo", name: "会場写真.jpg", status: "検査中" }]}
    />
  );
}
export function ScannerExample({ disabled }: ExampleProps) {
  return <QrScanner label="受付のQRコード" disabled={disabled} onRead={() => {}} />;
}
export function BuilderExample({ disabled, empty }: ExampleProps) {
  const [fields, setFields] = useState(empty ? [] : initialFields);
  const id = useRef(0);
  return (
    <FormBuilder
      value={fields}
      onChange={setFields}
      createId={() => `field-${++id.current}`}
      disabled={disabled}
    />
  );
}
export function ConditionExample({ disabled, empty }: ExampleProps) {
  const [value, setValue] = useState<ConditionGroup>({
    id: "root",
    type: "group",
    operator: "and",
    children: empty
      ? []
      : [{ id: "rule", type: "rule", field: "kind", operator: "equals", value: "展示" }],
  });
  const id = useRef(0);
  return (
    <ConditionEditor
      value={value}
      fields={[{ id: "kind", label: "企画種別" }]}
      onChange={setValue}
      createId={() => `condition-${++id.current}`}
      disabled={disabled}
    />
  );
}
export function ComparisonExample({ empty }: ExampleProps) {
  return (
    <ComparisonView
      label="提出内容の比較"
      beforeLabel="前の提出版"
      afterLabel="現在の提出版"
      items={
        empty
          ? []
          : [
              { id: "name", label: "企画名", before: "九大カフェ", after: "九大カフェ・展示" },
              { id: "date", label: "実施日", before: "10月15日", after: "10月15日" },
            ]
      }
    />
  );
}
export function BoardExample({ disabled, empty }: ExampleProps) {
  const [items, setItems] = useState<BoardItem[]>(
    empty
      ? []
      : [
          { id: "a", label: "受付担当A", laneId: "morning", locked: true },
          {
            id: "b",
            label: "受付担当B",
            laneId: "afternoon",
            conflict: "同時間帯に別の担当があります",
          },
        ],
  );
  return (
    <AssignmentBoard
      label="受付の勤務配置"
      lanes={[
        { id: "morning", label: "午前の受付", capacity: 2 },
        { id: "afternoon", label: "午後の受付", capacity: 1 },
      ]}
      items={items}
      disabled={disabled}
      onMove={(id, laneId) =>
        setItems((current) => current.map((item) => (item.id === id ? { ...item, laneId } : item)))
      }
      onLockChange={(id, locked) =>
        setItems((current) => current.map((item) => (item.id === id ? { ...item, locked } : item)))
      }
    />
  );
}
export function PhotoExample({ disabled }: ExampleProps) {
  const [name, setName] = useState("");
  return (
    <div className="ds-stack">
      <PhotoPicker
        label="掲載する写真"
        disabled={disabled}
        onPick={(photo) => setName(photo.fileName ?? "選択した写真")}
      />
      {name && <p>{name}</p>}
    </div>
  );
}

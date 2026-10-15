import {
  AssignmentBoard,
  ConditionEditor,
  FormBuilder,
  ImageGallery,
  MarkdownContent,
  MessageComposer,
  PhotoPicker,
  PublicImage,
  QrScanner,
  ResultChart,
  type BuilderField,
} from "@kyudaisai/ui-native";
import { act, fireEvent, render, screen } from "@testing-library/react-native";
import * as ImagePicker from "expo-image-picker";
import { AppState, View } from "react-native";

import {
  cloneField,
  safeLink,
  parseMarkdown,
  viewportChange,
} from "../../../packages/ui-models/src";
let mockPermission = { granted: true, canAskAgain: true };
const mockRequestPermission = jest.fn(async () => mockPermission);
jest.mock("expo-camera", () => ({
  CameraView: "CameraView",
  useCameraPermissions: () => [mockPermission, mockRequestPermission],
}));
jest.mock("expo-image-picker", () => ({ launchImageLibraryAsync: jest.fn() }));
beforeEach(() => {
  jest.clearAllMocks();
  mockPermission = { granted: true, canAskAgain: true };
  Object.defineProperty(AppState, "currentState", {
    configurable: true,
    value: "active",
    writable: true,
  });
});
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((next) => {
    resolve = next;
  });
  return { promise, resolve };
}
test("unsafe URL schemes and protocol-relative URLs never become links", () => {
  for (const url of [
    "javascript:alert(1)",
    "data:text/html,x",
    "//example.com",
    "https://name:password@example.com",
    "https://example.com/\\x",
    "java\nscript:alert(1)",
  ])
    expect(safeLink(url)).toBeUndefined();
  expect(safeLink("/guide")).toBe("/guide");
  expect(
    parseMarkdown("# 案内\n\n| 場所 | 時間 |\n| --- | --- |\n| 広場 | 10時 |").children.some(
      (node) => node.type === "table",
    ),
  ).toBe(true);
  render(<MarkdownContent source="受付は **10時** からです。[危険](javascript:alert(1))" />);
  expect(screen.getByText("受付は 10時 からです。危険")).toBeTruthy();
  expect(screen.queryByRole("link")).toBeNull();
});
test("cloning a nested form remaps sibling conditions while keeping external references", () => {
  let id = 0;
  const field: BuilderField = {
    id: "group",
    kind: "group",
    label: "繰り返し",
    children: [
      { id: "a", kind: "text", label: "条件元" },
      {
        id: "b",
        kind: "text",
        label: "条件先",
        condition: {
          id: "g",
          type: "group",
          operator: "and",
          children: [
            { id: "r", type: "rule", field: "a", operator: "equals", value: "はい" },
            { id: "external", type: "rule", field: "outside", operator: "equals", value: "はい" },
          ],
        },
      },
    ],
  };
  const copy = cloneField(field, () => `copy-${++id}`);
  const rules = copy.children![1].condition!.children;
  expect(rules[0]).toMatchObject({ field: copy.children![0].id });
  expect(rules[1]).toMatchObject({ field: "outside" });
  expect(field.children![1].condition!.children[0]).toMatchObject({ field: "a" });
});
test("image expiry and unavailable galleries suppress the photo and its private description", () => {
  render(
    <View>
      <PublicImage
        asset={{
          id: "a",
          src: "https://example.com/a.jpg",
          alt: "非公開の説明",
          caption: "機密の注記",
          expiresAt: Date.now() - 1,
        }}
      />
      <ImageGallery
        label="写真"
        assets={[{ id: "b", alt: "非公開写真の名前", state: "unavailable" }]}
      />
    </View>,
  );
  expect(screen.queryByLabelText("非公開の説明")).toBeNull();
  expect(screen.queryByText("機密の注記")).toBeNull();
  expect(screen.queryByRole("button", { name: /を拡大/ })).toBeNull();
});
test("chart retains supplied rankings, exact decimals and zero values", () => {
  render(
    <ResultChart
      label="結果"
      unit="点"
      data={[
        { id: "a", label: "同点A", value: 0, rank: 2 },
        { id: "b", label: "同点B", value: 0.123456, rank: 1 },
      ]}
    />,
  );
  expect(screen.getByText("2位・同点A：0点")).toBeTruthy();
  expect(screen.getByText("1位・同点B：0.123456点")).toBeTruthy();
});
test("result-unknown composer preserves input and prevents new submissions", () => {
  const send = jest.fn();
  render(
    <MessageComposer
      target="会場"
      value="保持する本文"
      onValueChange={() => {}}
      onSubmit={send}
      state="unknown"
    />,
  );
  expect(screen.getByDisplayValue("保持する本文")).toBeTruthy();
  fireEvent.press(screen.getByRole("button", { name: "送信" }));
  expect(send).not.toHaveBeenCalled();
});
test("required enum selectors cannot clear a form kind or condition operator", async () => {
  render(
    <FormBuilder
      value={[{ id: "a", label: "名前", kind: "text" }]}
      createId={() => "new"}
      onChange={() => {}}
    />,
  );
  fireEvent.press(screen.getByLabelText(/^入力の種類、短文/));
  await act(async () => {});
  expect(screen.queryByText("選択をクリア")).toBeNull();
});
test("disabled condition changes and fixed board moves stay disabled", async () => {
  const change = jest.fn();
  const move = jest.fn();
  render(
    <View>
      <ConditionEditor
        value={{ id: "c", type: "group", operator: "and", children: [] }}
        fields={[]}
        createId={() => "new"}
        onChange={change}
        disabled
      />
      <AssignmentBoard
        label="勤務"
        lanes={[{ id: "__unassigned", label: "通常の枠", capacity: 2 }]}
        items={[{ id: "a", label: "担当", laneId: "__unassigned", locked: true }]}
        onMove={move}
      />
    </View>,
  );
  fireEvent.press(screen.getByRole("button", { name: "条件を追加" }));
  await act(async () => {});
  expect(change).not.toHaveBeenCalled();
  expect(screen.getByText("担当（固定）")).toBeTruthy();
  expect(screen.getByText("1人・1人不足")).toBeTruthy();
  expect(screen.getByLabelText(/^担当の配置先、通常の枠/)).toBeDisabled();
});
test("map view changes clamp pan/zoom to the canvas", () => {
  let view = { x: 0, y: 0, size: 100 };
  for (let index = 0; index < 20; index++) view = viewportChange(view, "in");
  expect(view.size).toBe(12);
  for (let index = 0; index < 100; index++) view = viewportChange(view, "right");
  expect(view.x).toBe(88);
  expect(viewportChange(view, "reset")).toEqual({ x: 0, y: 0, size: 100 });
});
test("system photo editing is cancellable, single-select and does not request broad library access", async () => {
  const pick = jest.fn();
  jest
    .mocked(ImagePicker.launchImageLibraryAsync)
    .mockResolvedValue({ canceled: true, assets: null });
  render(<PhotoPicker label="写真" onPick={pick} />);
  fireEvent.press(screen.getByRole("button", { name: "写真を選んで切り抜く" }));
  await act(async () => {});
  expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalledWith(
    expect.objectContaining({
      allowsEditing: true,
      allowsMultipleSelection: false,
      exif: false,
      mediaTypes: ["images"],
    }),
  );
  expect(pick).not.toHaveBeenCalled();
});
test("a pending system picker cannot hand a photo to a newly disabled form", async () => {
  const selection = deferred<ImagePicker.ImagePickerResult>();
  const pick = jest.fn();
  jest.mocked(ImagePicker.launchImageLibraryAsync).mockReturnValue(selection.promise);
  const { rerender } = render(<PhotoPicker label="写真" onPick={pick} />);
  fireEvent.press(screen.getByRole("button", { name: "写真を選んで切り抜く" }));
  rerender(<PhotoPicker label="写真" onPick={pick} disabled />);
  await act(async () => {
    selection.resolve({
      canceled: false,
      assets: [{ uri: "file://picked.jpg", width: 100, height: 100 }],
    });
  });
  expect(pick).not.toHaveBeenCalled();
});
test("scanner serializes reads, hides credentials, and becomes usable after an interrupted pending read", async () => {
  const read = deferred<void>();
  const onRead = jest.fn(() => read.promise);
  const { rerender } = render(<QrScanner label="受付" onRead={onRead} />);
  fireEvent.press(screen.getByRole("button", { name: "カメラを開始" }));
  await act(async () => {});
  const camera = screen.UNSAFE_getByType("CameraView" as never);
  await act(async () => {
    camera.props.onBarcodeScanned({ data: "secret-ticket" });
    camera.props.onBarcodeScanned({ data: "secret-ticket" });
  });
  expect(onRead).toHaveBeenCalledTimes(1);
  expect(screen.queryByText("secret-ticket")).toBeNull();
  expect(screen.getByRole("button", { name: "カメラを開始" })).toBeDisabled();
  rerender(<QrScanner label="受付" onRead={onRead} active={false} />);
  await act(async () => {
    read.resolve();
  });
  rerender(<QrScanner label="受付" onRead={onRead} />);
  expect(screen.getByRole("button", { name: "カメラを開始" })).not.toBeDisabled();
});

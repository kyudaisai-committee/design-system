import type { Meta, StoryObj } from "@storybook/react-vite";

import { useState } from "react";
import { expect, userEvent, within, fn, waitFor } from "storybook/test";

import { QrCode, type QrCodeProps } from "./qr-code";
import sample from "./qr-code-sample.png";

const meta = {
  title: "Components/QrCode",
  component: QrCode,
  args: {
    src: sample,
    title: "九大祭公式サイト",
    label: "九大祭公式サイトを開くQRコード",
    description: "スマートフォンのカメラで読み取ってください。",
    variant: "card",
    state: "ready",
  },
  argTypes: {
    title: {
      control: "text",
      description:
        "任意の見出し。QRコードの用途を示します。周囲の画面で用途が分かる場合は省略できます。",
    },
    description: {
      control: "text",
      description: "任意の案内文。誰に見せるか、どう使うかを示します。差し替え・省略できます。",
    },
    label: {
      control: "text",
      description: "必須の読み上げ名。画面に表示する文章とは別に、画像の目的を伝えます。",
    },
    variant: { control: "select", options: ["plain", "card", "compact"] },
    state: { control: "select", options: ["ready", "loading", "error", "unavailable"] },
    details: { control: false },
    actions: { control: false },
    onRetry: { control: false },
  },
  parameters: {
    docs: {
      description: {
        component:
          "生成済みのQRコード画像を、対象・補足と一緒に表示します。基本は提示カード（card）です。上部のtitleは用途の見出し、descriptionは提示方法の案内で、どちらも任意の文言に差し替え・省略できます。周囲で目的や方法が分かる場合は、上部の文章を付けません。labelは画像の読み上げ名として必須です。plainは既存画面への組み込み、compactはURL共有の補助的な配置です。コードの生成、期限や受付結果の判定は利用側で行います。画像は白地に黒、周囲4セル以上の余白を含めてください。暗色テーマでも画像の色を反転しません。操作はreadyのときだけ表示します。見本はすべて https://kyudaisai.jp/ を開き、受付には使えません。",
      },
    },
  },
} satisfies Meta<typeof QrCode>;
export default meta;
type Story = StoryObj<typeof meta>;

const link = (
  <a className="underline underline-offset-4" href="https://kyudaisai.jp/">
    公式サイトを開く
  </a>
);

const receptionDetails = (
  <div className="ds-qr-example-details">
    <strong>九大カフェ</strong>
    <p className="ds-hint">受付番号 K-080</p>
    <p className="ds-hint">10月31日 10:00〜10:30</p>
  </div>
);

export const Default: Story = {
  name: "提示カード（上部の文章なし）",
  args: { title: undefined, description: undefined, details: receptionDetails },
  render: (args) => (
    <div className="ds-stack">
      <QrCode {...args} />
      <p className="ds-hint">見本です。画像は公式サイトを開き、実際の受付には使えません。</p>
    </div>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("group", { name: args.label })).toBeInTheDocument();
    await expect(canvas.queryByRole("heading")).not.toBeInTheDocument();
    await expect(canvas.getByRole("img", { name: args.label })).toBeInTheDocument();
  },
};
export const HeaderContent: Story = {
  name: "上部の文章の役割",
  render: (args) => (
    <div className="ds-qr-comparison">
      <header className="ds-qr-comparison-intro">
        <h2>提示カードの上部の文章</h2>
        <p className="ds-hint">見出しと案内文は任意です。用途に合わせて差し替え・省略します。</p>
        <p className="ds-hint">見本の画像は公式サイトを開き、実際の受付には使えません。</p>
      </header>
      <article className="ds-stack">
        <div>
          <h3>文章なし</h3>
          <p className="ds-hint">周囲の画面で、提示する目的と方法が分かる場合。</p>
        </div>
        <QrCode
          {...args}
          variant="card"
          title={undefined}
          description={undefined}
          details={receptionDetails}
        />
      </article>
      <article className="ds-stack">
        <div>
          <h3>見出しと案内文</h3>
          <p className="ds-hint">用途と、誰に何を見せるかをカード内で伝える場合。</p>
        </div>
        <QrCode
          {...args}
          variant="card"
          title="受付用QRコード"
          description="受付スタッフに、この画面をお見せください。"
          details={receptionDetails}
        />
      </article>
      <article className="ds-stack">
        <div>
          <h3>見出しのみ</h3>
          <p className="ds-hint">用途だけを示せば伝わる場合。</p>
        </div>
        <QrCode
          {...args}
          variant="card"
          title="受付用QRコード"
          description={undefined}
          details={receptionDetails}
        />
      </article>
    </div>
  ),
};
export const Plain: Story = { name: "標準表示", args: { variant: "plain" } };
export const Compact: Story = {
  name: "横型の共有",
  args: { variant: "compact", actions: link, details: <p className="ds-hint">kyudaisai.jp</p> },
};

export const Comparison: Story = {
  name: "3つの表示形式を比較",
  render: (args) => (
    <div className="ds-qr-comparison">
      <header className="ds-qr-comparison-intro">
        <h2>QRコードの見せ方</h2>
        <p className="ds-hint">同じコードを、使う場面に合わせて配置します。</p>
      </header>
      <article className="ds-stack">
        <div>
          <h3>標準表示</h3>
          <p className="ds-hint">既存の本文や案内に組み込む。</p>
        </div>
        <QrCode {...args} variant="plain" details={<p className="ds-hint">kyudaisai.jp</p>} />
      </article>
      <article className="ds-stack">
        <div>
          <h3>提示カード</h3>
          <p className="ds-hint">対象と日時を添え、受付で見せる。</p>
        </div>
        <QrCode
          {...args}
          variant="card"
          title="受付で提示するコード"
          description="見本です。実際の受付には使えません。"
          label="公式サイトを開く見本のQRコード"
          details={
            <div className="ds-qr-example-details">
              <strong>九大カフェ</strong>
              <p className="ds-hint">受付番号 K-080</p>
              <p className="ds-hint">10月31日 10:00〜10:30</p>
            </div>
          }
        />
      </article>
      <article className="ds-stack ds-qr-comparison-wide">
        <div>
          <h3>横型の共有</h3>
          <p className="ds-hint">URLとQRコードを並べ、同じ端末からも開ける。</p>
        </div>
        <QrCode
          {...args}
          variant="compact"
          details={<p className="ds-hint">kyudaisai.jp</p>}
          actions={link}
        />
      </article>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole("img")).toHaveLength(3);
    for (const image of canvas.getAllByRole("img")) {
      await waitFor(() => expect((image as HTMLImageElement).naturalWidth).toBeGreaterThan(0));
    }
  },
};

export const Loading: Story = {
  name: "読み込み中",
  args: { state: "loading" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole("img")).not.toBeInTheDocument();
    await expect(canvas.getByRole("status")).toHaveTextContent("QRコードを読み込んでいます");
  },
};
export const Unavailable: Story = {
  name: "利用できないコード",
  args: {
    state: "unavailable",
    message: "有効期限が過ぎています。受付で担当者にお声がけください。",
    actions: link,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole("img")).not.toBeInTheDocument();
    await expect(canvas.queryByRole("link")).not.toBeInTheDocument();
  },
};
function RetryExample(args: QrCodeProps) {
  const [state, setState] = useState<QrCodeProps["state"]>("error");
  return (
    <QrCode
      {...args}
      state={state}
      message={state === "error" ? "通信状況を確認して、再読み込みしてください。" : undefined}
      onRetry={() => setState("ready")}
    />
  );
}
export const Error: Story = {
  name: "エラーと再読み込み",
  render: (args) => <RetryExample {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    await expect(canvas.getByRole("button", { name: "再読み込み" })).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(canvas.getByRole("img")).toBeInTheDocument();
  },
};
export const RetryDisabled: Story = {
  name: "再読み込みを無効化",
  args: { state: "error", retryDisabled: true, onRetry: fn() },
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole("button", { name: "再読み込み" });
    await expect(button).toBeDisabled();
    await userEvent.tab();
    await expect(button).not.toHaveFocus();
    await expect(args.onRetry).not.toHaveBeenCalled();
  },
};
export const ImageFailure: Story = {
  name: "画像の読み込み失敗",
  args: { src: "data:image/png;base64,broken", actions: link },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByRole("status")).toHaveTextContent(
      "QRコードを表示できませんでした",
    );
    await expect(canvas.queryByRole("img")).not.toBeInTheDocument();
    await expect(canvas.queryByRole("link")).not.toBeInTheDocument();
  },
};
export const LongContent: Story = {
  name: "長い名称とリンク",
  args: {
    variant: "compact",
    title: "九州大学の研究を体験できる科学実験とワークショップのご案内",
    details: (
      <p>長い名称は折り返して表示します。QRを読み取れない場合は、リンクから案内を開けます。</p>
    ),
    actions: link,
  },
};

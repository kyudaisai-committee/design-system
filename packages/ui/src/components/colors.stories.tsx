import type { Meta, StoryObj } from "@storybook/react-vite";

const pairs = [
  ["画面", "background", "foreground", "ページの地と本文"],
  ["情報面", "card", "card-foreground", "背景から区別する情報のまとまり"],
  ["主要操作", "primary", "primary-foreground", "保存・提出など、その画面で優先する操作"],
  ["補助操作", "secondary", "secondary-foreground", "主要操作を支える選択肢"],
  ["補足", "muted", "muted-foreground", "注記・更新日時・説明"],
  ["成功", "success-background", "success", "受理・処理完了"],
  ["注意", "warning-background", "warning", "修正や確認が必要な状態"],
  ["失敗", "danger-background", "danger", "処理の失敗・入力エラー"],
  ["案内", "info-background", "info", "作業に必要な情報"],
] as const;

function ColorPalette() {
  return (
    <main className="sb-foundation">
      <h1>色</h1>
      <p>
        用途に応じた色を選び、背景と文字を一組で使います。ライト・ダークは上部のツールバーで切り替えられます。状態は色だけに頼らず、文字でも伝えてください。
      </p>
      <div className="ds-table-scroll">
        <table className="sb-token-table">
          <thead>
            <tr>
              <th scope="col">役割</th>
              <th scope="col">組合せ</th>
              <th scope="col">トークン</th>
              <th scope="col">用途</th>
            </tr>
          </thead>
          <tbody>
            {pairs.map(([name, bg, fg, use]) => (
              <tr key={bg}>
                <th scope="row">{name}</th>
                <td>
                  <span
                    className="sb-swatch"
                    style={{
                      background: `var(--${bg})`,
                      color: `var(--${fg})`,
                    }}
                  >
                    九大祭
                  </span>
                </td>
                <td>
                  <code>--{bg}</code>
                  <br />
                  <code>--{fg}</code>
                </td>
                <td>{use}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <section className="sb-foundation-section">
        <h2>境界とフォーカス</h2>
        <p>
          borderは情報の区切り、inputは入力欄の境界、ringはキーボードで操作している位置を示します。
        </p>
        <div className="ds-row">
          {["border", "input", "ring"].map((token) => (
            <div key={token} style={{ flex: "1 1 10rem", display: "grid", gap: "1rem" }}>
              <div style={{ height: "3rem", border: `2px solid var(--${token})` }} />
              <code>--{token}</code>
            </div>
          ))}
        </div>
      </section>
      <a href="/system/DESIGN/#colors" target="_top">
        配色の使い方
      </a>
    </main>
  );
}
const meta = {
  title: "Foundations/Colors",
  component: ColorPalette,
  tags: ["!autodocs"],
  parameters: { layout: "fullscreen", controls: { disable: true } },
} satisfies Meta<typeof ColorPalette>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Palette: Story = { name: "色の役割" };

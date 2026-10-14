import type { Meta, StoryObj } from "@storybook/react-vite";

function ShapeGuide() {
  return (
    <main className="sb-foundation">
      <h1>形と階層</h1>
      <p>
        部品の役割に合わせて角丸を使い分けます。操作・入力には10px、まとまった情報を囲む面には14pxを使います。
      </p>
      <div className="ds-table-scroll">
        <table className="sb-token-table">
          <thead>
            <tr>
              <th scope="col">形</th>
              <th scope="col">値</th>
              <th scope="col">用途</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["0px", "0px", "表・区切り線・進行の強調"],
              ["var(--radius-sm)", "6px", "短い状態ラベル"],
              ["var(--radius-md)", "8px", "小さい操作部品"],
              ["var(--radius)", "10px", "標準の操作・入力"],
              ["var(--radius-xl)", "14px", "独立する情報面・確認画面"],
            ].map(([radius, value, use]) => (
              <tr key={value}>
                <td>
                  <div
                    style={{
                      width: "4rem",
                      height: "2.5rem",
                      border: "1px solid var(--input)",
                      borderRadius: radius,
                    }}
                  />
                </td>
                <td>{value}</td>
                <td>{use}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <section className="sb-foundation-section">
        <h2>現在位置</h2>
        <div
          style={{
            borderLeft: "3px solid var(--foreground)",
            paddingLeft: "1rem",
          }}
        >
          <strong>企画情報の審査</strong>
          <p className="ds-hint">進行中</p>
        </div>
      </section>
      <a href="/system/DESIGN/#shapes" target="_top">
        形の使い方
      </a>
      <section className="sb-foundation-section">
        <h2>重なり</h2>
        <p>
          通常の情報は余白と区切り線で区別します。DialogやSheetは背景を薄く暗くし、開いている領域を示します。メニューには控えめな影を付けます。
        </p>
      </section>
    </main>
  );
}
const meta = {
  title: "Foundations/Shape",
  component: ShapeGuide,
  tags: ["!autodocs"],
  parameters: { layout: "fullscreen", controls: { disable: true } },
} satisfies Meta<typeof ShapeGuide>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Roles: Story = { name: "形の使い分け" };

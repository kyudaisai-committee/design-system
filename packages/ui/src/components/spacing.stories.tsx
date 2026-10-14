import type { Meta, StoryObj } from "@storybook/react-vite";

function SpacingScale() {
  return (
    <main className="sb-foundation">
      <h1>余白</h1>
      <p>
        関連する情報は近づけ、別のまとまりとの間には広い余白を取ります。次の値から、情報の関係と画面幅に合う余白を選んでください。
      </p>
      <section>
        {[
          [1, "アイコンと短い補足"],
          [2, "ラベルと入力"],
          [3, "並ぶ操作"],
          [4, "狭い画面の外余白"],
          [6, "入力項目・情報群の間"],
          [8, "節の間"],
          [12, "大きな領域の間"],
        ].map(([value, use]) => (
          <div className="sb-token-strip" key={value}>
            <div>
              <code>--space-{value}</code>
              <p className="ds-hint">{Number(value) * 4}px</p>
            </div>
            <div>
              <div
                style={{
                  width: `var(--space-${value})`,
                  height: ".75rem",
                  background: "var(--foreground)",
                  marginBottom: ".5rem",
                }}
              />
              <span className="ds-hint">{use}</span>
            </div>
          </div>
        ))}
      </section>
      <a href="/system/DESIGN/#layout" target="_top">
        画面の幅と余白の使い方
      </a>
      <section className="sb-foundation-section">
        <h2>画面の幅</h2>
        <div className="sb-token-strip">
          <code>--content-width</code>
          <p>一覧の最大幅は72remです。入力欄や長い本文は、幅40remを目安にします。</p>
        </div>
      </section>
    </main>
  );
}
const meta = {
  title: "Foundations/Spacing",
  component: SpacingScale,
  tags: ["!autodocs"],
  parameters: { layout: "fullscreen", controls: { disable: true } },
} satisfies Meta<typeof SpacingScale>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Scale: Story = { name: "余白と幅" };

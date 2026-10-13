import type { Meta, StoryObj } from "@storybook/react-vite";

function TypographyScale() {
  return (
    <main className="sb-foundation">
      <h1>文字</h1>
      <p>
        英数字にはGeist、日本語には端末で利用できるゴシック体を指定しています。Geistを読み込んでいない場合は、代替書体で表示されます。行高は本文を1.65、見出しを1.4とし、文字の太さと余白で階層を示します。pxは基準文字サイズ16pxでの換算値です。
      </p>
      <section className="sb-foundation-section">
        {[
          [
            "ページ見出し",
            "--text-title · 28px / 600",
            "var(--text-title)",
            600,
            "企画の準備を進める",
          ],
          [
            "節見出し",
            "--text-lg · 20px / 600",
            "var(--text-lg)",
            600,
            "提出する内容を確認してください",
          ],
          [
            "本文",
            "--text-base · 16px / 400",
            "var(--text-base)",
            400,
            "九大祭で行う企画の名称、会場、紹介文を入力します。",
          ],
          [
            "補足",
            "--text-sm · 14px / 400",
            "var(--text-sm)",
            400,
            "変更した内容は、下書きとして保存できます。",
          ],
        ].map(([role, spec, size, weight, text]) => (
          <div className="sb-type-specimen" key={role}>
            <small>
              {role} — {spec}
            </small>
            <p
              style={{
                fontSize: size,
                fontWeight: weight,
                lineHeight:
                  weight === 600
                    ? "var(--line-height-heading)"
                    : "var(--line-height-body)",
              }}
            >
              {text}
            </p>
          </div>
        ))}
      </section>
      <a href="/system/DESIGN/#typography" target="_top">書体と文字サイズの使い方</a>
      <section className="sb-foundation-section">
        <h2>日本語と英数字</h2>
        <p style={{ maxWidth: "42rem" }}>
          九州大学の学生によるステージ企画「Autumn Session
          2026」。センター1号館・101教室で、12:30から開催します。
        </p>
        <div
          style={{
            fontVariantNumeric: "tabular-nums",
            fontSize: "var(--text-lg)",
          }}
        >
          10月20日 17:00　¥12,800　受付番号 K-080
        </div>
      </section>
    </main>
  );
}
const meta = {
  title: "Foundations/Typography",
  component: TypographyScale,
  tags: ["!autodocs"],
  parameters: { layout: "fullscreen", controls: { disable: true } },
} satisfies Meta<typeof TypographyScale>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Scale: Story = { name: "文字の階層" };

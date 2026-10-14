import type { Meta, StoryObj } from "@storybook/react-vite";

import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./pagination";

const meta = {
  title: "Components/Pagination",
  component: Pagination,
  subcomponents: {
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationPrevious,
    PaginationNext,
    PaginationEllipsis,
  },
  args: { "aria-label": "申請一覧のページ" },
  argTypes: {
    "aria-label": {
      control: "text",
      description: "どの一覧のページを切り替えるか。",
    },
    children: { control: false },
  },
  parameters: {
    docs: {
      description: {
        component:
          "件数の多い一覧を、ページごとに表示します。各リンクに移動先を指定し、現在のページは`isActive`で示します。\n\n先頭ページでは「前へ」、末尾ページでは「次へ」を無効にします。操作の位置と幅は保ち、検索条件とページ番号をURLに含めて、戻る操作や共有でも同じ一覧を表示できるようにしてください。",
      },
    },
  },
  render: function Render(args) {
    const [page, setPage] = useState(2);
    const go = (next: number) => (event: React.MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
      setPage(next);
    };
    return (
      <div className="grid max-w-xl gap-5">
        <p role="status" className="text-sm text-muted-foreground">
          全60件中 {(page - 1) * 20 + 1}〜{page * 20}件
        </p>
        <Pagination {...args}>
          <PaginationContent>
            {
              <PaginationItem>
                <PaginationPrevious
                  disabled={page === 1}
                  href={`?page=${page - 1}`}
                  onClick={go(page - 1)}
                />
              </PaginationItem>
            }
            {[1, 2, 3].map((number) => (
              <PaginationItem key={number}>
                <PaginationLink
                  href={`?page=${number}`}
                  isActive={page === number}
                  aria-label={`${number}ページ目`}
                  onClick={go(number)}
                >
                  {number}
                </PaginationLink>
              </PaginationItem>
            ))}
            {
              <PaginationItem>
                <PaginationNext
                  disabled={page === 3}
                  href={`?page=${page + 1}`}
                  onClick={go(page + 1)}
                />
              </PaginationItem>
            }
          </PaginationContent>
        </Pagination>
      </div>
    );
  },
} satisfies Meta<typeof Pagination>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  name: "基本",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const next = canvas.getByRole("link", { name: "次のページ" });
    const nextPosition = next.getBoundingClientRect().left;
    const previousPosition = canvas
      .getByRole("link", { name: "前のページ" })
      .getBoundingClientRect().left;
    next.focus();
    await userEvent.keyboard("{Enter}");
    await expect(canvas.getByRole("link", { name: "3ページ目" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    await expect(canvas.getByRole("link", { name: "次のページ" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    await expect(canvas.getByRole("link", { name: "次のページ" })).not.toHaveAttribute("href");
    await expect(
      canvas.getByRole("link", { name: "次のページ" }).getBoundingClientRect().left,
    ).toBe(nextPosition);
    await expect(canvas.getByRole("status")).toHaveTextContent("41〜60件");
    await userEvent.click(canvas.getByRole("link", { name: "前のページ" }));
    await userEvent.click(canvas.getByRole("link", { name: "前のページ" }));
    const previous = canvas.getByRole("link", { name: "前のページ" });
    await expect(previous).toHaveAttribute("aria-disabled", "true");
    await expect(previous).not.toHaveAttribute("href");
    await expect(previous.getBoundingClientRect().left).toBe(previousPosition);
    await expect(canvas.getByRole("status")).toHaveTextContent("1〜20件");
  },
};
export const ManyPages: Story = {
  name: "ページの省略",
  render: (args) => (
    <Pagination {...args}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="?page=5" />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="?page=1" aria-label="1ページ目">
            1
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="?page=6" isActive aria-label="6ページ目">
            6
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="?page=12" aria-label="12ページ目">
            12
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="?page=7" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  ),
};

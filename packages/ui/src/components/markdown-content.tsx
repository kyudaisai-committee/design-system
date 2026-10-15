"use client";

import type { ReactNode } from "react";

import { parseMarkdown, safeLink, type MarkdownNode, type ImageAsset } from "@kyudaisai/ui-models";

import { PublicImage } from "./media";

export interface MarkdownContentProps {
  source: string;
  label?: string;
  /** Resolves only images the host has checked; omitted images are described as text. */
  resolveImage?: (url: string, alt: string) => ImageAsset | undefined;
  onOpenLink?: (url: string) => void;
  /** Attachment handling is host-owned; arbitrary Markdown URLs are never treated as attachments. */
  attachments?: ReactNode;
}
export function MarkdownContent({
  source,
  label = "本文",
  resolveImage,
  onOpenLink,
  attachments,
}: MarkdownContentProps) {
  function render(node: MarkdownNode, key: number): ReactNode {
    const children =
      "children" in node ? node.children.map((child, index) => render(child, index)) : undefined;
    switch (node.type) {
      case "text":
        return node.value;
      case "paragraph":
        return (
          <div className="ds-markdown-paragraph" key={key}>
            {node.children.map((child, index) => {
              if (child.type !== "image") return render(child, index);
              const asset = resolveImage?.(child.url, child.alt ?? "画像");
              return asset ? <PublicImage key={index} asset={asset} /> : render(child, index);
            })}
          </div>
        );
      case "heading": {
        const Heading = `h${node.depth}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
        return <Heading key={key}>{children}</Heading>;
      }
      case "strong":
        return <strong key={key}>{children}</strong>;
      case "emphasis":
        return <em key={key}>{children}</em>;
      case "delete":
        return <del key={key}>{children}</del>;
      case "blockquote":
        return <blockquote key={key}>{children}</blockquote>;
      case "list":
        return node.ordered ? (
          <ol key={key} start={node.start ?? 1}>
            {children}
          </ol>
        ) : (
          <ul key={key}>{children}</ul>
        );
      case "listItem":
        return (
          <li key={key}>
            {node.checked === null || node.checked === undefined ? null : (
              <span>{node.checked ? "☑ " : "☐ "}</span>
            )}
            {children}
          </li>
        );
      case "code":
        return (
          <pre key={key}>
            <code>{node.value}</code>
          </pre>
        );
      case "inlineCode":
        return <code key={key}>{node.value}</code>;
      case "break":
        return <br key={key} />;
      case "thematicBreak":
        return <hr key={key} />;
      case "link": {
        const href = safeLink(node.url);
        return href ? (
          <a
            key={key}
            href={href}
            onClick={
              onOpenLink
                ? (event) => {
                    if (
                      event.button ||
                      event.metaKey ||
                      event.ctrlKey ||
                      event.shiftKey ||
                      event.altKey
                    )
                      return;
                    event.preventDefault();
                    onOpenLink(href);
                  }
                : undefined
            }
          >
            {children}
          </a>
        ) : (
          <span key={key}>{children}</span>
        );
      }
      case "image":
        return <span key={key}>［画像：{node.alt || "説明なし"}］</span>;
      case "table":
        return (
          <div
            key={key}
            className="ds-table-scroll"
            tabIndex={0}
            role="region"
            aria-label="本文の表"
          >
            <table>
              <thead>
                <tr>
                  {node.children[0]?.children.map((cell, index) => (
                    <th key={index} scope="col">
                      {cell.children.map(render)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {node.children.slice(1).map((row, index) => (
                  <tr key={index}>
                    {row.children.map((cell, column) => (
                      <td key={column}>{cell.children.map(render)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case "html":
        return <span key={key}>{node.value}</span>;
      default:
        return <span key={key}>{children}</span>;
    }
  }
  return (
    <section aria-label={label} className="ds-markdown">
      {parseMarkdown(source).children.map(render)}
      {attachments}
    </section>
  );
}

import type { ReactNode } from "react";

import { spacing } from "@kyudaisai/tokens/native";
import { parseMarkdown, safeLink, type MarkdownNode, type ImageAsset } from "@kyudaisai/ui-models";
import { Linking, ScrollView, View } from "react-native";

import { Text } from "./components";
import { PublicImage } from "./media";
import { useNativeTheme } from "./theme";

export interface MarkdownContentProps {
  source: string;
  label?: string;
  resolveImage?: (url: string, alt: string) => ImageAsset | undefined;
  onOpenLink?: (url: string) => void;
  attachments?: ReactNode;
}
export function MarkdownContent({
  source,
  label = "本文",
  resolveImage,
  onOpenLink,
  attachments,
}: MarkdownContentProps) {
  const { colors } = useNativeTheme();
  function render(node: MarkdownNode, key: number): ReactNode {
    const children =
      "children" in node ? node.children.map((child, index) => render(child, index)) : undefined;
    switch (node.type) {
      case "text":
        return node.value;
      case "paragraph": {
        const runs: ReactNode[] = [];
        let inline: ReactNode[] = [];
        const flush = () => {
          if (inline.length) {
            runs.push(<Text key={`text-${runs.length}`}>{inline}</Text>);
            inline = [];
          }
        };
        node.children.forEach((child, index) => {
          if (child.type === "image") {
            flush();
            const asset = resolveImage?.(child.url, child.alt ?? "画像");
            runs.push(
              asset ? <PublicImage key={`image-${index}`} asset={asset} /> : render(child, index),
            );
          } else inline.push(render(child, index));
        });
        flush();
        return (
          <View key={key} style={{ gap: spacing[2] }}>
            {runs}
          </View>
        );
      }
      case "heading":
        return (
          <Text key={key} accessibilityRole="header" variant="heading">
            {children}
          </Text>
        );
      case "strong":
        return (
          <Text key={key} style={{ fontWeight: "700" }}>
            {children}
          </Text>
        );
      case "emphasis":
        return (
          <Text key={key} style={{ fontStyle: "italic" }}>
            {children}
          </Text>
        );
      case "delete":
        return (
          <Text key={key} style={{ textDecorationLine: "line-through" }}>
            {children}
          </Text>
        );
      case "blockquote":
        return (
          <View
            key={key}
            style={{
              borderLeftWidth: 3,
              borderColor: colors.border,
              paddingLeft: spacing[4],
              gap: spacing[2],
            }}
          >
            {children}
          </View>
        );
      case "list":
        return (
          <View key={key} style={{ gap: spacing[2] }}>
            {node.children.map((item, index) => (
              <View key={index} style={{ flexDirection: "row", gap: spacing[2] }}>
                <Text>
                  {node.ordered ? `${(node.start ?? 1) + index}.` : "•"}
                  {item.checked === undefined || item.checked === null
                    ? ""
                    : item.checked
                      ? "☑"
                      : "☐"}
                </Text>
                <View style={{ flex: 1 }}>{item.children.map(render)}</View>
              </View>
            ))}
          </View>
        );
      case "code":
        return (
          <ScrollView horizontal key={key}>
            <Text
              style={{
                fontFamily: "monospace",
                backgroundColor: colors.muted,
                padding: spacing[3],
              }}
            >
              {node.value}
            </Text>
          </ScrollView>
        );
      case "inlineCode":
        return (
          <Text key={key} style={{ fontFamily: "monospace", backgroundColor: colors.muted }}>
            {node.value}
          </Text>
        );
      case "break":
        return "\n";
      case "thematicBreak":
        return <View key={key} style={{ borderBottomWidth: 1, borderColor: colors.border }} />;
      case "link": {
        const href = safeLink(node.url);
        const usable = href && (onOpenLink || /^https?:/.test(href));
        return (
          <Text
            key={key}
            accessibilityRole={usable ? "link" : "text"}
            style={usable ? { textDecorationLine: "underline" } : undefined}
            onPress={
              usable
                ? () => {
                    if (onOpenLink) onOpenLink(href);
                    else void Linking.openURL(href).catch(() => {});
                  }
                : undefined
            }
          >
            {children}
          </Text>
        );
      }
      case "image":
        return <Text key={key}>［画像：{node.alt || "説明なし"}］</Text>;
      case "table": {
        const headers = node.children[0];
        return (
          <View key={key} accessibilityLabel="本文の表" style={{ gap: spacing[3] }}>
            {node.children.slice(1).map((row, index) => (
              <View
                key={index}
                style={{
                  borderWidth: 1,
                  borderColor: colors.border,
                  padding: spacing[3],
                  gap: spacing[2],
                }}
              >
                {row.children.map((cell, column) => (
                  <View key={column}>
                    <Text variant="label">{headers?.children[column]?.children.map(render)}</Text>
                    <Text>{cell.children.map(render)}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        );
      }
      case "html":
        return <Text key={key}>{node.value}</Text>;
      default:
        return <View key={key}>{children}</View>;
    }
  }
  return (
    <View accessibilityLabel={label} style={{ gap: spacing[4] }}>
      {parseMarkdown(source).children.map(render)}
      {attachments}
    </View>
  );
}

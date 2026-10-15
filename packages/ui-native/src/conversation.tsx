import { radii, spacing } from "@kyudaisai/tokens/native";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  AccessibilityInfo,
  Platform,
  Pressable,
  ScrollView,
  View,
  useWindowDimensions,
} from "react-native";
import Svg, { Path } from "react-native-svg";

import { Badge, Button, EmptyState, Text } from "./components";
import { useNativeTheme } from "./theme";

export interface ConversationSummary {
  id: string;
  title: string;
  kind: string;
  context?: string;
  excerpt: string;
  updatedAt: string;
  unreadCount: number;
  mentionCount: number;
}
const touchSize = Platform.OS === "android" ? 48 : 44;

/** Compact action visuals retain a full platform touch target. */
function ConversationAction({
  label,
  children,
  onPress,
  selected,
}: {
  label: string;
  children: ReactNode;
  onPress: () => void;
  selected?: boolean;
}) {
  const { colors } = useNativeTheme();
  const [focused, setFocused] = useState(false);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={selected === undefined ? undefined : { selected }}
      onPress={onPress}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={({ pressed }) => ({
        minWidth: touchSize,
        minHeight: touchSize,
        paddingHorizontal: spacing[2],
        alignItems: "center",
        justifyContent: "center",
        borderRadius: radii.sm,
        borderWidth: 2,
        borderColor: focused ? colors.ring : "transparent",
        backgroundColor: pressed ? colors.muted : "transparent",
      })}
    >
      {children}
    </Pressable>
  );
}
function ActionIcon({
  kind,
  selected = false,
}: {
  kind: "save" | "edit" | "close";
  selected?: boolean;
}) {
  const { colors } = useNativeTheme();
  const paths = {
    save: "M19 21l-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z",
    edit: "m16 3 5 5-13 13H3v-5L16 3zM14 5l5 5",
    close: "M18 6 6 18M6 6l12 12",
  };
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" accessible={false}>
      <Path
        d={paths[kind]}
        stroke={colors.foreground}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={kind === "save" && selected ? colors.foreground : "none"}
      />
    </Svg>
  );
}
export function ConversationList({
  items,
  selectedId,
  onSelect,
  showPreview = false,
  focusedId,
}: {
  items: readonly ConversationSummary[];
  selectedId?: string;
  onSelect: (item: ConversationSummary) => void;
  showPreview?: boolean;
  focusedId?: string;
}) {
  const { colors } = useNativeTheme();
  const [keyboardFocusedId, setKeyboardFocusedId] = useState<string>();
  const rows = useRef<Record<string, View | null>>({});
  useEffect(() => {
    const node = focusedId ? rows.current[focusedId] : undefined;
    if (node) AccessibilityInfo.sendAccessibilityEvent(node, "focus");
  }, [focusedId]);
  return items.length ? (
    <View style={{ gap: spacing[2] }} accessibilityLabel="会話一覧">
      {items.map((item) => (
        <Pressable
          key={item.id}
          ref={(node) => {
            rows.current[item.id] = node;
          }}
          accessibilityRole="button"
          accessibilityLabel={`${item.title}${item.unreadCount > 0 ? ` / 未読 ${item.unreadCount}件` : ""}${item.mentionCount > 0 ? ` / メンション ${item.mentionCount}件` : ""}`}
          accessibilityState={{ selected: selectedId === item.id }}
          onPress={() => onSelect(item)}
          onFocus={() => setKeyboardFocusedId(item.id)}
          onBlur={() => setKeyboardFocusedId(undefined)}
          style={({ pressed }) => ({
            minHeight: touchSize,
            padding: spacing[2],
            gap: spacing[1],
            borderRadius: radii.sm,
            borderWidth: 2,
            borderColor: keyboardFocusedId === item.id ? colors.ring : "transparent",
            backgroundColor:
              selectedId === item.id
                ? colors.sidebarAccent
                : pressed
                  ? colors.muted
                  : "transparent",
          })}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing[2] }}>
            <Text variant="label" style={{ flex: 1, flexShrink: 1 }}>
              {item.title}
            </Text>
            {item.unreadCount > 0 && (
              <Text variant="caption" accessible={false}>
                {item.unreadCount}
              </Text>
            )}
            {item.mentionCount > 0 && (
              <Text variant="caption" accessible={false}>
                @ {item.mentionCount}
              </Text>
            )}
          </View>
          {showPreview && (
            <>
              <Text variant="caption" tone="muted">
                {item.excerpt}
              </Text>
              <Text variant="caption" tone="muted">
                {item.updatedAt}
              </Text>
            </>
          )}
        </Pressable>
      ))}
    </View>
  ) : (
    <EmptyState title="会話がありません" />
  );
}
export interface ConversationMessage {
  id: string;
  author: string;
  initials?: string;
  context?: string;
  time: string;
  body: string;
  edited?: boolean;
  deleted?: boolean;
  unavailable?: boolean;
  replyCount?: number;
  unreadReplies?: number;
  attachments?: readonly { name: string; description: string }[];
  reference?: ReactNode;
  canEdit?: boolean;
}
export function MessageList({
  messages,
  renderBody,
  onReply,
  onEdit,
  firstUnreadId,
  savedIds = [],
  onSaveChange,
  focusMessageId,
  onMessageRef,
}: {
  messages: readonly ConversationMessage[];
  renderBody: (source: string) => ReactNode;
  onReply?: (message: ConversationMessage) => void;
  onEdit?: (message: ConversationMessage) => void;
  firstUnreadId?: string;
  focusMessageId?: string;
  onMessageRef?: (id: string, node: View | null) => void;
  savedIds?: readonly string[];
  onSaveChange?: (message: ConversationMessage, saved: boolean) => void;
}) {
  const { colors } = useNativeTheme();
  const { fontScale } = useWindowDimensions();
  const avatarSize = Math.max(40, 24 * fontScale);
  const headers = useRef<Record<string, View | null>>({});
  useEffect(() => {
    const node = focusMessageId ? headers.current[focusMessageId] : undefined;
    if (node) AccessibilityInfo.sendAccessibilityEvent(node, "focus");
  }, [focusMessageId]);
  return messages.length ? (
    <View style={{ gap: spacing[3] }}>
      {messages.map((message) => (
        <View
          key={message.id}
          collapsable={false}
          ref={(node) => onMessageRef?.(message.id, node)}
          style={{ paddingVertical: spacing[2] }}
        >
          {firstUnreadId === message.id && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: spacing[2],
                paddingVertical: spacing[2],
              }}
            >
              <View style={{ flex: 1, height: 1, backgroundColor: colors.input }} />
              <Text variant="caption" tone="muted">
                ここから未読
              </Text>
              <View style={{ flex: 1, height: 1, backgroundColor: colors.input }} />
            </View>
          )}
          <View
            style={{
              flexDirection: fontScale > 1.5 ? "column" : "row",
              alignItems: "flex-start",
              gap: spacing[3],
            }}
          >
            {!message.unavailable && (
              <View
                accessible={false}
                accessibilityElementsHidden
                importantForAccessibility="no-hide-descendants"
                style={{
                  width: avatarSize,
                  minHeight: avatarSize,
                  padding: spacing[1],
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: radii.sm,
                  backgroundColor: colors.secondary,
                }}
              >
                <Text variant="label">{message.initials ?? message.author.slice(0, 1)}</Text>
              </View>
            )}
            <View
              style={{
                flex: fontScale > 1.5 ? undefined : 1,
                width: fontScale > 1.5 ? "100%" : undefined,
                gap: spacing[1],
                minWidth: 0,
              }}
            >
              <View
                accessible
                accessibilityLabel={
                  message.unavailable
                    ? "閲覧できない投稿"
                    : `${message.author} / ${message.context ?? ""} / ${message.time}`
                }
                ref={(node) => {
                  headers.current[message.id] = node;
                }}
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  alignItems: "center",
                  gap: spacing[2],
                }}
              >
                <Text variant="label">
                  {message.unavailable ? "閲覧できない投稿" : message.author}
                </Text>
                {!message.unavailable && (
                  <>
                    {message.context && (
                      <Text variant="caption" tone="muted">
                        {message.context}
                      </Text>
                    )}
                    <Text variant="caption" tone="muted">
                      {message.time}
                    </Text>
                  </>
                )}
                {message.edited && !message.deleted && !message.unavailable && (
                  <Badge label="編集済み" />
                )}
              </View>
              {message.unavailable ? (
                <Text tone="muted">この投稿は閲覧できません。</Text>
              ) : message.deleted ? (
                <Text tone="muted">この投稿は削除されました。</Text>
              ) : (
                <>
                  {renderBody(message.body)}
                  {message.reference}
                  {message.attachments?.map((file, index) => (
                    <View
                      key={index}
                      style={{
                        padding: spacing[3],
                        borderLeftWidth: 3,
                        borderLeftColor: colors.input,
                        backgroundColor: colors.muted,
                      }}
                    >
                      <Text>
                        {file.name} / {file.description}
                      </Text>
                    </View>
                  ))}
                </>
              )}
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  alignItems: "center",
                  gap: spacing[1],
                }}
              >
                {onReply && (
                  <ConversationAction
                    label={`${message.replyCount ? `返信 ${message.replyCount}件` : "返信する"}${message.unreadReplies ? ` / 未読 ${message.unreadReplies}件` : ""} / ${message.unavailable ? "閲覧できない投稿" : `${message.author}の投稿`}`}
                    onPress={() => onReply(message)}
                  >
                    <Text variant="caption">
                      {message.replyCount ? `返信 ${message.replyCount}件` : "返信する"}
                      {message.unreadReplies ? ` / 未読 ${message.unreadReplies}件` : ""}
                    </Text>
                  </ConversationAction>
                )}
                {onSaveChange && !message.deleted && !message.unavailable && (
                  <ConversationAction
                    label={`${savedIds.includes(message.id) ? "保存を解除" : "保存する"} / ${message.author}の投稿`}
                    selected={savedIds.includes(message.id)}
                    onPress={() => onSaveChange(message, !savedIds.includes(message.id))}
                  >
                    <ActionIcon kind="save" selected={savedIds.includes(message.id)} />
                  </ConversationAction>
                )}
                {message.canEdit && !message.deleted && !message.unavailable && onEdit && (
                  <ConversationAction label="本文を編集" onPress={() => onEdit(message)}>
                    <ActionIcon kind="edit" />
                  </ConversationAction>
                )}
              </View>
            </View>
          </View>
        </View>
      ))}
    </View>
  ) : (
    <EmptyState title="まだ投稿がありません" description="最初のメッセージを入力できます。" />
  );
}
export function ThreadHeader({
  conversationTitle,
  onClose,
  actions,
}: {
  conversationTitle?: string;
  onClose: () => void;
  actions?: ReactNode;
}) {
  const { colors } = useNativeTheme();
  return (
    <View style={{ gap: spacing[2] }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: spacing[3],
          paddingBottom: spacing[2],
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text variant="heading">スレッド</Text>
          {conversationTitle && (
            <Text variant="caption" tone="muted">
              {conversationTitle}
            </Text>
          )}
        </View>
        <ConversationAction label="元の投稿へ戻る" onPress={onClose}>
          <ActionIcon kind="close" />
        </ConversationAction>
      </View>
      {actions}
    </View>
  );
}
export function ThreadTimeline({
  parent,
  renderBody,
  followed,
  onFollowChange,
  children,
  renderMessages,
}: {
  parent: ConversationMessage;
  renderBody: (source: string) => ReactNode;
  followed: boolean;
  onFollowChange: (followed: boolean) => void;
  children?: ReactNode;
  renderMessages?: (props: {
    messages: readonly ConversationMessage[];
    renderBody: (source: string) => ReactNode;
  }) => ReactNode;
}) {
  return (
    <View style={{ gap: spacing[3] }}>
      <View style={{ alignSelf: "flex-start" }}>
        <ConversationAction
          label={followed ? "フォロー中" : "スレッドをフォロー"}
          selected={followed}
          onPress={() => onFollowChange(!followed)}
        >
          <Text variant="caption">{followed ? "フォロー中" : "スレッドをフォロー"}</Text>
        </ConversationAction>
      </View>
      {renderMessages ? (
        renderMessages({ messages: [parent], renderBody })
      ) : (
        <MessageList messages={[parent]} renderBody={renderBody} />
      )}
      {children}
    </View>
  );
}
export function ThreadPanel({
  parent,
  conversationTitle,
  renderBody,
  children,
  onClose,
  followed,
  onFollowChange,
  actions,
}: {
  parent: ConversationMessage;
  conversationTitle?: string;
  renderBody: (source: string) => ReactNode;
  children: ReactNode;
  onClose: () => void;
  followed: boolean;
  onFollowChange: (followed: boolean) => void;
  actions?: ReactNode;
}) {
  return (
    <View style={{ gap: spacing[4] }}>
      <ThreadHeader conversationTitle={conversationTitle} onClose={onClose} actions={actions} />
      <ThreadTimeline
        parent={parent}
        renderBody={renderBody}
        followed={followed}
        onFollowChange={onFollowChange}
      >
        {children}
      </ThreadTimeline>
    </View>
  );
}

export interface MessageResult {
  id: string;
  conversationId: string;
  messageId: string;
  parentId?: string;
  conversationTitle: string;
  author: string;
  time: string;
  excerpt: string;
  unread?: boolean;
  available?: boolean;
  unavailableReason?: string;
}
export function MessageResultList({
  items,
  label,
  onOpen,
  onRemove,
  highlight = "",
  disabled = false,
  removingIds = [],
  focusedId,
}: {
  items: readonly MessageResult[];
  label: string;
  onOpen: (item: MessageResult) => void;
  onRemove?: (item: MessageResult) => void;
  highlight?: string;
  disabled?: boolean;
  removingIds?: readonly string[];
  focusedId?: string;
}) {
  const { colors } = useNativeTheme();
  const [keyboardFocusedId, setKeyboardFocusedId] = useState<string>();
  const headers = useRef<Record<string, View | null>>({});
  useEffect(() => {
    const node = focusedId ? headers.current[focusedId] : undefined;
    if (node) AccessibilityInfo.sendAccessibilityEvent(node, "focus");
  }, [focusedId]);
  function excerpt(value: string) {
    const index = highlight.trim()
      ? value.toLocaleLowerCase().indexOf(highlight.toLocaleLowerCase())
      : -1;
    return index < 0 ? (
      value
    ) : (
      <>
        {value.slice(0, index)}
        <Text style={{ fontWeight: "600", backgroundColor: colors.muted }}>
          {value.slice(index, index + highlight.length)}
        </Text>
        {value.slice(index + highlight.length)}
      </>
    );
  }
  return (
    <View accessibilityLabel={label} style={{ gap: spacing[4] }}>
      {items.map((item) => (
        <View
          key={item.id}
          style={{
            gap: spacing[2],
            paddingVertical: spacing[3],
            borderBottomWidth: 1,
            borderColor: colors.border,
          }}
        >
          {item.available === false ? (
            <>
              <Text>この投稿は閲覧できません。</Text>
              <Text variant="caption" tone="muted">
                {item.unavailableReason ?? "元の投稿が利用できなくなりました。"}
              </Text>
            </>
          ) : (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${item.parentId ? "返信を開く" : "投稿を開く"} / ${item.conversationTitle} / ${item.author} / ${item.time}`}
              accessibilityHint={`${item.parentId ? "スレッド" : "投稿"}。${item.excerpt}${item.unread !== undefined ? (item.unread ? "。未読" : "。確認済み") : ""}`}
              accessibilityState={{ disabled }}
              onFocus={() => setKeyboardFocusedId(item.id)}
              onBlur={() => setKeyboardFocusedId(undefined)}
              disabled={disabled}
              ref={(node) => {
                headers.current[item.id] = node;
              }}
              onPress={() => {
                if (!disabled) onOpen(item);
              }}
              style={({ pressed }) => ({
                minHeight: touchSize,
                borderWidth: 2,
                borderColor: keyboardFocusedId === item.id ? colors.ring : "transparent",
                borderRadius: radii.sm,
                gap: spacing[2],
                paddingVertical: spacing[1],
                backgroundColor: pressed ? colors.muted : "transparent",
                opacity: disabled ? 0.5 : 1,
              })}
            >
              <Text variant="label">
                {item.conversationTitle}
                {item.parentId ? " / スレッド" : " / 投稿"}
              </Text>
              <Text variant="caption" tone="muted">
                {item.author} / {item.time}
              </Text>
              <Text>{excerpt(item.excerpt)}</Text>
              {item.unread !== undefined && (
                <Text variant="caption" tone="muted">
                  {item.unread ? "未読" : "確認済み"}
                </Text>
              )}
              <Text variant="caption" style={{ textDecorationLine: "underline" }}>
                {item.parentId ? "返信を開く" : "投稿を開く"}
              </Text>
            </Pressable>
          )}
          {onRemove ? (
            <Button
              variant="ghost"
              title={removingIds.includes(item.id) ? "保存を解除中" : "保存を解除"}
              disabled={disabled}
              loading={removingIds.includes(item.id)}
              accessibilityLabel={
                item.available === false
                  ? `${removingIds.includes(item.id) ? "保存を解除中" : "保存を解除"} / 閲覧できない項目`
                  : `${removingIds.includes(item.id) ? "保存を解除中" : "保存を解除"} / ${item.conversationTitle} / ${item.author} / ${item.time}`
              }
              onPress={() => {
                if (!disabled && !removingIds.includes(item.id)) onRemove(item);
              }}
            />
          ) : null}
        </View>
      ))}
    </View>
  );
}
function CollectionScroll({
  children,
  offset,
  onOffsetChange,
}: {
  children: ReactNode;
  offset: number;
  onOffsetChange?: (offset: number) => void;
}) {
  const scroll = useRef<ScrollView>(null);
  const restore = useRef<number | undefined>(offset);
  return (
    <ScrollView
      ref={scroll}
      style={{ flex: 1 }}
      keyboardShouldPersistTaps="handled"
      scrollEventThrottle={16}
      onScroll={(event) => onOffsetChange?.(event.nativeEvent.contentOffset.y)}
      onContentSizeChange={() => {
        if (restore.current !== undefined) {
          scroll.current?.scrollTo({ y: restore.current, animated: false });
          restore.current = undefined;
        }
      }}
    >
      {children}
    </ScrollView>
  );
}

export function ConversationLayout({
  view,
  list,
  conversation,
  thread,
  navigation,
  discovery,
  showDiscovery = false,
  toolbar,
  collectionScrollKey = "collection",
  collectionScrollOffset = 0,
  onCollectionScrollChange,
}: {
  view: "list" | "conversation" | "thread";
  list: ReactNode;
  conversation: ReactNode;
  thread?: ReactNode;
  toolbar?: ReactNode;
  navigation?: ReactNode;
  discovery?: ReactNode;
  showDiscovery?: boolean;
  collectionScrollKey?: string;
  collectionScrollOffset?: number;
  onCollectionScrollChange?: (offset: number) => void;
}) {
  const { width, fontScale } = useWindowDimensions();
  const { colors } = useNativeTheme();
  if (width >= 1200 && fontScale <= 1.3)
    return (
      <View style={{ flex: 1, gap: spacing[3] }}>
        {toolbar}
        <View style={{ flex: 1, flexDirection: "row", gap: spacing[4], alignItems: "stretch" }}>
          <View
            style={{ flex: 1, backgroundColor: colors.muted, padding: spacing[3], gap: spacing[4] }}
          >
            {navigation}
            <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps="handled">
              {list}
            </ScrollView>
          </View>
          <View style={{ flex: 2 }}>
            {showDiscovery ? (
              <CollectionScroll
                key={collectionScrollKey}
                offset={collectionScrollOffset}
                onOffsetChange={onCollectionScrollChange}
              >
                {discovery}
              </CollectionScroll>
            ) : (
              conversation
            )}
          </View>
          {!showDiscovery && thread ? (
            <View
              style={{
                flex: 2,
                borderLeftWidth: 1,
                borderLeftColor: colors.border,
                paddingLeft: spacing[4],
              }}
            >
              {thread}
            </View>
          ) : null}
        </View>
      </View>
    );
  return (
    <View style={{ flex: 1, gap: spacing[4] }}>
      {view === "list" ? (
        <>
          {toolbar}
          {navigation}
          <CollectionScroll
            key={collectionScrollKey}
            offset={collectionScrollOffset}
            onOffsetChange={onCollectionScrollChange}
          >
            {showDiscovery ? discovery : list}
          </CollectionScroll>
        </>
      ) : view === "thread" && thread ? (
        thread
      ) : (
        conversation
      )}
    </View>
  );
}

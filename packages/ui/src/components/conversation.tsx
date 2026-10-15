"use client";

import { Bookmark, Pencil, X, MessageCircle } from "lucide-react";
import { useId, type ReactNode } from "react";

import { Button } from "./button";
import { EmptyState, StatusBadge } from "./compositions";

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

export function ConversationList({
  items,
  selectedId,
  hrefFor,
  onSelect,
  showPreview = false,
}: {
  items: readonly ConversationSummary[];
  selectedId?: string;
  hrefFor: (item: ConversationSummary) => string;
  onSelect?: (item: ConversationSummary) => void;
  showPreview?: boolean;
}) {
  return items.length ? (
    <ul className="ds-conversation-list" aria-label="会話一覧">
      {items.map((item) => (
        <li key={item.id}>
          <a
            className="ds-conversation-link"
            href={hrefFor(item)}
            aria-current={selectedId === item.id ? "page" : undefined}
            onClick={
              onSelect
                ? (event) => {
                    if (
                      event.button !== 0 ||
                      event.metaKey ||
                      event.ctrlKey ||
                      event.shiftKey ||
                      event.altKey
                    )
                      return;
                    event.preventDefault();
                    onSelect(item);
                  }
                : undefined
            }
          >
            <span className="ds-conversation-title">
              {item.title}
              <span className="ds-conversation-count" aria-hidden="true">
                {item.unreadCount > 0 ? item.unreadCount : ""}
              </span>
              {item.unreadCount > 0 && (
                <span className="sr-only"> / 未読 {item.unreadCount}件</span>
              )}
            </span>
            {item.mentionCount > 0 && (
              <>
                <span className="ds-conversation-mention" aria-hidden="true">
                  @ {item.mentionCount}
                </span>
                <span className="sr-only"> / メンション {item.mentionCount}件</span>
              </>
            )}
            {showPreview && (
              <>
                <span className="ds-conversation-excerpt">{item.excerpt}</span>
                <span className="ds-hint">{item.updatedAt}</span>
              </>
            )}
          </a>
        </li>
      ))}
    </ul>
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
  label = "投稿一覧",
  savedIds = [],
  onSaveChange,
}: {
  messages: readonly ConversationMessage[];
  renderBody: (source: string) => ReactNode;
  onReply?: (message: ConversationMessage) => void;
  onEdit?: (message: ConversationMessage) => void;
  firstUnreadId?: string;
  label?: string;
  savedIds?: readonly string[];
  onSaveChange?: (message: ConversationMessage, saved: boolean) => void;
}) {
  return messages.length ? (
    <ol className="ds-message-list" aria-label={label}>
      {messages.map((message) => (
        <li key={message.id}>
          {firstUnreadId === message.id ? <p className="ds-unread-divider">ここから未読</p> : null}
          <article
            className="ds-message"
            data-message-id={message.id}
            tabIndex={-1}
            aria-label={
              message.unavailable ? "閲覧できない投稿" : `${message.author} / ${message.time}`
            }
          >
            {!message.unavailable && (
              <span className="ds-message-avatar" aria-hidden="true">
                {message.initials ?? message.author.slice(0, 1)}
              </span>
            )}
            <div className="ds-message-tools">
              {" "}
              {onSaveChange && !message.deleted && !message.unavailable ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  title={savedIds.includes(message.id) ? "保存を解除" : "保存する"}
                  aria-pressed={savedIds.includes(message.id)}
                  aria-label={`${savedIds.includes(message.id) ? "保存を解除" : "保存する"} / ${message.unavailable ? "閲覧できない投稿" : `${message.author}の投稿`}`}
                  onClick={() => onSaveChange(message, !savedIds.includes(message.id))}
                >
                  <Bookmark
                    aria-hidden="true"
                    fill={savedIds.includes(message.id) ? "currentColor" : "none"}
                  />
                </Button>
              ) : null}
              {message.canEdit && !message.deleted && !message.unavailable && onEdit ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="本文を編集"
                  title="本文を編集"
                  onClick={() => onEdit(message)}
                >
                  <Pencil aria-hidden="true" />
                </Button>
              ) : null}
            </div>
            {!message.unavailable ? (
              <header className="ds-message-meta">
                <strong>{message.author}</strong>
                <span className="ds-hint">{message.context}</span>
                <span className="ds-hint">{message.time}</span>
                {message.edited && !message.deleted && !message.unavailable ? (
                  <StatusBadge>編集済み</StatusBadge>
                ) : null}
              </header>
            ) : null}
            {message.unavailable ? (
              <p className="ds-hint">この投稿は閲覧できません。</p>
            ) : message.deleted ? (
              <p className="ds-hint">この投稿は削除されました。</p>
            ) : (
              <>
                <div className="ds-message-body">{renderBody(message.body)}</div>
                {message.reference}
                {message.attachments?.map((file, index) => (
                  <p key={index} className="ds-chat-reference">
                    {file.name}
                    <span className="ds-hint"> / {file.description}</span>
                  </p>
                ))}
              </>
            )}
            <div className="ds-message-actions">
              {onReply ? (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => onReply(message)}
                  aria-label={`${message.replyCount ? `返信 ${message.replyCount}件` : "返信する"}${message.unreadReplies ? ` / 未読 ${message.unreadReplies}件` : ""} / ${message.unavailable ? "閲覧できない投稿" : `${message.author}の投稿`}`}
                >
                  <MessageCircle aria-hidden="true" />
                  {message.replyCount ? `返信 ${message.replyCount}件` : "返信する"}
                  {message.unreadReplies ? ` / 未読 ${message.unreadReplies}件` : ""}
                </Button>
              ) : null}
            </div>
          </article>
        </li>
      ))}
    </ol>
  ) : (
    <EmptyState title="まだ投稿がありません">最初のメッセージを入力できます。</EmptyState>
  );
}

export function ThreadPanel({
  parent,
  conversationTitle,
  children,
  renderBody,
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
  const id = useId();
  return (
    <section
      className="ds-thread-panel"
      aria-labelledby={id}
      onKeyDown={(event) => {
        if (
          event.key === "Escape" &&
          !event.defaultPrevented &&
          !event.nativeEvent.isComposing &&
          !(event.target instanceof HTMLElement && event.target.closest("[role=dialog]"))
        ) {
          event.preventDefault();
          onClose();
        }
      }}
    >
      <header className="ds-thread-heading">
        <div>
          <h2 id={id} tabIndex={-1}>
            スレッド
          </h2>
          {conversationTitle && <p className="ds-hint">{conversationTitle}</p>}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="元の投稿へ戻る"
          title="元の投稿へ戻る"
          onClick={onClose}
        >
          <X aria-hidden="true" />
        </Button>
      </header>
      {actions && <div className="ds-thread-return">{actions}</div>}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        aria-pressed={followed}
        onClick={() => onFollowChange(!followed)}
      >
        {followed ? "フォロー中" : "スレッドをフォロー"}
      </Button>
      <section aria-label="親投稿">
        <MessageList messages={[parent]} renderBody={renderBody} />
      </section>
      {children}
    </section>
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

/** Entries refer to an original message. Unavailable entries never render its metadata or excerpt. */
export function MessageResultList({
  items,
  label,
  hrefFor,
  onOpen,
  onRemove,
  highlight = "",
  disabled = false,
  removingIds = [],
}: {
  items: readonly MessageResult[];
  label: string;
  hrefFor: (item: MessageResult) => string;
  onOpen?: (item: MessageResult) => void;
  onRemove?: (item: MessageResult) => void;
  highlight?: string;
  disabled?: boolean;
  removingIds?: readonly string[];
}) {
  function excerpt(value: string) {
    if (!highlight.trim()) return value;
    const index = value.toLocaleLowerCase().indexOf(highlight.toLocaleLowerCase());
    return index < 0 ? (
      value
    ) : (
      <>
        {value.slice(0, index)}
        <mark className="ds-message-match">{value.slice(index, index + highlight.length)}</mark>
        {value.slice(index + highlight.length)}
      </>
    );
  }
  return (
    <ul className="ds-message-results" aria-label={label}>
      {items.map((item) => (
        <li key={item.id} className="ds-message-result" data-result-id={item.id}>
          {item.available === false ? (
            <div>
              <p>この投稿は閲覧できません。</p>
              <p className="ds-hint">
                {item.unavailableReason ?? "元の投稿が利用できなくなりました。"}
              </p>
            </div>
          ) : (
            <a
              href={disabled ? undefined : hrefFor(item)}
              aria-disabled={disabled || undefined}
              className="ds-message-result-link"
              onClick={
                onOpen
                  ? (event) => {
                      if (
                        event.button !== 0 ||
                        event.metaKey ||
                        event.ctrlKey ||
                        event.shiftKey ||
                        event.altKey
                      )
                        return;
                      event.preventDefault();
                      if (!disabled) onOpen(item);
                    }
                  : undefined
              }
            >
              <span className="ds-conversation-title">
                {item.conversationTitle}
                {item.parentId ? " / スレッド" : " / 投稿"}
              </span>
              <span className="ds-hint">
                {item.author} / {item.time}
              </span>
              <span>{excerpt(item.excerpt)}</span>
              {item.unread !== undefined ? (
                <span className="ds-hint">{item.unread ? "未読" : "確認済み"}</span>
              ) : null}
              <span className="ds-result-action">
                {item.parentId ? "返信を開く" : "投稿を開く"}
              </span>
            </a>
          )}
          {onRemove ? (
            <Button
              type="button"
              variant="ghost"
              disabled={disabled}
              pending={removingIds.includes(item.id)}
              onClick={() => {
                if (!disabled && !removingIds.includes(item.id)) onRemove(item);
              }}
              aria-label={
                item.available === false
                  ? `${removingIds.includes(item.id) ? "保存を解除中" : "保存を解除"} / 閲覧できない項目`
                  : `${removingIds.includes(item.id) ? "保存を解除中" : "保存を解除"} / ${item.conversationTitle} / ${item.author} / ${item.time}`
              }
            >
              {removingIds.includes(item.id) ? "保存を解除中" : "保存を解除"}
            </Button>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

/** Slots keep navigation and application data outside of the responsive layout. */
export function ConversationLayout({
  view,
  list,
  conversation,
  thread,
  discovery,
  showDiscovery = false,
  toolbar,
}: {
  discovery?: ReactNode;
  toolbar?: ReactNode;
  showDiscovery?: boolean;
  view: "list" | "conversation" | "thread";
  list: ReactNode;
  conversation: ReactNode;
  thread?: ReactNode;
}) {
  return (
    <div className="ds-conversation-shell" data-view={view}>
      {toolbar && <div className="ds-conversation-topbar">{toolbar}</div>}
      <div
        className="ds-conversation-layout"
        data-view={view}
        data-thread={Boolean(thread)}
        data-discovery={showDiscovery}
      >
        <div className="ds-conversation-list-pane">{list}</div>
        {discovery && (
          <div className="ds-conversation-discovery-pane" hidden={!showDiscovery}>
            {discovery}
          </div>
        )}
        <div className="ds-conversation-body-pane" hidden={showDiscovery}>
          {conversation}
        </div>
        {thread ? <div className="ds-conversation-thread-pane">{thread}</div> : null}
      </div>
    </div>
  );
}

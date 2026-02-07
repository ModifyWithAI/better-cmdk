export {
  Command,
  CommandDialogContent,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
} from "./components/ui/command"

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "./components/ui/dialog"

export { Button, buttonVariants } from "./components/ui/button"

export { cn } from "./lib/utils"

// Command Menu components
export {
  CommandMenu,
  CommandMenu as CommandDialog,
  CommandContent,
  CommandInput,
  CommandEmpty,
  CommandList,
} from "./components/ui/command-menu"
export type {
  CommandMenuProps,
  CommandMenuCorners,
  CommandInputProps,
  CommandEmptyProps,
  CommandListProps,
  CommandAction,
  CommandActionOption,
  CommandDefinition,
} from "./components/ui/command-menu"

// Chat components
export {
  ChatMessageList,
  ChatLoading,
  ChatEmpty,
} from "./components/ui/chat"
export type {
  ChatMessageListProps,
  ChatLoadingProps,
  ChatEmptyProps,
} from "./components/ui/chat"

// Rich message components
export {
  Message,
  MessageContent,
  MessageResponse,
} from "./components/ui/message"
export type {
  MessageProps,
  MessageContentProps,
  MessageResponseProps,
} from "./components/ui/message"

export {
  AssistantMessages,
} from "./components/ui/assistant-messages"
export type {
  AssistantMessagesProps,
} from "./components/ui/assistant-messages"

export {
  Confirmation,
  ConfirmationTitle,
  ConfirmationRequest,
  ConfirmationAccepted,
  ConfirmationRejected,
  ConfirmationActions,
  ConfirmationAction,
} from "./components/ui/confirmation"
export type {
  ConfirmationProps,
  ConfirmationTitleProps,
  ConfirmationRequestProps,
  ConfirmationAcceptedProps,
  ConfirmationRejectedProps,
  ConfirmationActionsProps,
  ConfirmationActionProps,
  ToolUIPartApproval,
} from "./components/ui/confirmation"

export {
  Task,
  TaskTrigger,
  TaskContent,
  TaskItem,
  TaskItemFile,
} from "./components/ui/task"
export type {
  TaskProps,
  TaskTriggerProps,
  TaskContentProps,
  TaskItemProps,
  TaskItemFileProps,
} from "./components/ui/task"

export {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "./components/ui/collapsible"

export {
  AssistantFormRenderer,
  defaultFormRegistry,
} from "./components/ui/form-renderer"
export type {
  AssistantFormRendererProps,
} from "./components/ui/form-renderer"

// Command Menu context and hooks
export {
  CommandMenuProvider,
  CommandMenuContext,
  useCommandMenuContext,
} from "./context/command-menu-context"
export type {
  CommandMenuMode,
  CommandMenuStatus,
  CommandMenuContextValue,
  CommandMenuProviderProps,
  ExternalChat,
} from "./context/command-menu-context"

// Chat history
export { useChatHistory } from "./hooks/use-chat-history"
export type {
  ChatConversation,
  UseChatHistoryOptions,
  UseChatHistoryReturn,
} from "./hooks/use-chat-history"

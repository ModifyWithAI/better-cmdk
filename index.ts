export type { AssistantMessagesProps } from "./components/ui/assistant-messages"
export { AssistantMessages } from "./components/ui/assistant-messages"

export { Button, buttonVariants } from "./components/ui/button"
export type {
    ChatEmptyProps,
    ChatLoadingProps,
    ChatMessageListProps,
} from "./components/ui/chat"
// Chat components
export {
    ChatEmpty,
    ChatLoading,
    ChatMessageList,
} from "./components/ui/chat"
export {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "./components/ui/collapsible"
export {
    Command,
    CommandDialogContent,
    CommandGroup,
    CommandItem,
    CommandSeparator,
    CommandShortcut,
} from "./components/ui/command"
export type {
    CommandAction,
    CommandActionOption,
    CommandDefinition,
    CommandEmptyProps,
    CommandInputProps,
    CommandListProps,
    CommandMenuCorners,
    CommandMenuProps,
} from "./components/ui/command-menu"
// Command Menu components
export {
    CommandContent,
    CommandEmpty,
    CommandInput,
    CommandList,
    CommandMenu,
    CommandMenu as CommandDialog,
} from "./components/ui/command-menu"
export type {
    ConfirmationAcceptedProps,
    ConfirmationActionProps,
    ConfirmationActionsProps,
    ConfirmationProps,
    ConfirmationRejectedProps,
    ConfirmationRequestProps,
    ConfirmationTitleProps,
    ToolUIPartApproval,
} from "./components/ui/confirmation"
export {
    Confirmation,
    ConfirmationAccepted,
    ConfirmationAction,
    ConfirmationActions,
    ConfirmationRejected,
    ConfirmationRequest,
    ConfirmationTitle,
} from "./components/ui/confirmation"
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
export type { AssistantFormRendererProps } from "./components/ui/form-renderer"
export {
    AssistantFormRenderer,
    defaultFormRegistry,
} from "./components/ui/form-renderer"
export type {
    MessageContentProps,
    MessageProps,
    MessageResponseProps,
} from "./components/ui/message"
// Rich message components
export {
    Message,
    MessageContent,
    MessageResponse,
} from "./components/ui/message"
export type {
    TaskContentProps,
    TaskItemFileProps,
    TaskItemProps,
    TaskProps,
    TaskTriggerProps,
} from "./components/ui/task"
export {
    Task,
    TaskContent,
    TaskItem,
    TaskItemFile,
    TaskTrigger,
} from "./components/ui/task"
export type {
    CommandMenuContextValue,
    CommandMenuMode,
    CommandMenuProviderProps,
    CommandMenuStatus,
    ExternalChat,
} from "./context/command-menu-context"

// Command Menu context and hooks
export {
    CommandMenuContext,
    CommandMenuProvider,
    useCommandMenuContext,
} from "./context/command-menu-context"
export type {
    ChatConversation,
    UseChatHistoryOptions,
    UseChatHistoryReturn,
} from "./hooks/use-chat-history"

// Chat history
export { useChatHistory } from "./hooks/use-chat-history"
export { cn } from "./lib/utils"

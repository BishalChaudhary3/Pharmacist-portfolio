"use client";

import { useState, useTransition } from "react";
import {
  Mail,
  MailOpen,
  Archive,
  ArchiveRestore,
  Trash2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { formatDate } from "@/lib/utils";
import {
  markMessageAsRead,
  archiveMessage,
  unarchiveMessage,
  deleteMessage,
} from "@/lib/actions/messages";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  createdAt: Date;
}

export function MessagesList({ messages: initial }: { messages: Message[] }) {
  const [messages, setMessages] = useState(initial);
  const [selected, setSelected] = useState<Message | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Message | null>(null);
  const [pending, startTransition] = useTransition();
  const { toast } = useToast();

  const open = (msg: Message) => {
    setSelected(msg);
    if (msg.status === "UNREAD") {
      startTransition(async () => {
        await markMessageAsRead(msg.id);
        setMessages((prev) =>
          prev.map((m) => (m.id === msg.id ? { ...m, status: "READ" } : m))
        );
      });
    }
  };

  const handleArchive = (msg: Message) => {
    startTransition(async () => {
      if (msg.status === "ARCHIVED") {
        await unarchiveMessage(msg.id);
      } else {
        await archiveMessage(msg.id);
      }
      setMessages((prev) =>
        prev.map((m) =>
          m.id === msg.id
            ? { ...m, status: msg.status === "ARCHIVED" ? "READ" : "ARCHIVED" }
            : m
        )
      );
      setSelected(null);
      toast({
        variant: "success",
        title: msg.status === "ARCHIVED" ? "Restored" : "Archived",
      });
    });
  };

  const handleDelete = () => {
    if (!confirmDelete) return;
    startTransition(async () => {
      await deleteMessage(confirmDelete.id);
      setMessages((prev) => prev.filter((m) => m.id !== confirmDelete.id));
      toast({ variant: "success", title: "Message deleted" });
      setConfirmDelete(null);
      setSelected(null);
    });
  };

  if (messages.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-white p-12 text-center">
        <Mail className="mx-auto h-8 w-8 text-slate-300" />
        <p className="mt-3 text-slate-600">No messages here.</p>
      </div>
    );
  }

  return (
    <>
      <ul className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        {messages.map((msg) => (
          <li
            key={msg.id}
            className="flex items-center gap-4 border-b border-slate-100 px-4 py-3 last:border-b-0 hover:bg-slate-50"
          >
            <div className="w-5">
              {msg.status === "UNREAD" ? (
                <Mail className="h-4 w-4 text-primary" />
              ) : (
                <MailOpen className="h-4 w-4 text-slate-400" />
              )}
            </div>

            <button
              type="button"
              onClick={() => open(msg)}
              className="flex-1 text-left"
            >
              <div className="flex items-center gap-2">
                <p
                  className={
                    msg.status === "UNREAD"
                      ? "text-sm font-semibold text-slate-900"
                      : "text-sm text-slate-700"
                  }
                >
                  {msg.name}
                </p>
                {msg.status === "UNREAD" && (
                  <Badge variant="default" className="text-[10px]">
                    New
                  </Badge>
                )}
              </div>
              <p className="mt-0.5 truncate text-sm text-slate-600">{msg.subject}</p>
              <p className="mt-0.5 text-xs text-slate-400">
                {formatDate(msg.createdAt)}
              </p>
            </button>

            <div className="flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleArchive(msg)}
                aria-label={msg.status === "ARCHIVED" ? "Restore" : "Archive"}
              >
                {msg.status === "ARCHIVED" ? (
                  <ArchiveRestore className="h-3.5 w-3.5" />
                ) : (
                  <Archive className="h-3.5 w-3.5" />
                )}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setConfirmDelete(msg)}
                className="text-red-600 hover:bg-red-50"
                aria-label="Delete"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </li>
        ))}
      </ul>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selected?.subject}</DialogTitle>
            <DialogDescription>
              From <strong>{selected?.name}</strong> &lt;{selected?.email}&gt;
              {selected && ` · ${formatDate(selected.createdAt)}`}
            </DialogDescription>
          </DialogHeader>

          {selected && (
            <div className="space-y-4">
              <div className="whitespace-pre-wrap rounded-md bg-slate-50 p-4 text-sm text-slate-700">
                {selected.message}
              </div>
              <div className="flex justify-end gap-2">
                <a
                  href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(
                    selected.subject
                  )}`}
                  className="inline-flex h-11 items-center rounded-md bg-primary px-6 text-sm font-medium text-white hover:bg-primary/90"
                >
                  Reply by email
                </a>
                <Button
                  variant="outline"
                  onClick={() => handleArchive(selected)}
                  disabled={pending}
                >
                  {selected.status === "ARCHIVED" ? "Restore" : "Archive"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!confirmDelete}
        onOpenChange={(o) => !o && setConfirmDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete message?</DialogTitle>
            <DialogDescription>
              This will permanently remove the message from &ldquo;{confirmDelete?.name}
              &rdquo;.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={pending}>
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
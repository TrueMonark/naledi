"use client";
import { useTransition } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { Result } from "@/lib/actions/admin";

export function ConfirmDelete({ title, description, onConfirm, label, iconOnly }: {
  title: string; description?: string; onConfirm: () => Promise<Result>; label?: string; iconOnly?: boolean;
}) {
  const [pending, start] = useTransition();
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size={iconOnly ? "icon" : "sm"} className="text-destructive hover:bg-destructive/10 hover:text-destructive" aria-label={label ?? "Delete"}>
          {pending ? <Loader2 className="animate-spin" /> : <Trash2 />}{!iconOnly && (label ?? "Delete")}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description ?? "This can't be undone."}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => start(async () => {
            const r = await onConfirm();
            if (r.ok) toast.success(r.message ?? "Done"); else toast.error(r.error);
          })}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

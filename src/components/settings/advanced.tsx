import { Loader2, Send, Users } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { Textarea } from "../ui/textarea";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { FormEvent, useMemo, useState } from "react";
import { MultiComboBox } from "../multicombobox";
import { useUsers } from "@/hooks/useUsers";
import { toast } from "@/hooks/use-toast";
import { useCreateAdvisory, useUNISURLs, useUpdateUNISURL } from "@/hooks/useSettings";

const Advanced = () => {
  return (
    <section className="space-y-4 pb-4">
      <h1 className="font-bold text-lg bg-white">Advanced Settings</h1>
      <div className="space-y-8">
        <SendAdvisory />
        <UNISSource />
      </div>
    </section>
  );
};

const UNISSource = () => {
  const { data, isLoading } = useUNISURLs();
  const { mutate } = useUpdateUNISURL()

  const paths = useMemo(() => {
    if (!data || isLoading) return [];

    return data;
  }, [data, isLoading])

  return <div className="space-y-2">
    <h2 className="font-semibold border-l-4 border-main-500 px-2">
      UNIS Source
    </h2>
    <Separator />
    <p className="text-sm">UNIS url path to be used for APIs and images.</p>
    <RadioGroup onValueChange={(value) => {
      const updatedPaths = paths.map(item => {
        return {
          ...item,
          status: item.path === value ? 1 : 0
        }
      })

      mutate(updatedPaths)
    }}>
      {paths &&
        paths.map(item => {
          return <div key={item.ID} className="flex items-center gap-2">
            <RadioGroupItem id={item.path} value={item.path} checked={Boolean(item.status)} />
            <Label htmlFor={item.path}>{item.path}</Label>
          </div>
        })}
    </RadioGroup>
  </div >
}

const SendAdvisory = () => {
  const [recipientIds, setRecipientIds] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const { data: users = [], isPending: isUsersLoading, isError: isUsersError } = useUsers();
  const { mutate, isPending: isSending } = useCreateAdvisory();

  const userOptions = useMemo(() => users.map((user) => ({
    id: String(user.ID),
    label: `${user.first_name} ${user.last_name}`.trim(),
    value: `${user.ID} ${user.first_name} ${user.last_name} ${user.email_address}`,
  })), [users]);
  const selectedUsers = userOptions.filter((user) => recipientIds.includes(user.id));
  const recipientCount = selectedUsers.length;

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSending) return;

    if (!recipientCount || !title.trim() || !content.trim()) {
      toast({
        variant: "destructive",
        description: "Select at least one user and enter a subject and message.",
      });
      return;
    }

    mutate({
      receipient: selectedUsers.map((user) => user.id).join(","),
      title: title.trim(),
      content: content.trim(),
    }, {
      onSuccess: (data) => {
        if (data.acknowledged) {
          setRecipientIds([]);
          setTitle("");
          setContent("");
        }
      },
    });
  };

  return (
    <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
      <div className="flex items-start gap-3 border-b bg-slate-50 px-5 py-4">
        <div>
          <h2 className="font-semibold text-slate-900">Send advisory</h2>
          <p className="mt-1 text-sm text-slate-500">Share an announcement or important update with your team.</p>
        </div>
      </div>
      <form onSubmit={onSubmit}>
        <fieldset disabled={isSending} className="min-w-0 space-y-5 p-5">
          <div className="space-y-2">
            <Label id="advisory-recipients-label" className="flex items-center gap-2">
              <Users className="size-4 text-slate-400" /> To
            </Label>
            <div role="group" aria-labelledby="advisory-recipients-label" aria-describedby="advisory-recipients-help">
              <MultiComboBox
                title="users"
                list={userOptions}
                value={selectedUsers}
                disabled={isUsersLoading || isUsersError || isSending}
                setValue={(id, action) => setRecipientIds((previous) =>
                  action === "remove" || previous.includes(id)
                    ? previous.filter((value) => value !== id)
                    : [...previous, id]
                )}
              />
            </div>
            <p id="advisory-recipients-help" className={`text-xs ${isUsersError ? "text-red-600" : "text-slate-500"}`}>
              {isUsersLoading ? "Loading users..." : isUsersError ? "Unable to load users. Please try again later." : !userOptions.length ? "No users available." : "Search by name or email and select one or more recipients."}
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="advisory-title">Subject</Label>
            <Input id="advisory-title" placeholder="What is this advisory about?" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="advisory-content">Message</Label>
            <Textarea id="advisory-content" className="min-h-44 resize-y" placeholder="Write your announcement, include the details your recipients need, and any next steps..." value={content} onChange={(e) => setContent(e.target.value)} required />
          </div>
        </fieldset>
        <div className="flex flex-col gap-3 border-t bg-slate-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500" role="status">
            {recipientCount ? `${recipientCount} recipient${recipientCount === 1 ? "" : "s"} selected` : "Choose recipients to get started"}
          </p>
          <Button type="submit" className="gap-2" disabled={isSending || isUsersLoading || isUsersError || !recipientCount || !title.trim() || !content.trim()}>
            {isSending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            {isSending ? "Sending..." : "Send advisory"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Advanced;

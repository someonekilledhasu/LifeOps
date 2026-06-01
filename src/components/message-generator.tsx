"use client";

import { useState } from "react";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Clipboard, Download, History, Loader2, MessageSquareText, RefreshCw, Save, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { messageInputSchema } from "@/lib/validators";
import type { GeneratedMessageRecord, MessageResult } from "@/lib/types";
import type { z } from "zod";

const situations = ["Asking for deadline extension", "Declining invitation", "Internship inquiry", "Following up on application", "Sick leave", "Apology", "Asking for help", "Professional thank you", "Custom"];
type FormValues = z.infer<typeof messageInputSchema>;

export function MessageGenerator({ initialHistory }: { initialHistory: GeneratedMessageRecord[] }) {
  const [draft, setDraft] = useState<MessageResult | null>(null);
  const [history, setHistory] = useState(initialHistory);
  const [source, setSource] = useState<"ai" | "fallback" | null>(null);
  const [active, setActive] = useState<"body" | "shortVersion" | "polished">("body");
  const [saved, setSaved] = useState(false);
  const { register, handleSubmit, getValues, formState: { errors, isSubmitting } } = useForm<FormValues>({ resolver: zodResolver(messageInputSchema), defaultValues: { situation: "Asking for deadline extension", tone: "Polite", recipient: "", context: "" } });

  async function generate(values: FormValues) {
    const response = await fetch("/api/messages/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
    const data = await response.json();
    if (!response.ok) return toast.error(data.error ?? "Could not draft your message.");
    setDraft(data.message);
    setSource(data.source);
    setSaved(false);
    setActive("body");
    toast.success("Your draft is ready.");
  }

  async function save() {
    if (!draft) return;
    const response = await fetch("/api/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...getValues(), ...draft }) });
    const data = await response.json();
    if (!response.ok) return toast.error(data.error ?? "Could not save your message.");
    setSaved(true);
    setHistory((current) => [data.message, ...current].slice(0, 20));
    toast.success("Message saved.");
  }

  async function copy() {
    if (!draft) return;
    await navigator.clipboard.writeText(draft[active]);
    toast.success("Copied to clipboard.");
  }

  function download() {
    if (!draft) return;
    const blob = new Blob([`${draft.subject ? `Subject: ${draft.subject}\n\n` : ""}${draft[active]}`], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "lifeops-message.txt";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mx-auto max-w-7xl p-5 sm:p-7 lg:p-9">
      <div><p className="text-sm font-semibold text-primary">Message generator</p><h1 className="mt-1 text-3xl font-bold tracking-tight">Help me say this.</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">For the messages you keep rewriting in your head. Add the context once, then choose the version that feels like you.</p></div>
      <div className="mt-7 grid gap-5 lg:grid-cols-[0.86fr_1.14fr]">
        <Card>
          <CardHeader><CardTitle>What needs saying?</CardTitle></CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit(generate)}>
              <Field label="Situation" error={errors.situation?.message}><Select {...register("situation")}>{situations.map((situation) => <option key={situation}>{situation}</option>)}</Select></Field>
              <Field label="Tone" error={errors.tone?.message}><Select {...register("tone")}><option>Formal</option><option>Friendly</option><option>Casual</option><option>Polite</option><option>Confident</option></Select></Field>
              <Field label="Recipient" error={errors.recipient?.message}><Input placeholder="Manager, friend, recruiter..." {...register("recipient")} /></Field>
              <Field label="Context" error={errors.context?.message}><Textarea className="min-h-36" placeholder="What happened, what do you need, and any detail worth preserving?" {...register("context")} /></Field>
              <Button className="w-full" size="lg" disabled={isSubmitting}>{isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Sparkles className="h-4 w-4" /> Generate message</>}</Button>
            </form>
          </CardContent>
        </Card>
        {draft ? (
          <Card>
            <CardHeader className="gap-3">
              <div className="flex flex-wrap items-center justify-between gap-2"><CardTitle>Your ready-to-send draft</CardTitle>{source === "fallback" && <Badge>Smart fallback draft</Badge>}</div>
              <div className="flex flex-wrap gap-2">
                {([["body", "Standard"], ["shortVersion", "Short"], ["polished", "Polished"]] as const).map(([key, label]) => <Button key={key} size="sm" type="button" variant={active === key ? "default" : "outline"} onClick={() => setActive(key)}>{label}</Button>)}
              </div>
            </CardHeader>
            <CardContent>
              <Label>Subject line</Label><Input className="mt-2" value={draft.subject} onChange={(event) => setDraft({ ...draft, subject: event.target.value })} />
              <Label className="mt-4 block">Message</Label><Textarea className="mt-2 min-h-64 leading-6" value={draft[active]} onChange={(event) => setDraft({ ...draft, [active]: event.target.value })} />
              <div className="mt-4 flex flex-wrap gap-2">
                <Button onClick={() => void copy()}><Clipboard className="h-4 w-4" /> Copy</Button>
                <Button variant="outline" onClick={() => void save()} disabled={saved}>{saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}{saved ? "Saved" : "Save"}</Button>
                <Button variant="outline" onClick={() => void generate(getValues())}><RefreshCw className="h-4 w-4" /> Regenerate</Button>
                <Button variant="outline" onClick={download}><Download className="h-4 w-4" /> Download</Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="flex min-h-[450px] items-center justify-center border-dashed bg-pink-50 dark:bg-pink-950">
            <CardContent className="max-w-sm p-8 text-center"><div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-pink-500/10 text-pink-600"><MessageSquareText className="h-7 w-7" /></div><h2 className="mt-5 font-bold">Your words will land here</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Choose the situation, add the human detail, and LifeOps will write a draft you can still make your own.</p></CardContent>
          </Card>
        )}
      </div>
      <div className="mt-10">
        <div className="flex items-center gap-2"><History className="h-5 w-5 text-primary" /><h2 className="font-bold">Message history</h2></div>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {history.map((message) => <button key={message.id} className="rounded-2xl border bg-card p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md" onClick={() => { setDraft(message); setSaved(true); setActive("body"); }}><p className="text-xs text-muted-foreground">{format(new Date(message.createdAt), "d MMM, h:mm a")}</p><p className="mt-2 truncate font-semibold">{message.subject || message.situation}</p><p className="mt-1 line-clamp-2 text-sm leading-5 text-muted-foreground">{message.body}</p></button>)}
          {!history.length && <p className="text-sm text-muted-foreground">Saved drafts will collect here.</p>}
        </div>
      </div>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) { return <div className="space-y-2"><Label>{label}</Label>{children}{error && <p className="text-xs text-destructive">{error}</p>}</div>; }

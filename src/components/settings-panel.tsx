"use client";

import { useState } from "react";
import { useEffect } from "react";
import { useTheme } from "next-themes";
import { Loader2, Moon, Save, ShieldCheck, Sun, UserRound, Bell } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

type Settings = {
  name: string;
  email: string;
  monthlyBudget: number;
  currency: string;
  dietaryPreference: string;
  favoriteCuisines: string[];
  darkMode: boolean;
};

export function SettingsPanel({ initial, demo }: { initial: Settings; demo: boolean }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [form, setForm] = useState({ ...initial, cuisines: initial.favoriteCuisines.join(", ") });
  const [pending, setPending] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);

  useEffect(() => {
    if ("Notification" in window && "serviceWorker" in navigator) {
      setPushEnabled(Notification.permission === "granted");
    }
  }, []);

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const handleEnablePush = async () => {
    if (!("Notification" in window) || !("serviceWorker" in navigator)) {
      toast.error("Push notifications are not supported in this browser.");
      return;
    }
    setPushLoading(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        toast.error("Permission denied for push notifications.");
        setPushLoading(false);
        return;
      }

      const registration = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidKey) throw new Error("VAPID key not found in environment");

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey)
      });

      await fetch("/api/notifications/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription })
      });

      setPushEnabled(true);
      toast.success("Push notifications enabled!");
    } catch (error) {
      console.error("Error enabling push:", error);
      toast.error("Failed to enable push notifications.");
    }
    setPushLoading(false);
  };

  const handleTestPush = () => {
    toast.promise(
      fetch("/api/notifications/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Test Notification", body: "It works!" })
      }).then(res => {
        if (!res.ok) throw new Error();
        return res;
      }),
      {
        loading: "Sending...",
        success: "Test notification sent!",
        error: "Failed to send notification (ensure you enabled them!)"
      }
    );
  };

  async function save() {
    setPending(true);
    const response = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, favoriteCuisines: form.cuisines.split(",").map((item) => item.trim()).filter(Boolean) }),
    });
    const data = await response.json();
    setPending(false);
    if (!response.ok) return toast.error(data.error ?? "Could not save your settings.");
    toast.success(demo ? "Guest settings updated for this visit." : "Settings saved.");
  }

  return (
    <div className="mx-auto max-w-4xl p-5 sm:p-7 lg:p-9">
      <div><p className="text-sm font-semibold text-primary">Settings</p><h1 className="mt-1 text-3xl font-bold tracking-tight">Make LifeOps yours.</h1><p className="mt-2 text-sm leading-6 text-muted-foreground">A few preferences help the tools make better first guesses.</p></div>
      <div className="mt-7 space-y-5">
        <Card>
          <CardHeader><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-pink-500/10 text-pink-600"><UserRound className="h-5 w-5" /></div><div><CardTitle>Profile</CardTitle><p className="text-sm text-muted-foreground">The basics for your workspace.</p></div></div></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Field label="Name"><Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></Field>
            <Field label="Email address"><Input value={form.email} disabled /></Field>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-rose-500/10 text-rose-600"><ShieldCheck className="h-5 w-5" /></div><div><CardTitle>Everyday preferences</CardTitle><p className="text-sm text-muted-foreground">Used for score context and food suggestions.</p></div></div></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Field label="Monthly budget"><Input type="number" value={form.monthlyBudget} onChange={(event) => setForm({ ...form, monthlyBudget: Number(event.target.value) })} /></Field>
            <Field label="Preferred currency"><Select value={form.currency} onChange={(event) => setForm({ ...form, currency: event.target.value })}><option>INR</option><option>USD</option><option>EUR</option><option>GBP</option><option>SGD</option></Select></Field>
            <Field label="Dietary preference"><Select value={form.dietaryPreference} onChange={(event) => setForm({ ...form, dietaryPreference: event.target.value })}><option value="flexible">Flexible</option><option value="vegetarian">Vegetarian</option><option value="non-vegetarian">Non-vegetarian</option><option value="vegan">Vegan</option></Select></Field>
            <Field label="Favorite cuisines"><Input placeholder="Indian, Asian, Mediterranean" value={form.cuisines} onChange={(event) => setForm({ ...form, cuisines: event.target.value })} /></Field>
            <div className="flex items-center justify-between rounded-2xl border border-pink-300 bg-pink-100 p-3 dark:border-pink-800 dark:bg-pink-950 sm:col-span-2">
              <div className="flex items-center gap-3">
                {resolvedTheme === "dark" ? <Moon className="h-5 w-5 text-primary" /> : <Sun className="h-5 w-5 text-primary" />}
                <div><p className="text-sm font-medium">Coquette night mode</p><p className="text-xs text-muted-foreground">Switch between baby pink and a deep berry evening palette.</p></div>
              </div>
              <button type="button" aria-label="Toggle dark mode" className={`relative h-7 w-12 rounded-full transition ${resolvedTheme === "dark" ? "bg-primary" : "bg-pink-300"}`} onClick={() => { const darkMode = resolvedTheme !== "dark"; setTheme(darkMode ? "dark" : "light"); setForm({ ...form, darkMode }); }}><span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${resolvedTheme === "dark" ? "left-6" : "left-1"}`} /></button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-500/10 text-blue-600"><Bell className="h-5 w-5" /></div><div><CardTitle>Notifications</CardTitle><p className="text-sm text-muted-foreground">Get daily reminders to log expenses and check your score.</p></div></div></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Button onClick={handleEnablePush} disabled={pushLoading || pushEnabled} variant={pushEnabled ? "secondary" : "default"}>
                {pushLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {pushEnabled ? "Push Notifications Enabled" : "Enable Push Notifications"}
              </Button>
            </div>
            <div className="flex flex-col gap-2">
              <Button onClick={handleTestPush} disabled={!pushEnabled} variant="outline">
                Test Notification
              </Button>
            </div>
          </CardContent>
        </Card>
        <div className="flex justify-end"><Button onClick={() => void save()} disabled={pending}>{pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save settings</Button></div>
        <Card>
          <CardHeader><CardTitle>Open workspace mode</CardTitle><p className="text-sm text-muted-foreground">LifeOps is currently available without an account. Changes work during your visit and the sample dashboard stays ready to explore.</p></CardHeader>
        </Card>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <div className="space-y-2"><Label>{label}</Label>{children}</div>; }

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { BrainCircuit, Download, FileUp, Loader2, Pencil, Plus, Search, Sparkles, Trash2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { dateWithin, spendingAnalytics } from "@/lib/expenses";
import { predictRegret } from "@/lib/premium-insights";
import { expenseSchema } from "@/lib/validators";
import { expenseCategories, type ExpenseRecord } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import type { z } from "zod";

const colors = ["#d95788", "#f08bab", "#c95d87", "#f7b2c8", "#b9688f", "#e899b3", "#9e5678", "#f4c6d4", "#d08aa7", "#a8788d"];
type ExpenseFormInput = z.input<typeof expenseSchema>;
type ExpenseForm = z.output<typeof expenseSchema>;

export function MoneyAnalyzer({ initialExpenses }: { initialExpenses: ExpenseRecord[] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const [expenses, setExpenses] = useState(initialExpenses);
  const [dialog, setDialog] = useState<ExpenseRecord | "new" | null>(null);
  const [uploading, setUploading] = useState(false);
  const [filters, setFilters] = useState({ search: "", category: "All", from: "", to: "" });
  const uploadRef = useRef<HTMLInputElement>(null);
  const filtered = useMemo(() => expenses.filter((expense) => {
    const search = filters.search.toLowerCase();
    return (!search || `${expense.merchant} ${expense.notes ?? ""}`.toLowerCase().includes(search))
      && (filters.category === "All" || expense.category === filters.category)
      && dateWithin(expense.date, filters.from, filters.to);
  }), [expenses, filters]);
  const analytics = spendingAnalytics(expenses);
  const subscriptions = expenses.filter((expense) => expense.category === "Subscriptions");
  const unusual = [...expenses].sort((a, b) => b.amount - a.amount)[0];

  async function remove(expense: ExpenseRecord) {
    if (!window.confirm(`Delete the ${formatCurrency(expense.amount)} expense at ${expense.merchant}?`)) return;
    const response = await fetch(`/api/expenses/${expense.id}`, { method: "DELETE" });
    if (!response.ok) return toast.error("Could not delete that expense.");
    setExpenses((current) => current.filter((item) => item.id !== expense.id));
    toast.success("Expense deleted.");
  }

  async function upload(file?: File) {
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.set("file", file);
    const response = await fetch("/api/expenses/upload", { method: "POST", body: formData });
    const data = await response.json();
    setUploading(false);
    if (!response.ok) return toast.error(data.error ?? "Could not import that CSV file.");
    setExpenses((current) => [...data.expenses, ...current]);
    toast.success(`${data.expenses.length} expenses imported.`);
    if (uploadRef.current) uploadRef.current.value = "";
  }

  return (
    <div className="mx-auto max-w-7xl p-5 sm:p-7 lg:p-9">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-sm font-semibold text-primary">Money analyzer</p><h1 className="mt-1 text-3xl font-bold tracking-tight">Where did my money go?</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Bring in a statement or add things as you go. LifeOps turns the list into a picture you can use.</p></div>
        <div className="flex flex-wrap gap-2">
          <input ref={uploadRef} type="file" accept=".csv,text/csv" className="hidden" onChange={(event) => void upload(event.target.files?.[0])} />
          <Button variant="outline" onClick={() => uploadRef.current?.click()} disabled={uploading}>{uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Import CSV</Button>
          <Button onClick={() => setDialog("new")}><Plus className="h-4 w-4" /> Add expense</Button>
        </div>
      </div>

      <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Tracked spending" value={formatCurrency(analytics.total)} note={`${expenses.length} transactions`} />
        <Metric label="Biggest category" value={analytics.biggestCategory?.name ?? "None yet"} note={formatCurrency(analytics.biggestCategory?.value ?? 0)} />
        <Metric label="Food spending" value={`${analytics.foodPercentage}%`} note="of all tracked spend" />
        <Metric label="Recurring items" value={`${subscriptions.length}`} note="subscription charges" />
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <ChartCard title="Spending by category">
          {analytics.byCategory.length ? mounted ? <ResponsiveContainer width="100%" height="100%" minWidth={0}><PieChart><Pie data={analytics.byCategory} dataKey="value" nameKey="name" innerRadius={52} outerRadius={82} paddingAngle={3}>{analytics.byCategory.map((entry, index) => <Cell key={entry.name} fill={colors[index % colors.length]} />)}</Pie><Tooltip formatter={(value) => formatCurrency(Number(value))} /></PieChart></ResponsiveContainer> : <ChartSkeleton /> : <EmptyChart />}
        </ChartCard>
        <ChartCard title="Monthly spending">
          {analytics.byMonth.length ? mounted ? <ResponsiveContainer width="100%" height="100%" minWidth={0}><LineChart data={analytics.byMonth}><CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} /><XAxis dataKey="month" axisLine={false} tickLine={false} /><YAxis hide /><Tooltip formatter={(value) => formatCurrency(Number(value))} /><Line dataKey="amount" type="monotone" stroke="#d95788" strokeWidth={3} dot={{ fill: "#d95788" }} /></LineChart></ResponsiveContainer> : <ChartSkeleton /> : <EmptyChart />}
        </ChartCard>
        <ChartCard title="Top merchants">
          {analytics.topMerchants.length ? mounted ? <ResponsiveContainer width="100%" height="100%" minWidth={0}><BarChart data={analytics.topMerchants} layout="vertical"><XAxis type="number" hide /><YAxis dataKey="name" type="category" width={78} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} /><Tooltip formatter={(value) => formatCurrency(Number(value))} /><Bar dataKey="value" fill="#e1719a" radius={[0, 6, 6, 0]} /></BarChart></ResponsiveContainer> : <ChartSkeleton /> : <EmptyChart />}
        </ChartCard>
        <Card>
          <CardHeader><CardTitle>Useful signals</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Signal text={`${analytics.biggestCategory?.name ?? "No category"} is currently your biggest category.`} />
            <Signal text={analytics.highestDay ? `${analytics.highestDay.day} was your highest spending day at ${formatCurrency(analytics.highestDay.value)}.` : "Add a few expenses to find your highest spending day."} />
            <Signal text={unusual ? `${unusual.merchant} is your largest single expense at ${formatCurrency(unusual.amount)}.` : "Your unusual spending signal will appear here."} />
            <Signal text={`${analytics.foodPercentage}% of tracked spending went to food.`} />
          </CardContent>
        </Card>
      </div>

      <Card className="mt-5">
        <CardHeader className="gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><CardTitle>Expenses</CardTitle><Button asChild variant="outline" size="sm"><a href="/api/reports/expenses"><Download className="h-4 w-4" /> Export CSV</a></Button></div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
            <div className="relative"><Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" /><Input className="pl-9" placeholder="Search merchants or notes" value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} /></div>
            <Select value={filters.category} onChange={(event) => setFilters({ ...filters, category: event.target.value })}><option>All</option>{expenseCategories.map((category) => <option key={category}>{category}</option>)}</Select>
            <Input type="date" value={filters.from} onChange={(event) => setFilters({ ...filters, from: event.target.value })} />
            <Input type="date" value={filters.to} onChange={(event) => setFilters({ ...filters, to: event.target.value })} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wider text-muted-foreground"><tr className="border-b"><th className="pb-3 font-semibold">Date</th><th className="pb-3 font-semibold">Merchant</th><th className="pb-3 font-semibold">Category</th><th className="pb-3 font-semibold">Notes</th><th className="pb-3 text-right font-semibold">Amount</th><th className="pb-3 text-right font-semibold">Actions</th></tr></thead>
              <tbody>{filtered.map((expense) => <tr key={expense.id} className="border-b last:border-0"><td className="py-3 text-muted-foreground">{format(new Date(expense.date), "d MMM yy")}</td><td className="py-3 font-medium">{expense.merchant}</td><td className="py-3"><span className="rounded-full bg-muted px-2 py-1 text-xs">{expense.category}</span></td><td className="max-w-[220px] truncate py-3 text-muted-foreground">{expense.notes || "—"}</td><td className="py-3 text-right font-semibold">{formatCurrency(expense.amount)}</td><td className="py-3 text-right"><Button size="icon" variant="ghost" onClick={() => setDialog(expense)}><Pencil className="h-4 w-4" /></Button><Button size="icon" variant="ghost" onClick={() => void remove(expense)}><Trash2 className="h-4 w-4 text-destructive" /></Button></td></tr>)}</tbody>
            </table>
            {!filtered.length && <div className="py-10 text-center text-sm text-muted-foreground">No expenses match these filters.</div>}
          </div>
        </CardContent>
      </Card>
      {dialog && <ExpenseDialog expense={dialog} expenses={expenses} onClose={() => setDialog(null)} onSave={(expense) => { setExpenses((current) => dialog === "new" ? [expense, ...current] : current.map((item) => item.id === expense.id ? expense : item)); setDialog(null); }} />}
    </div>
  );
}

function ExpenseDialog({ expense, expenses, onClose, onSave }: { expense: ExpenseRecord | "new"; expenses: ExpenseRecord[]; onClose: () => void; onSave: (expense: ExpenseRecord) => void }) {
  const editing = expense !== "new";
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<ExpenseFormInput, unknown, ExpenseForm>({ resolver: zodResolver(expenseSchema), defaultValues: editing ? { ...expense, date: expense.date.slice(0, 10), notes: expense.notes ?? "" } : { date: format(new Date(), "yyyy-MM-dd"), merchant: "", amount: 0, category: "Other", notes: "" } });
  const watchedAmount = Number(watch("amount")) || 0;
  const watchedCategory = watch("category") ?? "Other";
  const watchedMerchant = watch("merchant") ?? "";
  const prediction = watchedAmount > 0 && watchedMerchant.trim().length >= 2
    ? predictRegret({ amount: watchedAmount, category: watchedCategory, merchant: watchedMerchant }, expenses.filter((item) => !editing || item.id !== expense.id))
    : null;
  async function save(values: ExpenseForm) {
    const response = await fetch(editing ? `/api/expenses/${expense.id}` : "/api/expenses", { method: editing ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
    const data = await response.json();
    if (!response.ok) return toast.error(data.error ?? "Could not save that expense.");
    onSave(data.expense);
    toast.success(editing ? "Expense updated." : "Expense added.");
  }
  return <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-pink-500/35 p-4"><Card className="my-6 w-full max-w-2xl shadow-2xl"><CardHeader className="flex-row items-center justify-between space-y-0"><CardTitle>{editing ? "Edit expense" : "Add expense"}</CardTitle><Button size="icon" variant="ghost" onClick={onClose}><X className="h-4 w-4" /></Button></CardHeader><CardContent><form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit(save)}><Field label="Date" error={errors.date?.message}><Input type="date" {...register("date")} /></Field><Field label="Merchant" error={errors.merchant?.message}><Input placeholder="Merchant name" {...register("merchant")} /></Field><Field label="Amount" error={errors.amount?.message}><Input type="number" step="0.01" {...register("amount")} /></Field><Field label="Category" error={errors.category?.message}><Select {...register("category")}>{expenseCategories.map((category) => <option key={category}>{category}</option>)}</Select></Field><div className="sm:col-span-2"><Field label="Notes" error={errors.notes?.message}><Textarea placeholder="Optional context" {...register("notes")} /></Field></div>{prediction && <div className="rounded-2xl border border-pink-200 bg-pink-50 p-4 dark:border-pink-900 dark:bg-pink-950 sm:col-span-2"><div className="flex items-center justify-between gap-3"><p className="flex items-center gap-2 text-sm font-bold"><BrainCircuit className="h-4 w-4 text-primary" /> Regret predictor</p><span className="rounded-full bg-primary px-2.5 py-1 text-xs font-bold text-primary-foreground">{prediction.risk} risk</span></div><p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Based on your spending history</p><div className="mt-3 grid gap-3 sm:grid-cols-2"><Metric label="Similar purchases" value={`${prediction.similarPurchases}`} note={prediction.detail} /><Metric label="Regret rate" value={`${prediction.regretRate}%`} note="Estimated impulse-buy risk" /></div><div className="mt-3 rounded-xl bg-white p-3 text-sm dark:bg-card"><span className="font-bold text-primary">Suggested action: </span>{prediction.suggestedAction}</div></div>}<div className="flex gap-2 sm:col-span-2 sm:justify-end"><Button type="button" variant="outline" onClick={onClose}>Cancel</Button><Button disabled={isSubmitting}>{isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}{editing ? "Save changes" : "Add expense"}</Button></div></form></CardContent></Card></div>;
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) { return <div className="space-y-2"><Label>{label}</Label>{children}{error && <p className="text-xs text-destructive">{error}</p>}</div>; }
function Metric({ label, value, note }: { label: string; value: string; note: string }) { return <Card><CardContent className="p-5"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-2 text-2xl font-bold">{value}</p><p className="mt-1 text-xs text-muted-foreground">{note}</p></CardContent></Card>; }
function ChartCard({ title, children }: { title: string; children: React.ReactNode }) { return <Card><CardHeader><CardTitle>{title}</CardTitle></CardHeader><CardContent><div className="h-56">{children}</div></CardContent></Card>; }
function EmptyChart() { return <div className="grid h-full place-items-center rounded-xl border border-dashed text-sm text-muted-foreground"><FileUp className="mr-2 inline h-4 w-4" /> Import or add expenses to build this chart.</div>; }
function ChartSkeleton() { return <div className="h-full animate-pulse rounded-xl bg-muted" />; }
function Signal({ text }: { text: string }) { return <div className="flex gap-2 rounded-xl bg-pink-100 p-3 text-sm leading-5 dark:bg-pink-950"><Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><p>{text}</p></div>; }

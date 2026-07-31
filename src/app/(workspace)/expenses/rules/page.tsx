"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { expenseRuleSchema } from "@/lib/validators";
import { expenseCategories } from "@/lib/types";
import type { z } from "zod";

type ExpenseRuleForm = z.infer<typeof expenseRuleSchema>;
type ExpenseRule = ExpenseRuleForm & { id: string };

export default function RulesPage() {
  const [rules, setRules] = useState<ExpenseRule[]>([]);
  const [loading, setLoading] = useState(true);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ExpenseRuleForm>({
    resolver: zodResolver(expenseRuleSchema),
    defaultValues: { merchantSubstring: "", targetCategory: "Food" },
  });

  useEffect(() => {
    fetch("/api/expenses/rules")
      .then((res) => res.json())
      .then((data) => {
        setRules(data.rules ?? []);
        setLoading(false);
      })
      .catch(() => {
        toast.error("Failed to load rules.");
        setLoading(false);
      });
  }, []);

  async function addRule(values: ExpenseRuleForm) {
    const res = await fetch("/api/expenses/rules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await res.json();
    if (!res.ok) return toast.error(data.error ?? "Could not add rule.");
    
    setRules((prev) => [data.rule, ...prev]);
    reset();
    toast.success("Rule added successfully.");
  }

  async function deleteRule(id: string) {
    if (!window.confirm("Are you sure you want to delete this rule?")) return;
    
    const res = await fetch(`/api/expenses/rules/${id}`, { method: "DELETE" });
    if (!res.ok) return toast.error("Could not delete rule.");
    
    setRules((prev) => prev.filter((r) => r.id !== id));
    toast.success("Rule deleted.");
  }

  return (
    <div className="mx-auto max-w-4xl p-5 sm:p-7 lg:p-9 space-y-6">
      <div>
        <Link href="/money" className="text-sm font-medium text-muted-foreground flex items-center gap-1 hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to Money
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Categorization Rules</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Automatically assign categories to CSV imports based on merchant keywords.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add New Rule</CardTitle>
          <CardDescription>If a merchant contains this text, it will be auto-categorized.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(addRule)} className="grid gap-4 sm:grid-cols-12 items-end">
            <div className="space-y-2 sm:col-span-5">
              <Label>Merchant text</Label>
              <Input placeholder="e.g. UBER" {...register("merchantSubstring")} />
              {errors.merchantSubstring && <p className="text-xs text-destructive">{errors.merchantSubstring.message}</p>}
            </div>
            <div className="space-y-2 sm:col-span-5">
              <Label>Category</Label>
              <Select {...register("targetCategory")}>
                {expenseCategories.map((c) => <option key={c} value={c}>{c}</option>)}
              </Select>
              {errors.targetCategory && <p className="text-xs text-destructive">{errors.targetCategory.message}</p>}
            </div>
            <div className="sm:col-span-2 pb-0">
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />} Add
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Rules</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-10 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" /></div>
          ) : rules.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground border border-dashed rounded-lg">No rules created yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase text-muted-foreground border-b">
                  <tr>
                    <th className="pb-3 font-semibold w-1/2">Merchant Keyword</th>
                    <th className="pb-3 font-semibold">Assigned Category</th>
                    <th className="pb-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rules.map((rule) => (
                    <tr key={rule.id} className="border-b last:border-0">
                      <td className="py-3 font-medium">{rule.merchantSubstring}</td>
                      <td className="py-3"><span className="rounded-full bg-muted px-2 py-1 text-xs">{rule.targetCategory}</span></td>
                      <td className="py-3 text-right">
                        <Button size="icon" variant="ghost" onClick={() => deleteRule(rule.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

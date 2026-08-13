"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Plus, Save, Trash2, PieChart } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { expenseCategories } from "@/lib/types";
import { categoryToDb, categoryFromDb } from "@/lib/expenses";
import { ExpenseCategory } from "@prisma/client";

const categoryBudgetSchema = z.object({
  category: z.nativeEnum(ExpenseCategory),
  limit: z.coerce.number().min(0, "Limit must be a positive number"),
});

const formSchema = z.object({
  budgets: z.array(categoryBudgetSchema),
});

type FormOutput = z.output<typeof formSchema>;
type FormInput = z.input<typeof formSchema>;

export function CategoryBudgetsForm() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(formSchema),
    defaultValues: { budgets: [] },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "budgets",
  });

  useEffect(() => {
    async function fetchBudgets() {
      try {
        const res = await fetch("/api/settings/category-budgets");
        const data = await res.json();
        if (data.categoryBudgets) {
          reset({ budgets: data.categoryBudgets });
        }
      } catch (error) {
        toast.error("Failed to load category budgets");
      } finally {
        setLoading(false);
      }
    }
    void fetchBudgets();
  }, [reset]);

  async function onSubmit(data: FormOutput) {
    // Prevent duplicate categories
    const categories = data.budgets.map((b) => b.category);
    if (new Set(categories).size !== categories.length) {
      toast.error("You have duplicate categories in your budget limits.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/settings/category-budgets", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data.budgets),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update limits");
      }

      toast.success("Category budgets updated.");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center p-10">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-purple-500/10 text-purple-600">
            <PieChart className="h-5 w-5" />
          </div>
          <div>
            <CardTitle>Category Budgets</CardTitle>
            <p className="text-sm text-muted-foreground">
              Set limits for specific spending categories.
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-start gap-4">
              <div className="flex-1 space-y-2">
                <Select
                  {...register(`budgets.${index}.category`)}
                  defaultValue={field.category}
                >
                  {expenseCategories.map((cat) => (
                    <option key={cat} value={categoryToDb[cat]}>
                      {cat}
                    </option>
                  ))}
                </Select>
                {errors.budgets?.[index]?.category && (
                  <p className="text-xs text-destructive">
                    {errors.budgets[index].category.message}
                  </p>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Limit amount"
                  {...register(`budgets.${index}.limit`)}
                />
                {errors.budgets?.[index]?.limit && (
                  <p className="text-xs text-destructive">
                    {errors.budgets[index].limit.message}
                  </p>
                )}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => remove(index)}
                className="mt-0.5 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}

          {fields.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No category budgets set. Add one below.
            </p>
          )}

          <div className="flex justify-between border-t pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => append({ category: "FOOD", limit: 0 })}
            >
              <Plus className="mr-2 h-4 w-4" /> Add Budget
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save Budgets
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

"use client";

import React, { useEffect, useRef, useCallback } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Plus, Trash2, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

const keyValueSchema = z.object({
  items: z.array(
    z.object({
      key: z.string().min(1, "Key is required"),
      value: z.string().min(1, "Value is required"),
      enabled: z.boolean().default(true).optional(),
    })
  ),
});

type KeyValueFormData = z.infer<typeof keyValueSchema>;

export interface KeyValueItem {
  key: string;
  value: string;
  enabled?: boolean;
}

interface KeyValueFormEditorProps {
  initialData?: KeyValueItem[];
  onSubmit: (data: KeyValueItem[]) => void;
  placeholder?: {
    key?: string;
    value?: string;
    description?: string;
  };
  className?: string;
}

const KeyValueFormEditor: React.FC<KeyValueFormEditorProps> = ({
  initialData = [],
  onSubmit,
  placeholder = {
    key: "Key",
    value: "Value",
    description: "Description",
  },
  className,
}) => {
  const form = useForm<KeyValueFormData>({
    resolver: zodResolver(keyValueSchema),
    defaultValues: {
      items:
        initialData.length > 0
          ? initialData.map((item) => ({
              ...item,
              enabled: item.enabled ?? true,
            }))
          : [{ key: "", value: "", enabled: true }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const handleSubmit = (data: KeyValueFormData) => {
    const filteredItems = data.items
      .filter((item) => item.enabled && (item.key.trim() || item.value.trim()))
      .map(({ key, value }) => ({ key, value }));

    onSubmit(filteredItems);
  };

  const addNewRow = () => {
    append({ key: "", value: "", enabled: true });
  };

  const toggleEnabled = (index: number) => {
    const currentValue = form.getValues(`items.${index}.enabled`);
    form.setValue(`items.${index}.enabled`, !currentValue);
  };

  const removeRow = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const lastSavedRef = useRef<string | null>(null);

  const getFilteredItemsFromValues = (items: KeyValueItem[]) =>
    items
      .filter(
        (item) => item.enabled && (item.key?.trim() || item.value?.trim())
      )
      .map(({ key, value }) => ({ key, value }));

  const debounce = (fn: (...args: any[]) => void, wait = 500) => {
    let t: ReturnType<typeof setTimeout> | null = null;
    return (...args: any[]) => {
      if (t) clearTimeout(t);
      t = setTimeout(() => fn(...args), wait);
    };
  };

  const saveIfChanged = useCallback(
    (items: KeyValueItem[]) => {
      const filtered = getFilteredItemsFromValues(items);
      const serialized = JSON.stringify(filtered);
      if (serialized !== lastSavedRef.current) {
        lastSavedRef.current = serialized;
        onSubmit(filtered);
      }
    },
    [onSubmit]
  );

  const debouncedSaveRef = useRef(saveIfChanged);
  useEffect(() => {
    debouncedSaveRef.current = saveIfChanged;
  }, [saveIfChanged]);

  const debouncedInvokerRef = useRef<((items: KeyValueItem[]) => void) | null>(
    null
  );
  useEffect(() => {
    debouncedInvokerRef.current = debounce((items: KeyValueItem[]) => {
      debouncedSaveRef.current(items);
    }, 500);
  }, []);

  useEffect(() => {
    const subscription = form.watch((value) => {
      const items = (value as KeyValueFormData)?.items || [];
      debouncedInvokerRef.current?.(items as KeyValueItem[]);
    });

    return () => subscription.unsubscribe();
  }, [form]);

  return (
    <div className={cn("w-full", className)}>
      <Form {...form}>
        <div className="space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="h-8 w-1 bg-gradient-to-b from-primary via-primary to-primary/50 rounded-full shadow-sm"></div>
              <h3 className="text-sm font-semibold text-foreground">
                {placeholder.description || 'Query Parameters'}
              </h3>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-md border border-primary/20">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                {fields.filter(f => form.watch(`items.${fields.indexOf(f)}.enabled`)).length} active
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addNewRow}
                className="h-9 px-4 hover:bg-accent hover:text-accent-foreground transition-all duration-200 border-border hover:border-primary/50 shadow-sm hover:shadow-md"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Row
              </Button>
            </div>
          </div>

          
          <div className="space-y-3">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className={cn(
                  "grid grid-cols-12 gap-4 p-4 rounded-lg border transition-all duration-200",
                  form.watch(`items.${index}.enabled`)
                    ? "bg-card/50 border-border hover:bg-card hover:border-primary/30 hover:shadow-md"
                    : "bg-muted/30 border-border/50 opacity-60 hover:opacity-80"
                )}
              >
                
                <div className="col-span-5">
                  <FormField
                    control={form.control}
                    name={`items.${index}.key`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder={placeholder.key}
                            className="bg-background border-border focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm placeholder:text-muted-foreground rounded-lg transition-all h-10"
                            disabled={!form.watch(`items.${index}.enabled`)}
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>

                
                <div className="col-span-5">
                  <FormField
                    control={form.control}
                    name={`items.${index}.value`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder={placeholder.value}
                            className="bg-background border-border focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm placeholder:text-muted-foreground rounded-lg transition-all h-10"
                            disabled={!form.watch(`items.${index}.enabled`)}
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="col-span-1 flex items-center justify-center">
                  <FormField
                    control={form.control}
                    name={`items.${index}.enabled`}
                    render={({ field: checkboxField }) => (
                      <FormItem>
                        <FormControl>
                          <div className="flex items-center justify-center">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleEnabled(index)}
                              className={cn(
                                "h-8 w-8 p-0 rounded-md border-2 transition-all duration-200 shadow-sm",
                                checkboxField.value
                                  ? "bg-green-500 dark:bg-green-600 border-green-500 dark:border-green-600 text-white hover:bg-green-600 dark:hover:bg-green-700 hover:shadow-lg hover:shadow-green-500/30"
                                  : "border-destructive/50 text-destructive hover:border-destructive hover:bg-destructive/10"
                              )}
                            >
                              {checkboxField.value ? (
                                <Check className="h-4 w-4" />
                              ) : (
                                <X className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="col-span-1 flex items-center justify-center">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeRow(index)}
                    disabled={fields.length <= 1}
                    className={cn(
                      "h-8 w-8 p-0 transition-all duration-200 rounded-md",
                      fields.length <= 1
                        ? "text-muted-foreground cursor-not-allowed opacity-30"
                        : "text-destructive hover:text-destructive/80 hover:bg-destructive/10 hover:border hover:border-destructive/30"
                    )}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          
          <div className="flex justify-between items-center pt-4 border-t border-border">
            <span className="text-xs text-muted-foreground flex items-center gap-2 font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 dark:bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-600 dark:bg-green-500"></span>
              </span>
              Changes saved automatically
            </span>
            <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-md border border-border">
              {fields.length} {fields.length === 1 ? 'row' : 'rows'}
            </span>
          </div>
        </div>
      </Form>
    </div>
  );
};

export default KeyValueFormEditor;
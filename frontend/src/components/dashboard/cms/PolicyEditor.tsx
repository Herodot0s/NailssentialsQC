import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Trash2, Plus } from 'lucide-react';
import {
  getCmsContent,
  createCmsContent,
  updateCmsContent,
  deleteCmsContent,
} from '@/api/apiClient';
import type { SiteContent } from '@/types/api';

export const PolicyEditor: React.FC = () => {
  const [items, setItems] = useState<SiteContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<number | 'new' | null>(null);
  const [newItem, setNewItem] = useState<{
    title: string;
    body: string;
    sort_order: string;
    is_active: boolean;
  } | null>(null);

  const fetchItems = () => {
    setLoading(true);
    getCmsContent({ type: 'policy', activeOnly: false })
      .then((r) => {
        if (r.data.success) setItems(Array.isArray(r.data.data) ? r.data.data : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleSave = async (item: SiteContent) => {
    setSaving(item.id);
    try {
      await updateCmsContent(item.id, {
        title: item.title,
        body: item.body,
        sort_order: item.sort_order,
        is_active: item.is_active,
      });
    } catch {
      alert('Failed to save.');
    } finally {
      setSaving(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this policy? This cannot be undone.')) return;
    try {
      await deleteCmsContent(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch {
      alert('Failed to delete.');
    }
  };

  const handleCreate = async () => {
    if (!newItem || !newItem.title || !newItem.body) return;
    setSaving('new');
    try {
      const r = await createCmsContent({
        type: 'policy',
        title: newItem.title,
        body: newItem.body,
        sort_order: Number(newItem.sort_order) || 0,
        is_active: newItem.is_active,
      });
      if (r.data.success) {
        setItems((prev) => [...prev, r.data.data]);
        setNewItem(null);
      }
    } catch {
      alert('Failed to create.');
    } finally {
      setSaving(null);
    }
  };

  const updateItem = (id: number, field: keyof SiteContent, value: any) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, [field]: value } : i)));
  };

  if (loading)
    return (
      <div className="flex items-center gap-2 py-12 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-xs uppercase tracking-widest">Loading...</span>
      </div>
    );

  return (
    <div className="space-y-4">
      {items.length === 0 && !newItem && (
        <div className="text-center py-16 space-y-2">
          <p className="text-sm font-medium text-muted-foreground">No policies yet.</p>
          <p className="text-xs text-muted-foreground">
            Add salon policies to keep customers informed.
          </p>
        </div>
      )}
      {items.map((item) => (
        <Card key={item.id} className="rounded-none border-gray-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <p className="text-sm font-medium truncate flex-1">{item.title || 'Untitled Policy'}</p>
            <div className="flex gap-2 shrink-0">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleDelete(item.id)}
                className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                Title
              </Label>
              <Input
                value={item.title}
                onChange={(e) => updateItem(item.id, 'title', e.target.value)}
                className="text-sm rounded-none"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                Body
              </Label>
              <Textarea
                rows={6}
                value={item.body}
                onChange={(e) => updateItem(item.id, 'body', e.target.value)}
                className="resize-none text-sm rounded-none"
              />
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                  Sort Order
                </Label>
                <Input
                  type="number"
                  value={item.sort_order}
                  onChange={(e) => updateItem(item.id, 'sort_order', Number(e.target.value))}
                  className="w-20 text-sm rounded-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id={`active-${item.id}`}
                  checked={item.is_active}
                  onCheckedChange={(v) => updateItem(item.id, 'is_active', Boolean(v))}
                />
                <Label
                  htmlFor={`active-${item.id}`}
                  className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground"
                >
                  Active
                </Label>
              </div>
              <Button
                size="sm"
                onClick={() => handleSave(item)}
                disabled={saving === item.id}
                className="ml-auto rounded-none px-4 text-[10px] uppercase tracking-widest font-bold"
              >
                {saving === item.id ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Save Changes'}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
      {newItem && (
        <Card className="rounded-none border-dashed border-gray-200">
          <CardContent className="pt-4 space-y-3">
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                Title
              </Label>
              <Input
                value={newItem.title}
                onChange={(e) => setNewItem((p) => p && { ...p, title: e.target.value })}
                className="text-sm rounded-none"
                placeholder="Policy Title"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                Body
              </Label>
              <Textarea
                rows={6}
                value={newItem.body}
                onChange={(e) => setNewItem((p) => p && { ...p, body: e.target.value })}
                className="resize-none text-sm rounded-none"
                placeholder="Policy details..."
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setNewItem(null)}
                className="rounded-none text-[10px] uppercase tracking-widest font-bold"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleCreate}
                disabled={saving === 'new'}
                className="rounded-none text-[10px] uppercase tracking-widest font-bold"
              >
                {saving === 'new' ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Save Policy'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      <Button
        variant="outline"
        onClick={() => setNewItem({ title: '', body: '', sort_order: '0', is_active: true })}
        className="w-full rounded-none border-dashed text-[10px] uppercase tracking-widest font-bold gap-2 h-12"
      >
        <Plus className="h-4 w-4" /> Add Policy
      </Button>
    </div>
  );
};

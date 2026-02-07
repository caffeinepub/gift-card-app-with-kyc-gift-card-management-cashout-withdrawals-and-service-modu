import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { X, Plus, Loader2 } from 'lucide-react';

interface GiftCardLabelsEditorProps {
  currentTags: string[];
  onSave: (tags: string[]) => Promise<void>;
  isSaving?: boolean;
}

export default function GiftCardLabelsEditor({ currentTags, onSave, isSaving = false }: GiftCardLabelsEditorProps) {
  const [tags, setTags] = useState<string[]>(currentTags);
  const [newTag, setNewTag] = useState('');

  const handleAddTag = () => {
    const trimmedTag = newTag.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSave = async () => {
    await onSave(tags);
  };

  const hasChanges = JSON.stringify(tags.sort()) !== JSON.stringify([...currentTags].sort());

  return (
    <Card>
      <CardHeader>
        <CardTitle>Labels</CardTitle>
        <CardDescription>Organize your gift cards with custom labels</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2 min-h-[2rem]">
          {tags.length === 0 ? (
            <p className="text-sm text-muted-foreground">No labels yet</p>
          ) : (
            tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="gap-1">
                {tag}
                <button
                  onClick={() => handleRemoveTag(tag)}
                  disabled={isSaving}
                  className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5 disabled:opacity-50"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))
          )}
        </div>

        <div className="flex gap-2">
          <Input
            placeholder="Add a label..."
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddTag();
              }
            }}
            disabled={isSaving}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleAddTag}
            disabled={!newTag.trim() || isSaving}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {hasChanges && (
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Labels'
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

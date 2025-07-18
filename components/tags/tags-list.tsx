"use client"

import { useState } from "react"
import { useTags } from "@/contexts/tags-context"
import { useExpenses } from "@/contexts/expenses-context"
import { cn } from "@/lib/utils"
import { Plus, Edit, Trash, MoreHorizontal, TagIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { TagForm } from "@/components/tags/tag-form"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export function TagsList({ dictionary, lang }: { dictionary: any; lang: string }) {
  const { tags, deleteTag } = useTags()
  const { expenses } = useExpenses()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingTag, setEditingTag] = useState<string | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<string | null>(null)
  const isRtl = lang === "ar"

  const getTagUsageCount = (tagId: string) => {
    return expenses.filter((expense) => expense.tags.includes(tagId)).length
  }

  const handleDeleteConfirm = () => {
    if (deleteConfirmOpen) {
      deleteTag(deleteConfirmOpen)
      setDeleteConfirmOpen(null)
    }
  }

  const tagToEdit = editingTag ? tags.find((t) => t.id === editingTag) : undefined

  const TagCard = ({ tag }: { tag: any }) => {
    const usageCount = getTagUsageCount(tag.id)

    return (
      <Card className="p-4">
        <div className={cn("flex items-center justify-between", isRtl && "flex-row-reverse")}>
          <div className={cn("flex items-center gap-3", isRtl && "flex-row-reverse")}>
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
            >
              <TagIcon className="w-5 h-5" />
            </div>
            <div className={cn("space-y-1", isRtl && "text-right")}>
              <h3 className="font-medium">{tag.name}</h3>
              {tag.description && <p className="text-sm text-muted-foreground">{tag.description}</p>}
              {usageCount > 0 && (
                <Badge variant="outline" className="text-xs">
                  {dictionary.tags_management.usage_count.replace("{count}", usageCount.toString())}
                </Badge>
              )}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={isRtl ? "start" : "end"}>
              <DropdownMenuItem onClick={() => setEditingTag(tag.id)}>
                <Edit className="mr-2 h-4 w-4" />
                {dictionary.tags_management.edit_tag}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setDeleteConfirmOpen(tag.id)} className="text-red-600">
                <Trash className="mr-2 h-4 w-4" />
                {dictionary.tags_management.delete_tag}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className={cn("flex items-center justify-between", isRtl && "flex-row-reverse")}>
        <h1 className="text-2xl font-bold">{dictionary.tags_management.title}</h1>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {dictionary.tags_management.add_tag}
        </Button>
      </div>

      {tags.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">{dictionary.tags_management.no_tags}</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tags.map((tag) => (
            <TagCard key={tag.id} tag={tag} />
          ))}
        </div>
      )}

      {/* Add Tag Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{dictionary.tags_management.add_tag}</DialogTitle>
          </DialogHeader>
          <TagForm
            dictionary={dictionary}
            lang={lang}
            onSuccess={() => setIsAddDialogOpen(false)}
            onCancel={() => setIsAddDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Tag Dialog */}
      <Dialog open={!!editingTag} onOpenChange={(open) => !open && setEditingTag(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{dictionary.tags_management.edit_tag}</DialogTitle>
          </DialogHeader>
          {tagToEdit && (
            <TagForm
              dictionary={dictionary}
              lang={lang}
              tag={tagToEdit}
              onSuccess={() => setEditingTag(null)}
              onCancel={() => setEditingTag(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirmOpen} onOpenChange={(open) => !open && setDeleteConfirmOpen(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{dictionary.tags_management.delete_tag}</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteConfirmOpen && getTagUsageCount(deleteConfirmOpen) > 0
                ? dictionary.tags_management.tag_in_use
                : dictionary.tags_management.confirm_delete}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{dictionary.form.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700">
              {dictionary.form.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

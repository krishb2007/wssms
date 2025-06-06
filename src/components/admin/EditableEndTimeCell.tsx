
import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Save, X, Pencil } from "lucide-react";

interface EditableEndTimeCellProps {
  registration: {
    id: string;
    endtime: string | null;
  };
  editingId: string | null;
  editEndTime: string;
  formatDate: (dateString: string | null) => string;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onEditTimeChange: (value: string) => void;
}

export default function EditableEndTimeCell({
  registration,
  editingId,
  editEndTime,
  formatDate,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onEditTimeChange
}: EditableEndTimeCellProps) {
  if (editingId === registration.id) {
    return (
      <div className="flex items-center space-x-2">
        <Input
          type="datetime-local"
          value={editEndTime}
          onChange={(e) => onEditTimeChange(e.target.value)}
          className="w-44"
        />
        <Button size="sm" onClick={onSaveEdit}>
          <Save className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="outline" onClick={onCancelEdit}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <span className={registration.endtime ? '' : 'text-orange-600 font-medium'}>
        {registration.endtime ? formatDate(registration.endtime) : 'Not set'}
      </span>
      <Button size="sm" variant="outline" onClick={onStartEdit}>
        <Pencil className="h-4 w-4" />
      </Button>
    </div>
  );
}

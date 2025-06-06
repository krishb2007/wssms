
import React from 'react';
import { TableCell, TableRow } from "@/components/ui/table";
import VisitorInfoDialog from './VisitorInfoDialog';
import EditableEndTimeCell from './EditableEndTimeCell';

interface VisitorRegistration {
  id: string;
  visitorname: string;
  phonenumber: string;
  numberofpeople: number;
  people: string;
  purpose: string;
  address: string;
  schoolname: string;
  starttime: string | null;
  endtime: string | null;
  created_at: string;
  picture_url: string | null;
  signature_url: string | null;
}

interface VisitorTableRowProps {
  registration: VisitorRegistration;
  editingId: string | null;
  editEndTime: string;
  formatDate: (dateString: string | null) => string;
  parsePeople: (peopleString: string) => string;
  formatPurpose: (purpose: string) => string;
  onStartEdit: (registration: VisitorRegistration) => void;
  onCancelEdit: () => void;
  onSaveEdit: (id: string) => void;
  onEditTimeChange: (value: string) => void;
}

export default function VisitorTableRow({
  registration,
  editingId,
  editEndTime,
  formatDate,
  parsePeople,
  formatPurpose,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onEditTimeChange
}: VisitorTableRowProps) {
  return (
    <TableRow key={registration.id}>
      <TableCell className="font-medium">{registration.visitorname}</TableCell>
      <TableCell>{registration.phonenumber}</TableCell>
      <TableCell>{registration.numberofpeople}</TableCell>
      <TableCell className="max-w-xs truncate">
        {parsePeople(registration.people)}
      </TableCell>
      <TableCell>{formatPurpose(registration.purpose)}</TableCell>
      <TableCell className="max-w-xs truncate">{registration.address}</TableCell>
      <TableCell>{formatDate(registration.starttime)}</TableCell>
      <TableCell>
        <EditableEndTimeCell
          registration={registration}
          editingId={editingId}
          editEndTime={editEndTime}
          formatDate={formatDate}
          onStartEdit={() => onStartEdit(registration)}
          onCancelEdit={onCancelEdit}
          onSaveEdit={() => onSaveEdit(registration.id)}
          onEditTimeChange={onEditTimeChange}
        />
      </TableCell>
      <TableCell>{formatDate(registration.created_at)}</TableCell>
      <TableCell>
        <VisitorInfoDialog
          registration={registration}
          formatDate={formatDate}
          parsePeople={parsePeople}
          formatPurpose={formatPurpose}
        />
      </TableCell>
    </TableRow>
  );
}

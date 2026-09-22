/**
 * Confirm dialog before clearing an occupant from a bed.
 *
 * Does not remove the physical bed; parent Remove Person keeps Bed.id/slot
 * and sets status back to vacant.
 */

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

interface RemovePersonDialogProps {
  open: boolean;
  personName: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function RemovePersonDialog({
  open,
  personName,
  onCancel,
  onConfirm,
}: RemovePersonDialogProps) {
  return (
    <Dialog open={open} onClose={onCancel}>
      <DialogTitle>Remove Person?</DialogTitle>

      <DialogContent>
        <DialogContentText>
          Are you sure you want to remove {personName} from this room?
        </DialogContentText>
      </DialogContent>

      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>

        <Button onClick={onConfirm} color="error" variant="contained">
          Remove Person
        </Button>
      </DialogActions>
    </Dialog>
  );
}

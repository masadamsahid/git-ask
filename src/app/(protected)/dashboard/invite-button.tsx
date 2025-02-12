'use client';

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import useProjects from "@/hooks/use-projects";
import { DialogTitle } from "@radix-ui/react-dialog";
import { useState } from "react";
import { toast } from "sonner";

const InviteButton = () => {
  const { selectedProjectId } = useProjects();
  const [open, setOpen] = useState(false);
  const invitationLink = `${window.location.origin}/join/${selectedProjectId}`;

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Invite Team Members
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500">
            Ask them to copy and paste this link!
          </p>
          <Input
            readOnly
            className="mt-4"
            onClick={() => {
              navigator.clipboard.writeText(invitationLink);
              toast.success('Coppied to clipboard');
            }}
            value={invitationLink}
          />
        </DialogContent>
      </Dialog>
      <Button onClick={() => setOpen(true)}>
        Invite Member
      </Button>
    </>
  );
}

export default InviteButton;
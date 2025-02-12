'use client';

import { Button } from '@/components/ui/button';
import useProjects from '@/hooks/use-projects';
import useRefetch from '@/hooks/use-refetch';
import { api } from '@/trpc/react';
import React from 'react'
import { toast } from 'sonner';

const ArchiveButton = () => {
  const { selectedProjectId } = useProjects();
  const archiveProject = api.projects.archiveProject.useMutation();
  const refetch = useRefetch();

  return (
    <Button
      size='sm'
      variant='destructive'
      onClick={() => {
        const confirm = window.confirm('Are you sure to archive this project?');
        if (confirm) archiveProject.mutate({ projectId: selectedProjectId }, {
          onSuccess() {
            toast.success('Project archived');
            refetch();
          },
          onError() {
            toast.error('Failed to archive project');
          },
        });
      }}
    >
      Archive
    </Button>
  );
}

export default ArchiveButton;
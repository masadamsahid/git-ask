'use client';

import useProjects from "@/hooks/use-projects";
import { api } from "@/trpc/react";

type Props = {}

const TeamMembers = (props: Props) => {
  const { selectedProjectId } = useProjects();
  const { data: members } = api.projects.getTeamMembers.useQuery({ projectId: selectedProjectId });

  return (
    <div className="flex items-center gap-2">
      {members?.map((m) => (
        <img
          key={m.id}
          src={m.user.imageUrl || ''}
          alt={m.user.imageUrl || ''}
          height={30}
          width={30}
          className="rounded-full"
        />
      ))}
    </div>
  );
}

export default TeamMembers;
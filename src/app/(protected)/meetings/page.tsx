'use client';

import useProjects from "@/hooks/use-projects";
import { api } from "@/trpc/react";
import MeetingCard from "../dashboard/meeting-card";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import useRefetch from "@/hooks/use-refetch";

const page = () => {
  const refetch = useRefetch();
  const { selectedProjectId } = useProjects();
  const { data: meetings, isLoading } = api.projects.getMeetings.useQuery({ projectId: selectedProjectId }, {
    refetchInterval(query) {
      return 4000;
    },
  });

  const deleteMeeting = api.projects.deleteMeeting.useMutation();

  return (
    <>
      <MeetingCard />
      <div className="h-6"></div>
      <div className="h-1 text-xl font-semibold">Meetings</div>
      {meetings && meetings.length < 1 && (
        <div>No meetings found</div>
      )}
      {isLoading && (<div>Loading...</div>)}
      <ul className="divide-y divide-gray-200">
        {meetings?.map(m => (
          <li key={m.id} className="flex items-center justify-between py-5 gap-x-6">
            <div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Link href={`/meetings/${m.id}`} className="text-sm font-semibold">
                    {m.name}
                  </Link>
                  {m.status === 'PROCESSING' && (
                    <Badge className="bg-yellow-500 text-white">
                      Processing...
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center text-xs text-gray-500 gap-x-2">
                <p className="whitespace-nowrap">{m.createdAt.toLocaleDateString()}</p>
                <p className="truncate">{m.issues.length} issues</p>
              </div>
            </div>
            <div className="flex items-center flex-none gap-x-4">
              <Link href={`/meetings/${m.id}`}>
                <Button variant='outline'>
                  View Meeting
                </Button>
              </Link>
              <Button
                disabled={deleteMeeting.isPending}
                size='sm' variant='destructive'
                onClick={() => deleteMeeting.mutate({ meetingId: m.id }, {
                  onSuccess: () => {
                    toast.success('Meeting deleted successfully');
                    useRefetch();
                  },
                })}
              >
                Delete
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

export default page;
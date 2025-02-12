'use client';

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { uploadFile } from "@/lib/firebase";
import { Presentation, Upload } from "lucide-react";
import { useState } from "react";
import { useDropzone } from 'react-dropzone';
import { buildStyles, CircularProgressbar } from 'react-circular-progressbar';
import { api } from "@/trpc/react";
import useProjects from "@/hooks/use-projects";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

const MeetingCard = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const uploadMeeting = api.projects.uploadMeeting.useMutation();
  const { selectedProject } = useProjects();
  const router = useRouter();
  
  const processMeeting = useMutation({
    mutationFn: async (data: { meetingUrl: string, meetingId: string, projectId: string }) => {
      const { meetingId, meetingUrl, projectId } = data;
      const response = await axios.post('/api/process-meeting', { meetingUrl, meetingId, projectId });
      return response.data;
    },
  });


  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'audio/*': ['.mp3', '.wav', '.m4a'],
    },
    multiple: false,
    maxSize: 50_000_000,
    async onDrop(acceptedFiles, fileRejections, event) {
      if (!selectedProject) return;

      setIsUploading(true);
      console.log(acceptedFiles);

      const file = acceptedFiles[0];
      if (!file) return;

      const downloadUrl = await uploadFile(file as File, setProgress) as string;
      uploadMeeting.mutate({
        projectId: selectedProject.id,
        meetingUrl: downloadUrl,
        name: file.name,
      }, {
        onSuccess: (meeting) => {
          toast.success("Meeting uploaded successfully");
          router.push('/meetings');
          processMeeting.mutateAsync({
            meetingUrl: downloadUrl,
            meetingId: meeting.id,
            projectId: selectedProject.id
          });
        },
      });

      setIsUploading(false);
    },
  });

  return (
    <Card className="col-span-2 flex flex-col items-center justify-center p-10" {...getRootProps()}>
      {!isUploading && (
        <>
          <Presentation className="size-10 animate-bounce" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">
            Create a New Meeting
          </h3>
          <p className="mt-1 text-center text-sm text-gray-500">
            Analyze your meeting with GitAsk
            <br />
            Powered by AI
          </p>
          <div className="mt-6">
            <Button disabled={isUploading}>
              <Upload className="-ml-0.5 mr-1.5 size-5" aria-hidden="true" />
              Upload Meeting
              <input className="hidden" {...getInputProps()} />
            </Button>
          </div>
        </>
      )}
      {isUploading && (
        <div>
          <CircularProgressbar
            value={progress}
            text={`${progress} %`}
            className="size-20"
            styles={buildStyles({
              pathColor: '#2563EB',
              textColor: '#2563EB',
            })}
          />
          <p className="text-sm text-gray-500 text-center">Uploading your meeting...</p>
        </div>
      )}
    </Card>
  );
}

export default MeetingCard;
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useRefetch from "@/hooks/use-refetch";
import { api } from "@/trpc/react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type FormInput = {
  repoUrl: string;
  projectName: string;
  githubToken?: string;
}

const CreatePage = () => {
  const { register, handleSubmit, reset } = useForm<FormInput>();
  const createProject = api.projects.createProject.useMutation();

  const refetch = useRefetch();

  function onSubmit(data: FormInput) {
    createProject.mutate({
      name: data.projectName,
      githubUrl: data.repoUrl,
      githubToken: data.githubToken,
    }, {
      onSuccess: () => {
        toast.success('Project created successfully');
        refetch();
        reset();
      },
      onError: () => {
        toast.error('Failed to create project');
      }
    });
    return true;
  }

  return (
    <div className="flex items-center gap-12 h-full justify-center">
      <img src="/undraw_choose_j1ds.svg" className="h-56 w-auto" />
      <div>
        <div>
          <h1 className="font-semibold text-2xl">
            Link your GitHub repo
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter the URL of the repo to link it to GitAsk!
          </p>
        </div>
        <div className="h-4"></div>
        <div>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2">
            <Input required {...register('projectName', { required: true })} placeholder="Project Name" />
            <Input required {...register('repoUrl', { required: true })} placeholder="GitHub URL" type="url" />
            <Input {...register('githubToken')} placeholder="GitHub Token (Optional)" />
            <div className="h-4"></div>
            <Button type="submit">
              Create Project
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreatePage
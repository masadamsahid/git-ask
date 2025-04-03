"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useRefetch from "@/hooks/use-refetch";
import { api } from "@/trpc/react";
import { Info } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type FormInput = {
  repoUrl: string;
  projectName: string;
  githubToken?: string;
  githubBranch?: string;
}

const CreatePage = () => {
  const { register, handleSubmit, reset } = useForm<FormInput>();
  const createProject = api.projects.createProject.useMutation();
  const checkCredits = api.projects.checkCredits.useMutation();

  const refetch = useRefetch();

  function onSubmit(data: FormInput) {
    if (!!checkCredits.data) {
      createProject.mutate({
        name: data.projectName,
        githubUrl: data.repoUrl,
        githubToken: data.githubToken,
        githubBranch: data.githubBranch,
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
    } else {
      checkCredits.mutate({
        githubUrl: data.repoUrl,
        githubToken: data.githubToken,
        githubBranch: data.githubBranch,
      });
    }
  }

  const hasEnoughCredits = checkCredits.data?.userCredits ? checkCredits.data.fileCount <= checkCredits.data.userCredits : true;

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
            <Input {...register('githubBranch', { required: true })} placeholder="Branch (default: main)" type="text" />
            <Input {...register('githubToken')} placeholder="GitHub Token (Optional)" />
            {!!checkCredits.data && (
              <>
                <div className="mt-4 rounded-md border border-orange-200 bg-orange-50 px-4 py-2 text-orange-700">
                  <div className="flex items-center gap-2">
                    <Info className="size-4" />
                    <p className="text-sm">
                      You will be charged{" "}
                      <strong>
                        {checkCredits.data?.fileCount} credits for this
                        repository.
                      </strong>
                    </p>
                  </div>
                  <p className="ml-6 text-sm text-blue-600">
                    You have{" "}
                    <strong>
                      {checkCredits.data?.userCredits} credits remaining.
                    </strong>
                  </p>
                </div>
              </>
            )}
            <div className="h-4"></div>
            <Button type="submit" disabled={createProject.isPending || checkCredits.isPending || !hasEnoughCredits}>
              {!!checkCredits.data ? 'Create Project' : 'Check Credits'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreatePage
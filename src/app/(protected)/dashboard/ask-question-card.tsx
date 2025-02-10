'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import useProjects from "@/hooks/use-projects";
import Image from "next/image";
import { FormEvent, useState } from "react";
import { askQuestion } from "./actions";
import { readStreamableValue } from "ai/rsc";
import MDEditor from '@uiw/react-md-editor';
import CodeReferences from "./code-references";
import { api } from "@/trpc/react";
import { toast } from "sonner";

const AskQuestionCard = () => {
  const { selectedProject } = useProjects();
  const [question, setQuestion] = useState('');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fileReferences, setFileReferences] = useState<{ fileName: string; sourceCode: string; summary: string; }[]>([]);
  const [answer, setAnswer] = useState('');

  const saveAnswer = api.projects.saveAnswer.useMutation();

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    setAnswer('');
    setFileReferences([]);
    e.preventDefault();
    if (!selectedProject?.id) return;
    setLoading(true);
    setOpen(true);

    const { output, fileReferences } = await askQuestion(question, selectedProject.id);
    setFileReferences(fileReferences);

    for await (const delta of readStreamableValue(output)) {
      if (delta) setAnswer(prev => prev + delta);
    }
    setLoading(false);
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[80vw]">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <DialogTitle>
                <Image src="/logo.png" alt="git-ask" width={40} height={40} />
              </DialogTitle>
              <Button
                variant='outline'
                disabled={saveAnswer.isPending}
                onClick={() => {
                  saveAnswer.mutate({ projectId: selectedProject!.id, answer, question, fileReferences }, {
                    onSuccess: () => {
                      toast.success('Answer saved!');
                    },
                    onError: () => {
                      toast.error('Failed to save answer!');
                    }
                  })
                }}
              >
                Save Question
              </Button>
            </div>
          </DialogHeader>

          <div data-color-mode="light">
            <MDEditor.Markdown source={answer} className="mx-auto max-w-[70vw] !h-full max-h-[40vh] overflow-auto" />
          </div>
          <div className="h-4"></div>
          <CodeReferences fileReferences={fileReferences} />

          <Button type="button" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogContent>
      </Dialog>

      <Card className="relative col-span-3">
        <CardHeader>
          <CardTitle>Ask a question</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit}>
            <Textarea
              placeholder="Which file should I edit to change the home page?"
              value={question}
              onChange={e => setQuestion(e.target.value)}
            />
            <div className="h-4"></div>
            <Button type="submit" disabled={loading}>
              Ask!
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  )
}

export default AskQuestionCard
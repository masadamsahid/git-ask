'use client'

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import useProjects from "@/hooks/use-projects"
import { api } from "@/trpc/react";
import AskQuestionCard from "../dashboard/ask-question-card";
import { Fragment, useState } from "react";
import MDEditor from "@uiw/react-md-editor";
import CodeReferences from "../dashboard/code-references";

const QNAPage = () => {
  const { selectedProjectId } = useProjects();
  const { data: questions } = api.projects.getQuestion.useQuery({ projectId: selectedProjectId });

  const [questionIndex, setQuestionIndex] = useState(0);
  const question = questions?.[questionIndex];

  return (
    <Sheet>
      <AskQuestionCard />
      <div className="h-4"></div>
      <h1 className="text-xl font-semibold">Saved Questions</h1>
      <div className="h-2"></div>
      <div className="flex flex-col gap-2">
        {questions?.map((q, i) => (
          <Fragment key={q.id}>
            <SheetTrigger onClick={() => setQuestionIndex(i)}>
              <div className="flex items-center gap-4 bg-white rounded-lg p-4 shadow border">
                <img className="rounded-full" height={30} width={30} src={question?.user.imageUrl ?? ""} />

                <div className="text-left flex flex-col">
                  <div className="flex items-center gap-2">
                    <p className="text-gray-700 line-clamp-1 text-lg font-medium">
                      {q.question}
                    </p>
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {q.createdAt.toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-500 line-clamp-1 text-sm">
                    {q.answer}
                  </p>
                </div>
              </div>
            </SheetTrigger>
          </Fragment>
        ))}
      </div>
      {question && (
        <SheetContent className="sm:max-w-[80vw]">
          <SheetHeader>
            <SheetTitle>{question.question}</SheetTitle>
            <div data-color-mode="light">
              <MDEditor.Markdown source={question.answer} />
            </div>
            <CodeReferences fileReferences={question.fileReferences ?? [] as any} />
          </SheetHeader>
        </SheetContent>
      )}
    </Sheet>
  )
}

export default QNAPage
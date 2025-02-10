'use client';

import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { lucario } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { cn } from "@/lib/utils";
import { useState } from "react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

type Props = {
  fileReferences: { fileName: string; sourceCode: string; summary: string; }[];
}

const CodeReferences = ({ fileReferences }: Props) => {
  const [activeTab, setActiveTab] = useState(fileReferences[0]?.fileName);
  if (fileReferences.length === 0) return null;

  console.log({ activeTab, fileReferences });

  return (
    <div className="max-w-[70vw]">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <ScrollArea className="w-full overflow-auto">
          <div className="flex gap-2 rounded-md bg-gray-200 p-1">
            {fileReferences.map((file) => (
              <button
                onClick={() => setActiveTab(file.fileName)}
                key={file.fileName}
                className={cn(
                  "max-w-[80vw] whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted-foreground hover:text-primary-foreground",
                  {
                    "bg-primary text-primary-foreground": activeTab === file.fileName,
                  },
                )}
              >
                {file.fileName}
              </button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
        {fileReferences.map(file => (
          <TabsContent key={file.fileName} value={file.fileName} className="max-h-[40vh] overflow-auto max-w-7xl rounded-md">
            <div className="max-h-[25vh] w-full overflow-auto">
              <SyntaxHighlighter
                language="typescript"
                style={lucario}
                className="overflow-auto"
              >
                {file.sourceCode}
              </SyntaxHighlighter>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

export default CodeReferences;
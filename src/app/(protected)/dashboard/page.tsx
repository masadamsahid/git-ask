"use client";

import useProjects from "@/hooks/use-projects";
import { useUser } from "@clerk/nextjs"
import { ExternalLink, Github } from "lucide-react";
import Link from "next/link";
import CommitLog from "./commit-log";

const DashboardPage = () => {
  const { user } = useUser();

  const { selectedProject } = useProjects();

  return (
    <div>
      {selectedProject?.id}
      <div className="flex items-center justify-between flex-wrap gap-y-4">
        <div className="w-fit rounded-md bg-primary px-4 py-3">
          <div className="flex items-center">
            <Github className="size-5 text-white" />
            <div className="ml-2">
              <p className="text-sm font-medium text-white">
                This project is linked to {' '}
                <Link href={selectedProject?.githubUrl ?? ' '} className="inline-flex items-center text-white/80 hover:underline">
                  {selectedProject?.githubUrl}
                  <ExternalLink className="ml-1 size-4" />
                </Link>
              </p>
            </div>
          </div>
        </div>

        <div className="h-4"></div>

        <div className="flex items-center gap-4">
          Project Actions
        </div>
      </div>

      <div className="mt-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
          Interactive Cards
        </div>
      </div>

      <div className="mt-8"></div>
      <CommitLog />
    </div>
  )
}

export default DashboardPage
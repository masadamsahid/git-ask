"use client";

import useProjects from "@/hooks/use-projects";
import { useUser } from "@clerk/nextjs"

const DashboardPage = () => {
  const { user } = useUser();

  const { selectedProject } = useProjects();

  return (
    <div>
      <h1>{selectedProject?.name}</h1>
    </div>
  )
}

export default DashboardPage
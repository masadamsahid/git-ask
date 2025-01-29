import { api } from "@/trpc/react";
import { useLocalStorage } from "usehooks-ts";

const useProjects = () => {
  const { data: projects } = api.projects.getProjects.useQuery();
  const [selectedProjectId, setSelectedProjectId] = useLocalStorage('gitask-projectId', '');
  const selectedProject = projects?.find( p => p.id === selectedProjectId);
  return {
    projects,
    selectedProject,
    selectedProjectId,
    setSelectedProjectId,
  };
}

export default useProjects;
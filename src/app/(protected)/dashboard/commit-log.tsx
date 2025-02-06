'use client';

import useProjects from '@/hooks/use-projects';
import { cn } from '@/lib/utils';
import { api } from '@/trpc/react';
import { ExternalLink } from 'lucide-react';
import Link from 'next/link';

const CommitLog = () => {
  const { selectedProjectId, selectedProject } = useProjects();

  const { data: commits } = api.projects.getCommits.useQuery({ projectId: selectedProjectId });

  return (
    <>
      <ul className='space-y-6'>
        {commits?.map((c, i) => (
          <li key={c.id} className='relative flex gap-x-4'>
            <div
              className={cn(
                i === commits.length - 1 ? 'h-6' : '-bottom-6',
                'absolute left-0 top-0 flex w-6 justify-center'
              )}
            >
              <div className='w-px translate-x-1 bg-gray-200'></div>
            </div>

            <>
              <img src={c.commitAuthorAvatar} alt='commit avatar' className='relative mt-4 size-8 flex-none rounded-full bg-gray-50' />
              <div className='flex-auto rounded-md bg-white p-3 ring-1 ring-inset ring-gray-200'>
                <div className='flex justify-between gap-x-4'>
                  <Link target='_blank' href={`${selectedProject?.githubUrl}/commit/${c.commitHash}`} className='py-0.5 text-xs leading-5 text-gray-500'>
                    <span className='font-medium text-gray-900'>
                      {c.commitAuthorName}
                    </span>{' '}
                    <span className='inline-flex items-center'>
                      commited <ExternalLink className='ml-1 size-3' />
                    </span>
                  </Link>
                </div>

                <span className='font-semibold'>
                  {c.commitMessage}
                </span>
                <pre className='mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-500'>
                  {c.summary}
                </pre>
              </div>
            </>
          </li>
        ))}
      </ul>
    </>
  );
}

export default CommitLog;
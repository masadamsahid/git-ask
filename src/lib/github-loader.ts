import { GithubRepoLoader } from "@langchain/community/document_loaders/web/github";
import { Document } from "@langchain/core/documents";
import { generateEmbedding, summarizeCode } from "./gemini";
import { db } from "@/server/db";
import { Octokit } from "octokit";

const getFileCount = async (path: string, ocktokit: Octokit, githubOwner: string, githubRepo: string, acc: number = 0, githubBranch: string = "main") => {
  const { data } = await ocktokit.rest.repos.getContent({
    owner: githubOwner,
    repo: githubRepo,
    path,
    ref: githubBranch,
  });

  if (!Array.isArray(data) && data.type === 'file') return acc + 1;

  if (Array.isArray(data)) {
    let fileCount = 0;
    const directories: string[] = [];

    for (const item of data) {
      if (item.type === "dir") {
        directories.push(item.path);
      } else {
        fileCount++;
      }
    }

    if (directories.length > 0) {
      const directoryCounts = await Promise.all(directories.map(dirPath => getFileCount(dirPath, ocktokit, githubOwner, githubRepo, 0, githubBranch)));
      fileCount += directoryCounts.reduce((acc, count) => acc + count, 0);
    }
    return acc + fileCount;
  }

  return acc;
}

export const checkCredits = async (githubUrl: string, githubToken?: string, githubBranch: string = "main") => {
  // How many files in a repo
  const ocktokit = new Octokit({ auth: githubToken });
  const githubOwner = githubUrl.split('/')[3];
  const githubRepo = githubUrl.split('/')[4];

  if (!githubOwner || !githubRepo) return 0;

  const fileCount = await getFileCount('', ocktokit, githubOwner, githubRepo, 0, githubBranch);

  return fileCount;
}

export const loadGithubRepo = async (githubUrl: string, githubToken?: string, githubBranch: string = "main") => {
  const loader = new GithubRepoLoader(githubUrl, {
    accessToken: githubToken || process.env.GITHUB_TOKEN,
    branch: githubBranch, // TODO: Add a feature to choose desired branch
    ignoreFiles: ['package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', 'bun.lockb'],
    recursive: true,
    unknown: 'warn',
    maxConcurrency: 5,
  });
  const docs = await loader.load();
  return docs;
}

export const indexGithubRepo = async (projectId: string, githubUrl: string, githubToken?: string, githubBranch: string = "main") => {
  const docs = await loadGithubRepo(githubUrl, githubToken, githubBranch);
  const allEmbeddings = await generateEmbeddings(docs);

  await Promise.allSettled(allEmbeddings.map(async (embedding, i) => {
    // console.log(`processing ${i} of ${allEmbeddings.length}`);
    if (!embedding) return;

    const sourceCodeEmbedding = await db.sourceCodeEmbedding.create({
      data: {
        summary: embedding.summary,
        sourceCode: embedding.sourceCode,
        fileName: embedding.fileName,
        projectId,
      },
    });

    await db.$executeRaw`
    UPDATE "SourceCodeEmbedding"
    SET "summaryEmbedding" =  ${embedding.embedding}::vector
    WHERE "id" = ${sourceCodeEmbedding.id}
    `;

  }));
}

const generateEmbeddings = async (docs: Document[]) => {
  return await Promise.all(docs.map(async (doc) => {
    const summary = await summarizeCode(doc);
    const embedding = await generateEmbedding(summary);
    return {
      summary,
      embedding,
      sourceCode: JSON.parse(JSON.stringify(doc.pageContent)),
      fileName: doc.metadata.source,
    }
  }));
}
import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { pollCommits } from "@/lib/github";
import { indexGithubRepo } from "@/lib/github-loader";

export const projectRouter = createTRPCRouter({
  createProject: protectedProcedure.input(
    z.object({
      name: z.string(),
      githubUrl: z.string(),
      githubToken: z.string().optional(),
    })
  ).mutation(async ({ ctx, input }) => {
    const project = await ctx.db.project.create({
      data: {
        name: input.name,
        githubUrl: input.githubUrl,
        users: {
          create: { userId: ctx.user.userId! },
        },
      },
    });

    await indexGithubRepo(project.id, input.githubUrl, input.githubToken);
    await pollCommits(project.id);

    return project;
  }),
  getProjects: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.project.findMany({
      where: {
        users: {
          some: { userId: ctx.user.userId! }
        },
        deletedAt: null,
      },
    });
  }),
  getCommits: protectedProcedure.input(z.object({
    projectId: z.string(),
  })).query(async ({ ctx, input }) => {
    pollCommits(input.projectId).then().catch(console.error);
    return await ctx.db.commit.findMany({
      where: { projectId: input.projectId }
    });
  }),
  saveAnswer: protectedProcedure.input(z.object({
    projectId: z.string(),
    question: z.string(),
    answer: z.string(),
    fileReferences: z.any(),
  })).mutation(async ({ ctx, input }) => {
    return await ctx.db.question.create({
      data: {
        ...input,
        userId: ctx.user.userId!,
      }
    })
  }),
  getQuestion: protectedProcedure.input(z.object({
    projectId: z.string()
  })).query(async ({ ctx, input }) => {
    return await ctx.db.question.findMany({
      where: { projectId: input.projectId },
      include: { user: true },
      orderBy: { createdAt: 'asc' },
    });
  }),
  uploadMeeting: protectedProcedure.input(z.object({
    projectId: z.string(),
    meetingUrl: z.string(),
    name: z.string(),
  })).mutation(async ({ ctx, input }) => {
    const meeting = await ctx.db.meeting.create({
      data: {
        projectId: input.projectId,
        meetingUrl: input.meetingUrl,
        name: input.name,
        status: 'PROCESSING',
      },
    });
    return meeting;
  }),
  getMeetings: protectedProcedure.input(z.object({
    projectId: z.string()
  })).query(async ({ ctx, input }) => {
    return await ctx.db.meeting.findMany({
      where: { projectId: input.projectId },
      include: { issues: true },
    });
  }),
  deleteMeeting: protectedProcedure.input(z.object({
    meetingId: z.string()
  })).mutation(async ({ ctx, input }) => {
    return await ctx.db.meeting.delete({
      where: { id: input.meetingId },
    });
  }),
  getMeetingById: protectedProcedure.input(z.object({
    meetingId: z.string()
  })).query(async ({ ctx, input }) => {
    return await ctx.db.meeting.findUnique({
      where: { id: input.meetingId },
      include: { issues: true },
    });
  }),
});
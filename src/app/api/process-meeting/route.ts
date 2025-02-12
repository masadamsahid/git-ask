import { processMeeting } from "@/lib/assembly-ai";
import { db } from "@/server/db";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const bodyParser = z.object({
  projectId: z.string(),
  meetingId: z.string(),
  meetingUrl: z.string(),
});

export const maxDuration = 300; // 5 Mins

export async function POST(req: NextRequest, res: NextResponse) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { projectId, meetingId, meetingUrl } = bodyParser.parse(body);

    const { summaries } = await processMeeting(meetingUrl);
    await db.issue.createMany({
      data: summaries.map(s => ({
        ...s,
        meetingId,
      })),
    });

    await db.meeting.update({
      where: { id: meetingId },
      data: {
        status: "COMPLETED",
        name: summaries[0]!.headline,
      },
    })

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
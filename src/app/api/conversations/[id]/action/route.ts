import { NextRequest, NextResponse } from "next/server";
import { ConversationStatus, RealtimeEvent } from "../../../../../lib/types";

type ActionRequest =
  | { type: "read" }
  | { type: "status"; status: ConversationStatus }
  | { type: "assign"; agentId: string | null };

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body: ActionRequest = await request.json();
    const { id: conversationId } = await params;

    // Validate request
    if (!body.type) {
      return NextResponse.json(
        { error: "Missing action type" },
        { status: 400 }
      );
    }

    let event: RealtimeEvent;

    switch (body.type) {
      case "read":
        event = {
          type: "conversation:read",
          payload: { conversationId }
        };
        break;

      case "status":
        if (!body.status || !["open", "pending", "resolved"].includes(body.status)) {
          return NextResponse.json(
            { error: "Invalid status value" },
            { status: 400 }
          );
        }
        event = {
          type: "conversation:status",
          payload: { conversationId, status: body.status }
        };
        break;

      case "assign":
        event = {
          type: "conversation:assign",
          payload: { conversationId, agentId: body.agentId }
        };
        break;

      default:
        return NextResponse.json(
          { error: "Unknown action type" },
          { status: 400 }
        );
    }

    await new Promise(resolve => setTimeout(resolve, 100));

    return NextResponse.json({ event });

  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

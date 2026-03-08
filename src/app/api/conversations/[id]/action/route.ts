import { NextRequest, NextResponse } from "next/server";
import { ConversationStatus, RealtimeEvent } from "../../../../../lib/types";

type ActionRequest =
  | { type: "read" }
  | { type: "status"; status: ConversationStatus }
  | { type: "assign"; agentId: string | null };

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body: ActionRequest = await request.json();
    const conversationId = params.id;

    // Validate request
    if (!body.type) {
      return NextResponse.json(
        { error: "Missing action type" },
        { status: 400 }
      );
    }

    // Generate realtime event based on action type
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

    // In a real app, you would:
    // 1. Validate the conversation exists
    // 2. Update the database
    // 3. Broadcast the event to realtime subscribers
    // 4. Handle errors appropriately

    // For this mock implementation, simulate a small delay
    await new Promise(resolve => setTimeout(resolve, 100));

    // Return the realtime event that should be applied
    return NextResponse.json({ event });

  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

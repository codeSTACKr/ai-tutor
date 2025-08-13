"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { ObjectId } from "mongodb";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { 
  CreateLearningSessionSchema, 
  type LearningSession, 
  type ChatMessage,
  type Flashcard,
} from "@/lib/types";

async function getAuthenticatedUser() {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  
  if (!session?.user?.id) {
    redirect("/auth/login");
  }
  
  return session.user;
}

async function getLearningSessions() {
  const { database } = await connectToDatabase();
  return database.collection<Omit<LearningSession, '_id'> & { _id?: ObjectId }>('learningSessions');
}

function extractFlashcardsFromMessages(messages: ChatMessage[]): Flashcard[] {
  const flashcards: Flashcard[] = [];
  
  messages.forEach(message => {
    if (message.toolInvocations) {
      message.toolInvocations.forEach(invocation => {
        if (invocation.toolName === 'generateFlashcard' && invocation.result) {
          const result = invocation.result;
          const flashcard: Flashcard = {
            id: invocation.toolCallId,
            type: result.type as 'basic' | 'multiple-choice',
            question: result.question as string,
            answer: result.answer as string,
            options: result.options as string[] | undefined,
            explanation: result.explanation as string | undefined,
            answered: false,
          };
          flashcards.push(flashcard);
        }
      });
    }
  });
  
  return flashcards;
}

export async function createLearningSession(formData: FormData): Promise<{ success: boolean; sessionId?: string; error?: string }> {
  try {
    const user = await getAuthenticatedUser();
    
    const title = formData.get("title") as string;
    const subject = formData.get("subject") as string;
    const description = formData.get("description") as string;
    
    // Validate input with Zod schema
    const validatedData = CreateLearningSessionSchema.parse({ title, subject, description });

    // Get learning sessions collection
    const sessionsCollection = await getLearningSessions();

    const now = new Date();
    const newSession: Omit<LearningSession, '_id'> = {
      title: validatedData.title,
      subject: validatedData.subject,
      description: validatedData.description || "",
      userId: user.id,
      messages: [],
      flashcards: [],
      status: 'active',
      createdAt: now,
      updatedAt: now,
      lastAccessedAt: now,
    };

    const result = await sessionsCollection.insertOne(newSession);

    revalidatePath("/tutor");
    return { success: true, sessionId: result.insertedId.toString() };
  } catch (error) {
    console.error("Error creating learning session:", error);
    return { success: false, error: "Failed to create learning session" };
  }
}

export async function getUserLearningSessions(): Promise<LearningSession[]> {
  try {
    const user = await getAuthenticatedUser();

    // Get learning sessions collection
    const sessionsCollection = await getLearningSessions();

    // Query sessions with user ownership filter
    const sessions = await sessionsCollection
      .find({ userId: user.id })
      .sort({ lastAccessedAt: -1 })
      .toArray();

    return sessions.map(session => ({
      ...session,
      _id: session._id!.toString(),
    }));
  } catch (error) {
    console.error("Error fetching learning sessions:", error);
    return [];
  }
}

export async function getLearningSession(sessionId: string): Promise<LearningSession> {
  try {
    const user = await getAuthenticatedUser();
    
    // Validate ObjectId format
    if (!ObjectId.isValid(sessionId)) {
      throw new Error("Invalid session ID");
    }

    // Get learning sessions collection
    const sessionsCollection = await getLearningSessions();

    // Find session with user ownership check  
    const session = await sessionsCollection.findOne({
      _id: new ObjectId(sessionId),
      userId: user.id
    });

    if (!session) {
      redirect("/tutor");
    }

    // Update last accessed time
    await sessionsCollection.updateOne(
      { _id: new ObjectId(sessionId) },
      { $set: { lastAccessedAt: new Date() } }
    );

    return {
      ...session,
      _id: session._id!.toString(),
    };
  } catch (error) {
    console.error("Error fetching learning session:", error);
    redirect("/tutor");
  }
}

export async function updateSessionMessages(sessionId: string, messages: ChatMessage[]): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getAuthenticatedUser();
    
    // Validate ObjectId format
    if (!ObjectId.isValid(sessionId)) {
      return { success: false, error: "Invalid session ID" };
    }

    // Get learning sessions collection
    const sessionsCollection = await getLearningSessions();

    // Extract flashcards from messages
    const flashcards = extractFlashcardsFromMessages(messages);

    // Update messages and flashcards with user ownership check
    const result = await sessionsCollection.updateOne(
      { 
        _id: new ObjectId(sessionId),
        userId: user.id
      },
      {
        $set: {
          messages,
          flashcards,
          updatedAt: new Date(),
          lastAccessedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return { success: false, error: "Session not found or access denied" };
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating session messages:", error);
    return { success: false, error: "Failed to update session messages" };
  }
}

export async function deleteLearningSession(sessionId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getAuthenticatedUser();
    
    // Validate ObjectId format
    if (!ObjectId.isValid(sessionId)) {
      return { success: false, error: "Invalid session ID" };
    }

    // Get learning sessions collection
    const sessionsCollection = await getLearningSessions();

    // Delete with user ownership check
    const result = await sessionsCollection.deleteOne({
      _id: new ObjectId(sessionId),
      userId: user.id
    });

    if (result.deletedCount === 0) {
      return { success: false, error: "Session not found or access denied" };
    }

    revalidatePath("/tutor");
    return { success: true };
  } catch (error) {
    console.error("Error deleting learning session:", error);
    return { success: false, error: "Failed to delete learning session" };
  }
}


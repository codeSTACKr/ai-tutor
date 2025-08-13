"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { ObjectId } from "mongodb";
import { auth } from "@/lib/auth";
import { getTodosCollection } from "@/lib/mongodb";
import { CreateTodoSchema, UpdateTodoSchema, type Todo } from "@/lib/types";

async function getAuthenticatedUser() {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  
  if (!session?.user?.id) {
    redirect("/auth/login");
  }
  
  return session.user;
}

export async function createTodo(formData: FormData) {
  try {
    const user = await getAuthenticatedUser();
    
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    
    // Validate input with Zod schema
    const validatedData = CreateTodoSchema.parse({ title, description });

    // Get todos collection using shared connection
    const todosCollection = await getTodosCollection();

    const now = new Date();
    const newTodo = {
      title: validatedData.title,
      description: validatedData.description || "",
      completed: false,
      userId: user.id, // Use verified session user ID
      createdAt: now,
      updatedAt: now,
    };

    await todosCollection.insertOne(newTodo);

    revalidatePath("/todos");
  } catch (error) {
    console.error("Error creating todo:", error);
    throw new Error("Failed to create todo");
  }
}

export async function createTodoFromData(data: { title: string; description?: string }) {
  try {
    const user = await getAuthenticatedUser();
    
    // Validate input with Zod schema
    const validatedData = CreateTodoSchema.parse(data);

    // Get todos collection using shared connection
    const todosCollection = await getTodosCollection();

    const now = new Date();
    const newTodo = {
      title: validatedData.title,
      description: validatedData.description || "",
      completed: false,
      userId: user.id, // Use verified session user ID
      createdAt: now,
      updatedAt: now,
    };

    await todosCollection.insertOne(newTodo);

    revalidatePath("/todos");
  } catch (error) {
    console.error("Error creating todo:", error);
    throw new Error("Failed to create todo");
  }
}

export async function updateTodo(todoId: string, data: { completed?: boolean; title?: string; description?: string }) {
  try {
    const user = await getAuthenticatedUser();
    
    // Validate ObjectId format
    if (!ObjectId.isValid(todoId)) {
      throw new Error("Invalid todo ID");
    }

    // Validate input with Zod schema
    const validatedData = UpdateTodoSchema.parse(data);

    // Get todos collection using shared connection
    const todosCollection = await getTodosCollection();

    // Update with user ownership check - CRITICAL for security
    const result = await todosCollection.findOneAndUpdate(
      { 
        _id: new ObjectId(todoId),
        userId: user.id // Ensure user can only update their own todos
      },
      {
        $set: {
          ...validatedData,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    );

    if (!result) {
      throw new Error("Todo not found or access denied");
    }

    revalidatePath("/todos");
  } catch (error) {
    console.error("Error updating todo:", error);
    throw new Error("Failed to update todo");
  }
}

export async function deleteTodo(todoId: string) {
  try {
    const user = await getAuthenticatedUser();
    
    // Validate ObjectId format
    if (!ObjectId.isValid(todoId)) {
      throw new Error("Invalid todo ID");
    }

    // Get todos collection using shared connection
    const todosCollection = await getTodosCollection();

    // Delete with user ownership check - CRITICAL for security
    const result = await todosCollection.deleteOne({
      _id: new ObjectId(todoId),
      userId: user.id // Ensure user can only delete their own todos
    });

    if (result.deletedCount === 0) {
      throw new Error("Todo not found or access denied");
    }

    revalidatePath("/todos");
  } catch (error) {
    console.error("Error deleting todo:", error);
    throw new Error("Failed to delete todo");
  }
}

export async function getTodos(): Promise<Todo[]> {
  try {
    const user = await getAuthenticatedUser();

    // Get todos collection using shared connection
    const todosCollection = await getTodosCollection();

    // Query todos with user ownership filter - CRITICAL for security
    const todos = await todosCollection
      .find({ userId: user.id })
      .sort({ createdAt: -1 })
      .toArray();

    const formattedTodos: Todo[] = todos.map(todo => ({
      ...todo,
      _id: todo._id!.toString(),
    }));

    return formattedTodos;
  } catch (error) {
    console.error("Error fetching todos:", error);
    return [];
  }
}
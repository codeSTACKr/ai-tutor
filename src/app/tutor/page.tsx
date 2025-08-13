import { TutorChat } from "./tutor-chat";
import { getServerSession } from "@/lib/auth-server";

export default async function TutorPage() {
  const session = await getServerSession();
  
  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">AI Tutor</h1>
        <p className="text-gray-600">Ask me to create flashcards on any topic! 🎓</p>
      </div>
      
      <TutorChat session={session} />
    </div>
  );
}
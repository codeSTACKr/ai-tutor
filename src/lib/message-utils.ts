import { UIMessage, UIMessagePart, ToolUIPart, isToolUIPart, UIDataTypes, UITools } from "ai";
import { type ChatMessage } from "@/lib/types";

// Message format conversion utilities for AI SDK v5
export function convertChatMessagesToUIMessages(chatMessages: ChatMessage[]): UIMessage[] {
  return chatMessages
    .map(msg => {
      const parts: UIMessagePart<UIDataTypes, UITools>[] = [];
      
      // Add text content
      if (msg.content) {
        parts.push({ type: 'text', text: msg.content });
      }
      
      // Add tool invocations
      if (msg.toolInvocations && msg.toolInvocations.length > 0) {
        msg.toolInvocations.forEach(tool => {
          if (tool.result) {
            // Tool with result (completed)
            parts.push({
              type: `tool-${tool.toolName}` as const,
              toolCallId: tool.toolCallId,
              state: 'output-available',
              input: tool.args,
              output: tool.result
            } as ToolUIPart);
          } else {
            // Tool without result (in progress)
            parts.push({
              type: `tool-${tool.toolName}` as const,
              toolCallId: tool.toolCallId,
              state: 'input-available',
              input: tool.args
            } as ToolUIPart);
          }
        });
      }
      
      // Only return messages with content
      if (parts.length === 0) {
        return null;
      }
      
      return {
        id: msg.id,
        role: msg.role,
        parts
      } as UIMessage;
    })
    .filter((msg): msg is UIMessage => msg !== null);
}

export function convertUIMessagesToChatMessages(uiMessages: UIMessage[]): ChatMessage[] {
  return uiMessages.map(msg => {
    // Extract text content
    const textParts = msg.parts.filter(p => p.type === 'text');
    const content = textParts.map(p => 'text' in p ? p.text : '').join('');
    
    // Extract tool invocations
    const toolParts = msg.parts.filter(p => isToolUIPart(p));
    const toolInvocations = toolParts.map(part => {
      // Use input property for args (AI SDK v5 uses 'input' instead of 'args')
      let args: Record<string, unknown> = (part.input as Record<string, unknown>) || {};
      
      // For completed tools, try to reconstruct args from output if input is empty
      if (part.state === 'output-available' && part.output && 
          typeof part.output === 'object' && part.output !== null &&
          (!part.input || Object.keys(part.input as Record<string, unknown>).length === 0)) {
        // Try to reconstruct args from output for completed tool calls
        const output = part.output as Record<string, unknown>;
        if (output.type && output.question && output.answer) {
          args = {
            type: output.type,
            question: output.question,
            answer: output.answer,
            options: output.options,
            explanation: output.explanation
          };
        }
      }
      
      return {
        toolCallId: part.toolCallId,
        toolName: part.type.replace('tool-', ''),
        args,
        result: part.state === 'output-available' && part.output && typeof part.output === 'object' 
          ? part.output as Record<string, unknown> 
          : undefined
      };
    });
    
    return {
      id: msg.id,
      role: msg.role as 'user' | 'assistant',
      content,
      toolInvocations: toolInvocations.length > 0 ? toolInvocations : undefined,
      timestamp: new Date()
    };
  });
}
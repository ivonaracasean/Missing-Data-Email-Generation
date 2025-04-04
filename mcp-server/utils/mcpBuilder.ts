import { ChatCompletionMessageParam } from "openai/resources/chat";

export type MCPRequest = {
    system: string;
    user: string;
    context: {
        ticketName: string;
        missingVariables: string[];
        tone?: string;
        language?: string;
        inboxSummary?: string;
    };
    tools: any[];
};

export function buildMCP(ticketName: string, missingVariables: string[]): MCPRequest {
    return {
        system: "You are an AI assistant that writes polite emails for missing ticket info.",
        user: "Generate an email asking for the following missing variables:",
        context: {
            ticketName,
            missingVariables,
            tone: "polite",
            language: "English"
        },
        tools: []
    };
}

export function mcpToMessages(mcp: MCPRequest): ChatCompletionMessageParam[] {
    return [
        { role: "system", content: mcp.system },
        {
            role: "user",
            content: `${mcp.user}\n` +
                (mcp.context.ticketName ? `Ticket: ${mcp.context.ticketName}\n` : "") +
                (mcp.context.missingVariables?.length
                    ? `Missing: ${mcp.context.missingVariables.join(", ")}\n`
                    : "") +
                (mcp.context.inboxSummary
                    ? `\nEmails:\n${mcp.context.inboxSummary}`
                    : "")
        }
    ];
}


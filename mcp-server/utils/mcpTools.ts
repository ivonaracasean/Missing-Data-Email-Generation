import { getLatestInboxEmails } from "../services/imapService";
import { MCPRequest } from "./mcpBuilder";

function cleanSnippet(raw: string): string {
    return raw
        .replace(/<style[^>]*>.*?<\/style>/gis, "")
        .replace(/<[^>]+>/g, "")
        .replace(/https?:\/\/\S+/g, "")
        .replace(/=3D|=0A|=20|=C2|=A0|=E2/g, " ")
        .replace(/--.*?--/gs, "")
        .replace(/\[.*?\]/g, "")
        .replace(/([^\x00-\x7F])/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 300);
}

export async function runMCPTools(mcp: MCPRequest): Promise<MCPRequest> {
    for (const tool of mcp.tools || []) {
        if (tool.name === "summarizeInbox") {
            const emails = await getLatestInboxEmails(2);
            const summaryInput = emails.map((email, i) => {
                const clean = cleanSnippet(email.snippet || "");
                return `(${i + 1}) Subject: ${email.subject || "(no subject)"}\n${clean}`;
            }).join("\n\n");

            mcp.context.inboxSummary = summaryInput;
        }
    }
    return mcp;
}
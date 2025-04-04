import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { buildMCP, mcpToMessages, MCPRequest } from "./utils/mcpBuilder";
import { generateEmailFromMessages } from "./services/openaiService";
import { sendEmailSMTP } from "./services/smtpService";
import { getLatestInboxEmails } from "./services/imapService";
import {runMCPTools} from "./utils/mcpTools";

dotenv.config();
const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.post("/generate-email", async (req, res) => {
    try {
        const { ticketName, missingVariables } = req.body;
        const mcp: MCPRequest = buildMCP(ticketName, missingVariables);
        const messages = mcpToMessages(mcp);
        const email = await generateEmailFromMessages(messages);


        res.json({ result: email });
    } catch (err) {
        console.error("Error generating email:", err);
        res.status(500).json({ error: "Failed to generate email" });
    }
});

app.post("/summarize-inbox", async (_req, res) => {
    try {
        const mcp: MCPRequest = {
            system: "You are an AI assistant that summarizes recent email inbox content.",
            user: "Summarize the following emails:",
            context: { ticketName: "inbox_summary", missingVariables: [] },
            tools: [ { name: "summarizeInbox" } ]
        };

        const mcpWithTool = await runMCPTools(mcp);
        const messages = mcpToMessages(mcpWithTool);
        const summary = await generateEmailFromMessages(messages);

        res.json({ result: summary });
    } catch (err) {
        console.error("Error summarizing inbox:", err);
        res.status(500).json({ error: "Failed to summarize inbox" });
    }
});

app.post("/send-email", async (req, res) => {
    const { to, subject, body } = req.body;

    try {
        await sendEmailSMTP({ to, subject, body });
        res.json({ success: true });
    } catch (err) {
        console.error("Error sending email:", err);
        res.status(500).json({ error: "Failed to send email" });
    }
});

app.get("/inbox", async (_req, res) => {
    try {
        const emails = await getLatestInboxEmails();
        res.json({ emails });
    } catch (err) {
        console.error("Error reading inbox:", err);
        res.status(500).json({ error: "Failed to fetch inbox" });
    }
});

app.listen(port, () => {
    console.log(`MCP Server running at http://localhost:${port}`);
});

import imaps from "imap-simple";
import { simpleParser } from "mailparser";
import dotenv from "dotenv";
import qp from "quoted-printable";

dotenv.config();

export async function getLatestInboxEmails(limit = 2) {
    const config = {
        imap: {
            user: process.env.IMAP_USER!,
            password: process.env.IMAP_PASS!,
            host: process.env.IMAP_HOST!,
            port: parseInt(process.env.IMAP_PORT! || "993"),
            tls: true,
            tlsOptions: {
                rejectUnauthorized: false
            },
            authTimeout: 3000
        }
    };

    const connection = await imaps.connect(config);
    await connection.openBox("INBOX");

    const searchCriteria = ["UNSEEN", ["SINCE", new Date(Date.now() - 7 * 24 * 3600 * 1000)]];
    const fetchOptions = { bodies: ["HEADER", "TEXT"], markSeen: false };
    const messages = await connection.search(searchCriteria, fetchOptions);

    const emails = await Promise.all(
        messages.slice(0, limit).map(async (item) => {
            const allParts = item.parts.map((part: any) => part.body).join("\n");
            const parsed = await simpleParser(allParts);

            const rawHtml = parsed.html || "";
            const decodedHtml = qp.decode(rawHtml).toString();
            const cleanHtml = decodedHtml.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();

            const snippet = parsed.text?.trim()
                || cleanHtml.slice(0, 300)
                || "No preview available";

            return {
                from: parsed.from?.text || "Unknown",
                subject: parsed.subject || "(no subject)",
                date: parsed.date instanceof Date ? parsed.date.toISOString() : "Invalid Date",
                snippet
            };
        })
    );




    await connection.end();
    return emails;
}
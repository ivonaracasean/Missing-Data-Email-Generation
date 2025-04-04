import React, { useState, useEffect } from "react";
import axios from "axios";
import { extractedVariables, ticket } from "../utils/ticket";
import "../styles/MissingDataEmail.css";

const BACKEND_URL = "http://localhost:4000";

export const detectMissingVariables = (vars: Record<string, any>): string[] => {
    return Object.keys(vars).filter((key) => vars[key] === undefined);
};

type EmailPreview = {
    from: string;
    subject: string;
    date: string;
    snippet: string;
};

const MissingDataEmail: React.FC = () => {
    const [missingVariables, setMissingVariables] = useState<string[]>([]);
    const [generatedEmail, setGeneratedEmail] = useState<string>("");
    const [inbox, setInbox] = useState<EmailPreview[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isEditable, setIsEditable] = useState(false);
    const [emailSent, setEmailSent] = useState<boolean>(false);
    const [inboxSummary, setInboxSummary] = useState<string | null>(null);

    const fetchInbox = async () => {
        try {
            const res = await axios.get(`${BACKEND_URL}/inbox`);
            setInbox(res.data.emails);
        } catch (err) {
            console.error("Error loading inbox:", err);
        }
    };

    const handleGenerateEmail = async () => {
        setGeneratedEmail("");
        setError(null);
        setLoading(true);

        const missing = detectMissingVariables(extractedVariables);
        setMissingVariables(missing);

        if (missing.length === 0) {
            setLoading(false);
            return;
        }

        try {
            const res = await axios.post(`${BACKEND_URL}/generate-email`, {
                ticketName: ticket.ticketName,
                missingVariables: missing
            });
            setGeneratedEmail(res.data.result);
        } catch (err) {
            console.error("Error generating email:", err);
            setError("Failed to generate email.");
        } finally {
            setLoading(false);
        }
    };

    const handleSendEmail = async () => {
        if (!generatedEmail) return;

        try {
            await axios.post(`${BACKEND_URL}/send-email`, {
                to: ticket.issuer,
                subject: `Missing Information for Ticket: ${ticket.ticketName}`,
                body: generatedEmail
            });
            setEmailSent(true);
            alert("Email sent successfully!");
        } catch (err) {
            console.error("Error sending email:", err);
            setError("Failed to send email.");
        }
    };

    const handleSummarizeInbox = async () => {
        try {
            const response = await axios.post(`${BACKEND_URL}/summarize-inbox`);
            setInboxSummary(response.data.result);
        } catch (err) {
            console.error("Error summarizing inbox:", err);
            alert("Failed to summarize inbox");
        }
    };

    useEffect(() => {
        fetchInbox();
    }, []);

    return (
        <div className="container">
            <h2>Missing Data Email Generator</h2>

            <div className="section">
                <h3>Ticket Details</h3>
                <pre>{JSON.stringify(ticket, null, 2)}</pre>
            </div>

            <div className="section">
                <h3>Extracted Variables</h3>
                <ul>
                    {Object.entries(extractedVariables).map(([key, value]) => (
                        <li key={key}>
                            <strong>{key}:</strong> {value !== undefined ? value.toString() :
                            <span className="missing">Missing</span>}
                        </li>
                    ))}
                </ul>
            </div>

            <button className="button" onClick={handleGenerateEmail} disabled={loading}>
                {loading ? "Generating..." : "Generate Email"}
            </button>

            {missingVariables.length > 0 && (
                <div className="section">
                    <h3 className="missing">Missing Variables:</h3>
                    <ul>
                        {missingVariables.map((variable) => (
                            <li key={variable}>{variable}</li>
                        ))}
                    </ul>
                </div>
            )}

            {generatedEmail && (
                <div className="section">
                    <h3>Generated Email:</h3>
                    <textarea
                        className="email-textbox"
                        value={generatedEmail}
                        onChange={(e) => setGeneratedEmail(e.target.value)}
                        readOnly={!isEditable}
                    />
                    <div className="button-group">
                        <button className="button" onClick={() => setIsEditable(!isEditable)}>
                            {isEditable ? "Done Editing" : "Edit Email"}
                        </button>
                        <button className="button send-button" onClick={handleSendEmail} disabled={emailSent}>
                            {emailSent ? "Email Sent" : "Send Email"}
                        </button>
                    </div>
                </div>
            )}

            {error && <div className="error">{error}</div>}

            <div className="section">
                <h3>📥 Recent Inbox Emails</h3>
                {inbox.length === 0 ? (
                    <p>No recent emails found.</p>
                ) : (
                    <ul>
                        {inbox.map((email, index) => (
                            <li key={index}>
                                <strong>From:</strong> {email.from}<br/>
                                <strong>Subject:</strong> {email.subject}<br/>
                                <strong>Date:</strong> {new Date(email.date).toLocaleString()}<br/>
                                <strong>Preview:</strong> {email.snippet}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            <div className="section">
                <h3>AI Inbox Summary</h3>
                <button className="button" onClick={handleSummarizeInbox}>Summarize Inbox</button>

                {inboxSummary && (
                    <pre style={{marginTop: "10px", background: "#f4f4f4", padding: "10px", borderRadius: "5px"}}>
      {inboxSummary}
    </pre>
                )}
            </div>
        </div>
    );
};

export default MissingDataEmail;

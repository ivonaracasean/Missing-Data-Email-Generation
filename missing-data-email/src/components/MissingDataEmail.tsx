import React, { useState } from "react";
import { extractedVariables, ticket } from "../utils/ticket";
import { generatePrompt } from "../utils/prompt";
import { OpenAI } from "openai";
import emailjs from "emailjs-com";
import "../styles/MissingDataEmail.css";

const openai = new OpenAI({
    apiKey: process.env.REACT_APP_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true,
});

export const detectMissingVariables = (extractedVariables: Record<string, any>): string[] => {
    return Object.keys(extractedVariables).filter((key) => extractedVariables[key] === undefined);
};

const MissingDataEmail: React.FC = () => {
    const [missingVariables, setMissingVariables] = useState<string[]>([]);
    const [generatedEmail, setGeneratedEmail] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isEditable, setIsEditable] = useState(false);
    const [emailSent, setEmailSent] = useState<boolean>(false);

    // Function to generate email using OpenAI
    const handleGenerateEmail = async () => {
        setGeneratedEmail("");
        setError(null);
        setLoading(true);

        // Detect missing variables
        const missing = detectMissingVariables(extractedVariables);
        setMissingVariables(missing);

        if (missing.length === 0) {
            setLoading(false);
            return;
        }

        // Generate the AI prompt
        const prompt = generatePrompt(missing, ticket.ticketName);

        try {
            const response = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [{ role: "system", content: prompt }],
            });

            setGeneratedEmail(response.choices[0]?.message?.content || "Error generating email.");
        } catch (err) {
            console.error("Error fetching OpenAI response:", err);
            setError("Failed to generate email.");
        } finally {
            setLoading(false);
        }
    };

    // Function to toggle edit mode
    const toggleEditEmail = () => {
        setIsEditable((prev) => !prev);
    };

    const handleSendEmail = async () => {
        if (!generatedEmail) return;

        const serviceID = process.env.REACT_APP_SERVICE_ID || "";
        const userID = process.env.REACT_APP_USER_ID || "";
        const templateID = process.env.REACT_APP_TEMPLATE_ID || "";

        const emailParams = {
            to_email: ticket.issuer,
            from_name: "User1",
            subject: `Missing Information for Ticket: ${ticket.ticketName}`,
            message: generatedEmail,
        };

        try {
            await emailjs.send(serviceID, templateID, emailParams, userID);
            setEmailSent(true);
            alert("Email sent successfully!");
        } catch (err) {
            console.error("Error sending email:", err);
            setError("Failed to send email.");
        }
    };

    return (
        <div className="container">
            <h2>Missing Data Email Generator</h2>

            {/* Ticket Details */}
            <div className="section">
                <h3>Ticket Details</h3>
                <pre>{JSON.stringify(ticket, null, 2)}</pre>
            </div>

            {/* Extracted Variables */}
            <div className="section">
                <h3>Extracted Variables</h3>
                <ul>
                    {Object.entries(extractedVariables).map(([key, value]) => (
                        <li key={key}>
                            <strong>{key}:</strong> {value !== undefined ? value.toString() : <span className="missing">Missing</span>}
                        </li>
                    ))}
                </ul>
            </div>

            <button className="button" onClick={handleGenerateEmail} disabled={loading}>
                {loading ? "Generating..." : "Generate Email"}
            </button>

            {/* Display Missing Variables */}
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

            {/* Editable Email Textbox + Toggle Button */}
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
                        <button className="button" onClick={toggleEditEmail}>
                            {isEditable ? "Email is Ready" : "Modify Email"}
                        </button>
                        <button className="button send-button" onClick={handleSendEmail} disabled={emailSent}>
                            {emailSent ? "Email Sent" : "Send Email"}
                        </button>
                    </div>
                </div>
            )}

            {/* Display Error (if any) */}
            {error && <div className="error">{error}</div>}
        </div>
    );
};

export default MissingDataEmail;

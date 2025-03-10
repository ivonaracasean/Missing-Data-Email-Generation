export const generatePrompt = (missingVariables: string[], ticketName: string) => {
    return `
### Context:
You are an AI assistant that helps generate emails to request missing information for a ticket.

### Task:
Generate a professional and polite email asking for the missing details related to ticket **"${ticketName}"**. Below is a list of missing variables:

${missingVariables.map((v) => `- ${v}`).join("\n")}

Make the email:
- Clear and concise
- Respectful and polite
- Friendly but professional
- Mention something like: possibly it is your mistake because you're a simple AI

### Example Email:
---
Dear customer,

We are currently processing your request regarding "${ticketName}". However, we noticed that some important details are missing:

- [Missing Variable 1]
- [Missing Variable 2]

Could you please provide this information at your earliest convenience? This will help us resolve your request as quickly as possible.

Looking forward to your response!

Best regards,    
Support Team
---
**Generate a similar email using the missing variables listed above. Please don't generate the subject too.**  
`;
};

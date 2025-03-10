export const ticket = {
    ticketName: "ITSM-HCL-5",
    issuer: "ivonamaria14@gmail.com",
    issue: `
    * In the EPX the discombobulator (item code 1234-44) has an incorrect price.
    * The price is currently 55.55.
    * The price should be 44.44.
    Please update this price in the EPX production.
  `,
};

export const extractedVariables = {
    correctedPrice: 44.44,
    currentPrice: 55.55,
    environment: undefined,
    issuer: ticket.issuer,
    itemId: '1234-44',
    itemName: undefined,
    ticketName: "Update price of discombobulator",
};

export const SendEmail = async ({ to, subject, body }) => {
    console.log(`Mock SendEmail to: ${to}, Subject: ${subject}, Body: ${body}`);
    return Promise.resolve({ success: true });
};

const nodemailer = require("nodemailer");
const googleApis = require("googleapis");
const REDIRECT_URI = `https://developers.google.com/oauthplayground`;
const CLIENT_ID = `64008610094-cdfqsnqir4bpj9b4s72m7ifda0husemr.apps.googleusercontent.com`;
const CLIENT_SECRET = `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`;
const REFRESH_TOKEN = `1//048K5eWZp36lfCgYIARAAGAQSNwF-L9IriqjPwi35IqIM4MutNUQ3Ac_JAvgDB31h7RRmmvzTAsWoGixrTjEdZMsCN229vBOSkJc`;
const authClient = new googleApis.google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET,
    REDIRECT_URI);


authClient.setCredentials({ refresh_token: REFRESH_TOKEN });

async function mailer(reciverMail,id,otp,validTill) {
    try {
        const ACCESS_TOKEN = await authClient.getAccessToken();
        const transport = nodemailer.createTransport({
            service: "gmail",
            auth: {
                type: "OAuth2",
                user: "prateeknashine@gmail.com",
                clientId: CLIENT_ID,
                clientSecret: CLIENT_SECRET,
                refreshToken: REFRESH_TOKEN,
                accessToken: ACCESS_TOKEN
            }
        })
        const details = {
            from: "Prateek Nashine <prateeknashine@gmail.com>",
            to: reciverMail,
            subject: "Password reset link",
            text: "message text",
            html: `<h2>Click on the link to change your password.<br>Link will be valid till 24hours i.e ${validTill}<br><a href='http://localhost:3000/changepassword/${id}/${otp}'>http://localhost:3000/changepassword/${id}/${otp}</a></h2>`
        }
        const result = await transport.sendMail(details);
        return result;
    }
    catch (err) {
        return err;
    }
}

module.exports = mailer;

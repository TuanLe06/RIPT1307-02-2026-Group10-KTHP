declare module 'sib-api-v3-sdk' {
  export class ApiClient {
    static instance: ApiClient;
    authentications: { [key: string]: { apiKey: string } };
  }

  export class TransactionalEmailsApi {
    sendTransacEmail(email: SendSmtpEmail): Promise<{ messageId: string }>;
  }

  export class SendSmtpEmail {
    subject: string;
    htmlContent: string;
    textContent: string;
    sender: { name: string; email: string };
    to: { email: string }[];
  }
}

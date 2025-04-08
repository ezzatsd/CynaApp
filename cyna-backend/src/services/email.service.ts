interface EmailOptions {
    to: string;
    subject: string;
    text: string; // Contenu texte simple
    html?: string; // Contenu HTML (optionnel)
}

/**
 * Simulation simple d'un service d'envoi d'emails.
 * Affiche les détails de l'email dans la console.
 * A remplacer par une vraie intégration (Nodemailer, SendGrid, Mailgun...) en production.
 */
export class EmailService {
    static async sendEmail(options: EmailOptions): Promise<void> {
        console.log('---- Sending Email (Simulation) ----');
        console.log(`To: ${options.to}`);
        console.log(`Subject: ${options.subject}`);
        console.log('---- Body ----');
        console.log(options.text);
        if (options.html) {
            console.log('---- HTML Body ----');
            console.log(options.html);
        }
        console.log('---- End Email ----');
        // Simule un succès immédiat
        // Dans un vrai service, il y aurait un appel API externe ici
        return Promise.resolve();
    }

    /**
     * Envoie un email de réinitialisation de mot de passe (simulation).
     */
    static async sendPasswordResetEmail(to: string, token: string): Promise<void> {
        // Construire l'URL de réinitialisation (à adapter à l'URL du frontend)
        const resetUrl = `http://localhost:3000/reset-password/${token}`; // URL Frontend exemple

        const emailOptions: EmailOptions = {
            to: to,
            subject: 'Réinitialisation de votre mot de passe - CynaApp',
            text: `Vous recevez cet email car vous (ou quelqu'un d'autre) avez demandé la réinitialisation du mot de passe de votre compte.\n\n` +
                  `Cliquez sur le lien suivant, ou collez-le dans votre navigateur pour compléter le processus :\n\n` +
                  `${resetUrl}\n\n` +
                  `Si vous n'avez pas demandé cela, veuillez ignorer cet email et votre mot de passe restera inchangé.\n`,
            // Optionnel: Ajouter une version HTML plus jolie
            html: `<p>Vous recevez cet email car vous (ou quelqu'un d'autre) avez demandé la réinitialisation du mot de passe de votre compte.</p>` +
                  `<p>Cliquez sur le lien suivant, ou collez-le dans votre navigateur pour compléter le processus :</p>` +
                  `<p><a href="${resetUrl}">${resetUrl}</a></p>` +
                  `<p>Si vous n'avez pas demandé cela, veuillez ignorer cet email et votre mot de passe restera inchangé.</p>`,
        };

        await this.sendEmail(emailOptions);
    }
} 
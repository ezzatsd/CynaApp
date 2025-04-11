import nodemailer from 'nodemailer';
import config from '../config'; // Importer la config pour les variables d'env
import logger from '../config/logger'; // Importer le logger

interface EmailOptions {
    to: string;
    subject: string;
    text: string; // Contenu texte simple
    html?: string; // Contenu HTML (optionnel)
}

/**
 * Service d'envoi d'emails utilisant Nodemailer.
 * Lit la configuration SMTP depuis les variables d'environnement.
 * Peut utiliser un compte Ethereal pour les tests si non configuré.
 */
export class EmailService {
    private static transporter: nodemailer.Transporter | null = null;

    /**
     * Initialise le transporter Nodemailer.
     * Appelé une seule fois ou lorsque nécessaire.
     */
    private static async initializeTransporter() {
        if (this.transporter) {
            return; // Déjà initialisé
        }

        try {
            // Vérifier si les variables d'environnement SMTP sont définies
            if (config.smtpHost && config.smtpPort && config.smtpUser && config.smtpPass) {
                logger.info(`Initializing Nodemailer transporter with provided SMTP config: ${config.smtpHost}`);
                this.transporter = nodemailer.createTransport({
                    host: config.smtpHost,
                    port: config.smtpPort,
                    secure: config.smtpPort === 465, // true for 465, false for other ports
                    auth: {
                        user: config.smtpUser,
                        pass: config.smtpPass,
                    },
                });
            } else {
                // Sinon, créer un compte de test Ethereal
                logger.warn('SMTP config not found in .env, creating Ethereal test account...');
                const testAccount = await nodemailer.createTestAccount();
                logger.info(`Ethereal test account created: User=${testAccount.user}, Pass=${testAccount.pass}`);
                 this.transporter = nodemailer.createTransport({
                    host: 'smtp.ethereal.email',
                    port: 587,
                    secure: false, // false for TLS
                    auth: {
                        user: testAccount.user, // Compte Ethereal généré
                        pass: testAccount.pass, // Mot de passe Ethereal généré
                    },
                });
            }
             // Vérifier la connexion (optionnel mais recommandé)
             await this.transporter.verify();
             logger.info('Nodemailer transporter initialized and verified successfully.');

        } catch (error: unknown) {
            const err = error as Error;
            logger.error('Failed to initialize or verify Nodemailer transporter:', { error: err.message, stack: err.stack });
            // Ne pas réinitialiser transporter pour éviter les tentatives répétées en cas d'échec persistant
            // L'envoi échouera simplement si transporter reste null.
             this.transporter = null; // Assurer qu'il est null si init échoue
        }
    }

    /**
     * Envoie un email en utilisant le transporter configuré.
     */
    static async sendEmail(options: EmailOptions): Promise<void> {
        // Initialiser le transporter si ce n'est pas déjà fait
        if (!this.transporter) {
           await this.initializeTransporter();
        }
        
        // Vérifier si le transporter est prêt après tentative d'initialisation
        if (!this.transporter) {
            logger.error('Cannot send email because Nodemailer transporter is not initialized.');
            // Optionnel : lever une erreur ou simplement ne rien faire
            throw new Error('Email service is not available.'); 
            // return; 
        }

        const mailOptions = {
            from: config.emailFrom, // Lire l'email expéditeur depuis la config
            to: options.to,
            subject: options.subject,
            text: options.text,
            html: options.html,
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            logger.info(`Email sent successfully to ${options.to}: ${info.messageId}`);
             // Si on utilise Ethereal, afficher l'URL de prévisualisation
            if (this.transporter.options && (this.transporter.options as any).host === 'smtp.ethereal.email') {
                logger.info(`Preview URL (Ethereal): ${nodemailer.getTestMessageUrl(info)}`);
            }
        } catch (error: unknown) {
            const err = error as Error;
            logger.error(`Failed to send email to ${options.to}:`, { error: err.message, stack: err.stack });
            // Relancer l'erreur pour que l'appelant sache que l'envoi a échoué
            throw new Error(`Failed to send email: ${err.message}`);
        }
    }

    /**
     * Envoie un email de réinitialisation de mot de passe.
     * La logique interne reste la même, elle appelle juste sendEmail.
     */
    static async sendPasswordResetEmail(to: string, token: string): Promise<void> {
        const resetUrl = `${config.frontendUrl}/reset-password/${token}`; // Utiliser l'URL du frontend depuis la config

        const emailOptions: EmailOptions = {
            to: to,
            subject: 'Réinitialisation de votre mot de passe - CynaApp',
            text: `Vous recevez cet email... Cliquez sur le lien suivant :\n\n${resetUrl}\n\nSi vous n'avez pas demandé cela, ignorez cet email.\n`,
            html: `<p>Vous recevez cet email... Cliquez sur le lien suivant :</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>Si vous n'avez pas demandé cela, ignorez cet email.</p>`,
        };

        // L'appel à sendEmail gère l'initialisation et l'envoi
        await this.sendEmail(emailOptions);
    }
} 
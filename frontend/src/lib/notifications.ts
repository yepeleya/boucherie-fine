import nodemailer from 'nodemailer';

interface OrderNotificationData {
  customerEmail: string;
  customerName: string;
  orderNumber: string;
  orderTotal: number;
  orderStatus: string;
  orderItems: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

/**
 * Configuration du transporteur email
 */
function getEmailTransporter() {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

/**
 * Envoie une notification de confirmation de commande
 */
export async function sendOrderConfirmationEmail(data: OrderNotificationData) {
  try {
    if (!process.env.SMTP_USER) {
      console.log('SMTP non configuré, simulation email de confirmation:', data);
      return;
    }

    const transporter = getEmailTransporter();
    
    const itemsList = data.orderItems
      .map(item => `• ${item.name} x${item.quantity} - ${item.price * item.quantity} FCFA`)
      .join('\n');

    const mailOptions = {
      from: `"La Boucherie-Fine" <${process.env.SMTP_USER}>`,
      to: data.customerEmail,
      subject: `Confirmation de commande #${data.orderNumber}`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <div style="background: #D60000; color: white; padding: 20px; text-align: center;">
            <h1>La Boucherie-Fine</h1>
            <p>Confirmation de votre commande</p>
          </div>
          
          <div style="padding: 20px; background: #f9f9f9;">
            <h2>Bonjour ${data.customerName},</h2>
            
            <p>Nous avons bien reçu votre commande <strong>#${data.orderNumber}</strong>.</p>
            
            <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3>Détails de votre commande:</h3>
              <pre style="font-family: Arial; line-height: 1.6;">${itemsList}</pre>
              <hr>
              <p style="font-weight: bold; font-size: 18px;">Total: ${data.orderTotal} FCFA</p>
            </div>
            
            <p>Statut actuel: <strong>${data.orderStatus}</strong></p>
            
            <p>Nous vous tiendrons informé(e) de l'avancement de votre commande.</p>
            
            <div style="background: #D60000; color: white; padding: 15px; border-radius: 8px; margin-top: 20px;">
              <h3>Informations pratiques:</h3>
              <p>📞 Téléphone: +225 05 44 54 47 35</p>
              <p>📍 Adresse: Riviera 3, Abidjan</p>
              <p>🕒 Horaires: Lun-Sam 11h-23h, Dim 15h-23h</p>
            </div>
            
            <p style="margin-top: 20px;">
              Merci de votre confiance !<br>
              <strong>L'équipe La Boucherie-Fine</strong>
            </p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email de confirmation envoyé à ${data.customerEmail}`);
    
  } catch (error) {
    console.error('Erreur envoi email confirmation:', error);
  }
}

/**
 * Envoie une notification de changement de statut
 */
export async function sendOrderStatusUpdateEmail(
  customerEmail: string, 
  customerName: string,
  orderNumber: string, 
  newStatus: string
) {
  try {
    if (!process.env.SMTP_USER) {
      console.log(`Simulation email statut ${newStatus} pour commande ${orderNumber}`);
      return;
    }

    const transporter = getEmailTransporter();
    
    const statusMessages: { [key: string]: { title: string; message: string; color: string } } = {
      'PAYEE': {
        title: 'Paiement confirmé ✅',
        message: 'Votre paiement a été confirmé. Nous préparons votre commande.',
        color: '#28a745'
      },
      'EN_PREPARATION': {
        title: 'Commande en préparation 👨‍🍳',
        message: 'Nos chefs préparent votre commande avec soin.',
        color: '#fd7e14'
      },
      'PRETE': {
        title: 'Commande prête ! 🎉',
        message: 'Votre commande est prête. Vous pouvez venir la récupérer.',
        color: '#007bff'
      },
      'EN_LIVRAISON': {
        title: 'Commande en livraison 🚗',
        message: 'Votre commande est en cours de livraison.',
        color: '#6f42c1'
      },
      'LIVREE': {
        title: 'Commande livrée ! ✨',
        message: 'Votre commande a été livrée avec succès. Bon appétit !',
        color: '#28a745'
      }
    };

    const statusInfo = statusMessages[newStatus] || {
      title: 'Mise à jour de commande',
      message: `Statut de votre commande: ${newStatus}`,
      color: '#6c757d'
    };

    const mailOptions = {
      from: `"La Boucherie-Fine" <${process.env.SMTP_USER}>`,
      to: customerEmail,
      subject: `${statusInfo.title} - Commande #${orderNumber}`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <div style="background: ${statusInfo.color}; color: white; padding: 20px; text-align: center;">
            <h1>La Boucherie-Fine</h1>
            <h2>${statusInfo.title}</h2>
          </div>
          
          <div style="padding: 20px; background: #f9f9f9;">
            <h3>Bonjour ${customerName},</h3>
            
            <p>${statusInfo.message}</p>
            
            <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
              <p><strong>Commande #${orderNumber}</strong></p>
              <p style="color: ${statusInfo.color}; font-size: 18px; font-weight: bold;">${newStatus}</p>
            </div>
            
            <p>
              Merci de votre confiance !<br>
              <strong>L'équipe La Boucherie-Fine</strong>
            </p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email de mise à jour statut envoyé à ${customerEmail}`);
    
  } catch (error) {
    console.error('Erreur envoi email mise à jour:', error);
  }
}

interface AdminOrderNotificationData {
  id: number;
  numero: string;
  total: number;
  typeCommande: string;
  utilisateur: {
    nom: string;
    email: string;
  };
}

/**
 * Envoie une notification à l'admin pour nouvelle commande
 */
export async function sendNewOrderNotificationToAdmin(orderData: AdminOrderNotificationData) {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail || !process.env.SMTP_USER) {
      console.log('Notification admin simulée pour nouvelle commande:', orderData.numero);
      return;
    }

    const transporter = getEmailTransporter();
    
    const mailOptions = {
      from: `"La Boucherie-Fine" <${process.env.SMTP_USER}>`,
      to: adminEmail,
      subject: `🔔 Nouvelle commande #${orderData.numero}`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <div style="background: #D60000; color: white; padding: 20px; text-align: center;">
            <h1>Nouvelle commande reçue !</h1>
          </div>
          
          <div style="padding: 20px; background: #f9f9f9;">
            <h3>Détails de la commande:</h3>
            
            <p><strong>Numéro:</strong> #${orderData.numero}</p>
            <p><strong>Client:</strong> ${orderData.utilisateur.nom}</p>
            <p><strong>Email:</strong> ${orderData.utilisateur.email}</p>
            <p><strong>Total:</strong> ${orderData.total} FCFA</p>
            <p><strong>Type:</strong> ${orderData.typeCommande}</p>
            
            <div style="margin-top: 20px;">
              <a href="${process.env.NEXTAUTH_URL}/admin/commandes/${orderData.id}" 
                 style="background: #D60000; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                Voir la commande
              </a>
            </div>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Notification admin envoyée pour commande ${orderData.numero}`);
    
  } catch (error) {
    console.error('Erreur envoi notification admin:', error);
  }
}
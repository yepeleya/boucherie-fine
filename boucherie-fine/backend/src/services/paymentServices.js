// Service de paiement pour PayDunya
class PayDunyaService {
  constructor() {
    this.masterKey = process.env.PAYDUNYA_MASTER_KEY;
    this.privateKey = process.env.PAYDUNYA_PRIVATE_KEY;
    this.token = process.env.PAYDUNYA_TOKEN;
    this.mode = process.env.PAYDUNYA_MODE || 'sandbox';
    this.baseUrl = this.mode === 'sandbox' 
      ? 'https://app.paydunya.com/sandbox-api/v1'
      : 'https://app.paydunya.com/api/v1';
  }

  async initiatePayment(paymentData) {
    try {
      const response = await fetch(`${this.baseUrl}/checkout-invoice/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'PAYDUNYA-MASTER-KEY': this.masterKey,
          'PAYDUNYA-PRIVATE-KEY': this.privateKey,
          'PAYDUNYA-TOKEN': this.token
        },
        body: JSON.stringify({
          invoice: {
            total_amount: paymentData.montant,
            description: paymentData.description || 'Commande La Boucherie Fine',
            return_url: paymentData.returnUrl,
            cancel_url: paymentData.cancelUrl,
            callback_url: paymentData.callbackUrl
          },
          store: {
            name: 'La Boucherie Fine',
            tagline: 'Viandes de qualité premium'
          },
          actions: {
            cancel_url: paymentData.cancelUrl,
            return_url: paymentData.returnUrl,
            callback_url: paymentData.callbackUrl
          }
        })
      });

      const result = await response.json();
      
      if (result.response_code === '00') {
        return {
          success: true,
          paymentUrl: result.response_text,
          token: result.token,
          invoiceUrl: result.invoice_url
        };
      } else {
        throw new Error(result.response_text || 'Erreur lors de l\'initiation du paiement');
      }
    } catch (error) {
      console.error('Erreur PayDunya:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async verifyPayment(token) {
    try {
      const response = await fetch(`${this.baseUrl}/checkout-invoice/confirm/${token}`, {
        method: 'GET',
        headers: {
          'PAYDUNYA-MASTER-KEY': this.masterKey,
          'PAYDUNYA-PRIVATE-KEY': this.privateKey,
          'PAYDUNYA-TOKEN': this.token
        }
      });

      const result = await response.json();
      
      return {
        success: result.response_code === '00',
        status: result.invoice.status, // 'completed', 'pending', 'cancelled'
        amount: result.invoice.total_amount,
        transactionId: result.invoice.receipt_url
      };
    } catch (error) {
      console.error('Erreur vérification PayDunya:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Service de paiement pour Fusion Money
class FusionMoneyService {
  constructor() {
    this.apiKey = process.env.FUSION_MONEY_API_KEY;
    this.secretKey = process.env.FUSION_MONEY_SECRET_KEY;
    this.mode = process.env.FUSION_MONEY_MODE || 'sandbox';
    this.baseUrl = this.mode === 'sandbox' 
      ? 'https://sandbox.fusionmoney.ci/api'
      : 'https://api.fusionmoney.ci/api';
  }

  async initiatePayment(paymentData) {
    try {
      const response = await fetch(`${this.baseUrl}/payment/init`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'X-Secret-Key': this.secretKey
        },
        body: JSON.stringify({
          amount: paymentData.montant,
          currency: 'XOF',
          description: paymentData.description || 'Commande La Boucherie Fine',
          return_url: paymentData.returnUrl,
          cancel_url: paymentData.cancelUrl,
          webhook_url: paymentData.callbackUrl,
          customer: {
            email: paymentData.customerEmail,
            name: paymentData.customerName
          }
        })
      });

      const result = await response.json();
      
      if (result.success) {
        return {
          success: true,
          paymentUrl: result.data.payment_url,
          transactionId: result.data.transaction_id,
          reference: result.data.reference
        };
      } else {
        throw new Error(result.message || 'Erreur lors de l\'initiation du paiement');
      }
    } catch (error) {
      console.error('Erreur Fusion Money:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async verifyPayment(transactionId) {
    try {
      const response = await fetch(`${this.baseUrl}/payment/verify/${transactionId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'X-Secret-Key': this.secretKey
        }
      });

      const result = await response.json();
      
      return {
        success: result.success && result.data.status === 'success',
        status: result.data.status, // 'success', 'pending', 'failed'
        amount: result.data.amount,
        transactionId: result.data.transaction_id,
        reference: result.data.reference
      };
    } catch (error) {
      console.error('Erreur vérification Fusion Money:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = {
  PayDunyaService,
  FusionMoneyService
};
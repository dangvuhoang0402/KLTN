const axios = require('axios');
const { Buffer } = require('buffer');
const cloudinary = require('cloudinary').v2;
require('../config/cloudinary.config')();  // Initialize Cloudinary config

class PaypalService {
    constructor() {
        this.baseURL = 'https://api-m.sandbox.paypal.com';
        this.accessToken = null;
        this.axiosInstance = axios.create({
            timeout: 10000,
            maxRetries: 3,
            retryDelay: 1000
        });
    }

    async getAccessToken() {
        try {
            const endpoint = `${this.baseURL}/v1/oauth2/token`;
            console.log('Getting access token from:', endpoint);

            const auth = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString('base64');
            console.log('Using Basic auth:', auth.substring(0, 20) + '...');

            const response = await this.axiosInstance.post(endpoint,
                'grant_type=client_credentials',
                {
                    headers: {
                        'Authorization': `Basic ${auth}`,
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }
            );
            return response.data.access_token;
        } catch (error) {
            console.error('PayPal authentication error:', error);
            throw new Error('Failed to authenticate with PayPal');
        }
    }

    async createInvoice(orderData) {
        try {
            const token = await this.getAccessToken();
            const endpoint = `${this.baseURL}/v1/invoicing/invoices`;
            
            console.log('Creating invoice at:', endpoint);
            console.log('Using Bearer token:', token.substring(0, 20) + '...');
            console.log('Request body:', JSON.stringify(orderData, null, 2));

            const response = await this.axiosInstance.post(endpoint,
                {
                    merchant_info: {
                        business_name: "Tiệm cơm"
                    },
                    items: orderData.items
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('Invoice creation response:', JSON.stringify(response.data, null, 2));
            
            const invoiceId = response.data.id;
            const sendLink = response.data.links.find(link => link.rel === 'send')?.href;

            return {
                invoiceId,
                invoiceData: response.data,
                sendLink
            };
        } catch (error) {
            console.error('PayPal invoice creation error:', error);
            throw new Error('Failed to create PayPal invoice');
        }
    }

    async sendInvoice(invoiceId) {
        try {
            const token = await this.getAccessToken();
            const endpoint = `${this.baseURL}/v1/invoicing/invoices/${invoiceId}/send`;
            
            console.log('Sending invoice at:', endpoint);
            console.log('Using Bearer token:', token.substring(0, 20) + '...');

            const response = await this.axiosInstance.post(endpoint,
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            return response.data;
        } catch (error) {
            console.error('PayPal send invoice error:', error);
            throw new Error('Failed to send PayPal invoice');
        }
    }

    async generateQRCode(invoiceId) {
        try {
            const token = await this.getAccessToken();
            const endpoint = `${this.baseURL}/v1/invoicing/invoices/${invoiceId}/qr-code`;
            
            console.log('Generating QR code at:', endpoint);
            console.log('Using Bearer token:', token.substring(0, 20) + '...');
    
            const response = await this.axiosInstance.get(endpoint, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            // Convert base64 to buffer and create temp file path
            const imageBuffer = Buffer.from(response.data.image, 'base64');
            
            // Upload to Cloudinary using the existing configuration
            const uploadResponse = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        folder: 'qr-codes',
                        public_id: `qr-${invoiceId}`,
                        resource_type: 'image'
                    },
                    (error, result) => {
                        if (error) {
                            console.error('Cloudinary upload failed:', error);
                            reject(error);
                        } else {
                            console.log('Cloudinary upload success:', result.secure_url);
                            resolve(result);
                        }
                    }
                );
                
                uploadStream.end(imageBuffer);
            });

            return uploadResponse.secure_url;
        } catch (error) {
            console.error('PayPal QR code generation error:', error);
            throw new Error('Failed to generate QR code');
        }
    }
    
    async checkInvoiceStatus(invoiceId) {
        try {
            const token = await this.getAccessToken();
            const endpoint = `${this.baseURL}/v1/invoicing/invoices/${invoiceId}`;
            
            const response = await this.axiosInstance.get(endpoint, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            return {
                paypalStatus: response.data.status,
                paidAmount: response.data.paid_amount?.value || 0
            };
        } catch (error) {
            console.error('PayPal check invoice status error:', error);
            throw new Error('Failed to check PayPal invoice status');
        }
    }

    async cancelInvoice(invoiceId) {
        try {
            const token = await this.getAccessToken();
            const endpoint = `${this.baseURL}/v2/invoicing/invoices/${invoiceId}/cancel`;

            console.log('Cancelling invoice at:', endpoint);
            console.log('Using Bearer token:', token.substring(0, 20) + '...');

            const response = await this.axiosInstance.post(
                endpoint,
                {
                    // Optionally add a subject or note here
                    // subject: "Order cancelled",
                    // note: "Order was cancelled by the user."
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            console.log('Invoice cancelled response:', JSON.stringify(response.data, null, 2));
            return response.data;
        } catch (error) {
            console.error('PayPal cancel invoice error:', error.response ? error.response.data : error.message);
            throw new Error('Failed to cancel PayPal invoice');
        }
    }
}

module.exports = new PaypalService();
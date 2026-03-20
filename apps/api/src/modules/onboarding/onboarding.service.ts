import { Injectable, Inject, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { KEYSELY_DB } from '../database/database.module';
import { Kysely } from 'kysely';
import { StripeService } from '../../integrations/stripe/stripe.service';
import { AuthService } from '../auth/auth.service';
import bcrypt from 'bcryptjs';

@Injectable()
export class OnboardingService {
  private readonly logger = new Logger(OnboardingService.name);

  constructor(
    @Inject(KEYSELY_DB) private readonly db: Kysely<any>,
    private readonly stripeService: StripeService,
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  async checkCnpj(cnpj: string) {
    // ... existing checkCnpj code
    this.logger.log(`Checking CNPJ: ${cnpj}`);
    
    const transportadora = await this.db
        .selectFrom('transportadoras')
        .select(['nome', 'cnpj', 'responsavel', 'email'])
        .where('cnpj', '=', cnpj)
        .executeTakeFirst();
        
    if (!transportadora) {
        return { 
            ok: true, 
            data: { 
                razaoSocial: 'Nova Transportadora',
                status: 'waitlist' 
            } 
        };
    }

    return { 
        ok: true, 
        data: { 
            razaoSocial: transportadora.nome,
            responsavel: transportadora.responsavel,
            email: transportadora.email,
            status: 'allowed'
        } 
    };
  }

  async submitWaitlist(data: any) {
    // ... existing submitWaitlist code
    this.logger.log(`Submitting Waitlist for CNPJ: ${data.cnpj}`);
    
    try {
        await this.db
            .insertInto('waitlists')
            .values({
                cnpj: data.cnpj,
                responsavel_nome: data.nome,
                responsavel_email: data.email,
                responsavel_telefone: data.telefone || null,
                razao_social: data.razaoSocial || data.nome,
                status: 'new',
                source: 'onboarding',
                submitted_at: new Date(),
            })
            .execute();
            
        return { ok: true };
    } catch (error) {
        this.logger.error('Error submitting waitlist:', error);
        return { ok: false, error: 'Erro ao salvar na lista de espera' };
    }
  }

  async provisionAfterPayment(data: { 
    cnpj: string, 
    nome: string, 
    email: string, 
    razaoSocial: string,
    setupIntentId: string 
  }) {
    this.logger.log(`Provisioning access for ${data.email} (CNPJ: ${data.cnpj})`);
    
    try {
        // 1. Retrieve SetupIntent to get PaymentMethod
        const setupIntent = await this.stripeService.retrieveSetupIntent(data.setupIntentId);
        const paymentMethodId = setupIntent.payment_method as string;
        
        if (!paymentMethodId) {
            throw new Error('Payment method missing in SetupIntent');
        }

        // 2. Create or Get Stripe Customer
        const customer = await this.stripeService.createCustomer(data.email, data.nome);
        const customerId = customer.id;
        
        // 3. Attach Payment Method to Customer
        await this.stripeService.attachPaymentMethod(customerId, paymentMethodId);
        
        // 4. Perform Charges and Transfers
        const connectedAccountId = this.configService.get<string>('STRIPE_CONNECTED_ACCOUNT_ID');
        this.logger.log(`Processing charges and transfers for customer ${customerId}. Connected Account: ${connectedAccountId}`);
        
        // Charge 1: Setup/Channel Fee (R$ 2000)
        const charge1 = await this.stripeService.createPayment(
            customerId, 
            paymentMethodId, 
            2000, 
            `Taxa de ativação - ${data.razaoSocial}`,
            { 
              cnpj: data.cnpj,
              type: 'setup_fee',
              flow: 'onboarding'
            }
        );
        
        if (charge1.ok && charge1.chargeId && connectedAccountId) {
            this.logger.log(`Charge 1 successful (${charge1.chargeId}). Initiating transfer of R$ 500.`);
            await this.stripeService.createTransfer(
                connectedAccountId,
                500,
                charge1.chargeId,
                `Repasse IBTRC - Taxa de ativação - ${data.razaoSocial}`,
                { 
                  source_charge_id: charge1.chargeId,
                  transportadora_cnpj: data.cnpj
                }
            );
        }
        
        // Charge 2: Monthly/PAWEB Fee (R$ 200)
        const charge2 = await this.stripeService.createPayment(
            customerId, 
            paymentMethodId, 
            200, 
            `Mensalidade inicial - ${data.razaoSocial}`,
            { 
              cnpj: data.cnpj,
              type: 'monthly_fee',
              flow: 'onboarding'
            }
        );
        
        if (charge2.ok && charge2.chargeId && connectedAccountId) {
            this.logger.log(`Charge 2 successful (${charge2.chargeId}). Initiating transfer of R$ 50.`);
            await this.stripeService.createTransfer(
                connectedAccountId,
                50,
                charge2.chargeId,
                `Repasse IBTRC - Mensalidade inicial - ${data.razaoSocial}`,
                { 
                  source_charge_id: charge2.chargeId,
                  transportadora_cnpj: data.cnpj
                }
            );
        }
        
        if (!charge1.ok || !charge2.ok) {
            this.logger.error(`Charge failed: ${charge1.error || charge2.error}`);
            // In a production environment, we should handle partial failures or use a more atomic billing flow
        }
        
        // 5. Create or Update Data in DB
        const result = await this.db.transaction().execute(async (trx) => {
            // Check if Transportadora exists
            let transportadora = await trx
                .selectFrom('transportadoras')
                .select(['id'])
                .where('cnpj', '=', data.cnpj)
                .executeTakeFirst();
            
            let transportadoraId: number;

            const transportadoraData: any = {
                nome: data.razaoSocial,
                responsavel: data.nome,
                email: data.email,
                ativo: 1,
                billing_gateway: 'stripe',
                stripe_customer_id: customerId,
                stripe_default_payment_method: paymentMethodId,
                stripe_subscription_status: 'active',
                updated_at: new Date(),
            };

            if (transportadora) {
                transportadoraId = Number(transportadora.id);
                this.logger.log(`Updating existing transportadora ID: ${transportadoraId}`);
                await trx
                    .updateTable('transportadoras')
                    .set(transportadoraData)
                    .where('id', '=', transportadoraId)
                    .execute();
            } else {
                this.logger.log(`Creating new transportadora for CNPJ: ${data.cnpj}`);
                const insertResult = await trx
                    .insertInto('transportadoras')
                    .values({
                        ...transportadoraData,
                        cnpj: data.cnpj,
                        telefone: '', 
                        apiname: data.razaoSocial.toLowerCase().replace(/\s+/g, '-').substring(0, 50),
                        password: await bcrypt.hash(Math.random().toString(36), 10),
                        created_at: new Date(),
                    })
                    .executeTakeFirst();
                transportadoraId = Number(insertResult.insertId);
            }
            
            // Check if User exists
            let user = await trx
                .selectFrom('users')
                .select(['id'])
                .where('username', '=', data.email)
                .executeTakeFirst();
            
            let userId: number;
            const userData: any = {
                transportadora_id: transportadoraId,
                auth_source: 'local',
                preferred_locale: 'pt_BR',
                updated_at: new Date(),
            };

            if (user) {
                userId = Number(user.id);
                this.logger.log(`Updating existing user ID: ${userId}`);
                await trx
                    .updateTable('users')
                    .set(userData)
                    .where('id', '=', userId)
                    .execute();
            } else {
                this.logger.log(`Creating new user for email: ${data.email}`);
                const insertResult = await trx
                    .insertInto('users')
                    .values({
                        ...userData,
                        username: data.email,
                        password: await bcrypt.hash('ifretes123', 10),
                        created_at: new Date(),
                    })
                    .executeTakeFirst();
                userId = Number(insertResult.insertId);
            }
            
            // Check if Branding exists
            let branding = await trx
                .selectFrom('transportadora_brandings')
                .select(['id'])
                .where('transportadora_id', '=', transportadoraId)
                .executeTakeFirst();
            
            const brandingData: any = {
                nome: data.razaoSocial,
                ativo: 1,
                owner_user_id: userId,
                updated_at: new Date(),
            };

            if (branding) {
                this.logger.log(`Updating existing branding for transportadora ID: ${transportadoraId}`);
                await trx
                    .updateTable('transportadora_brandings')
                    .set(brandingData)
                    .where('transportadora_id', '=', transportadoraId)
                    .execute();
            } else {
                this.logger.log(`Creating new branding for transportadora ID: ${transportadoraId}`);
                await trx
                    .insertInto('transportadora_brandings')
                    .values({
                        ...brandingData,
                        transportadora_id: transportadoraId,
                        subdomain: data.razaoSocial.toLowerCase().replace(/\s+/g, '-').substring(0, 50),
                        created_at: new Date(),
                        sidebar_style: 'dark',
                        font_family: 'Manrope',
                        primary_color: '#0f766e',
                        secondary_color: '#0f172a',
                        accent_color: '#14b8a6',
                    })
                    .execute();
            }
                
            return { userId, username: data.email, role: 'admin' };
        });
        
        // 6. Generate Token using AuthService
        const { access_token, user: authUser } = await this.authService.login({
            id: String(result.userId),
            username: result.username,
            role: 'admin',
        });
        
        return {
            ok: true,
            token: access_token,
            user: authUser
        };
    } catch (error) {
        this.logger.error('Provisioning failed', error);
        return { ok: false, error: error.message };
    }
  }
}

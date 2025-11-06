import request from 'supertest';
import app from '@/app';
import prisma from '@/config/database';

describe('Auth Register - Multi-tenant', () => {
  const testEmail = `test-${Date.now()}@example.com`;
  const testCnpj = `${Math.floor(Math.random() * 100000000)}0001${Math.floor(Math.random() * 100)}`;
  let createdUserId: string;
  let createdEstablishmentId: string;

  afterAll(async () => {
    // Cleanup
    if (createdUserId) {
      await prisma.userRole.deleteMany({ where: { userId: createdUserId } });
      await prisma.user.delete({ where: { id: createdUserId } }).catch(() => {});
    }
    if (createdEstablishmentId) {
      await prisma.role.deleteMany({ where: { establishmentId: createdEstablishmentId } });
      await prisma.establishment.delete({ where: { id: createdEstablishmentId } }).catch(() => {});
    }
    await prisma.$disconnect();
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register new establishment and admin user', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'João Silva',
          email: testEmail,
          password: 'Senha@123',
          phone: '(11) 98765-4321',
          establishment: {
            name: 'Restaurante Teste',
            cnpj: testCnpj,
            address: {
              street: 'Rua Teste',
              number: '123',
              complement: 'Sala 1',
              neighborhood: 'Centro',
              city: 'São Paulo',
              state: 'SP',
              zipCode: '01234-567',
            },
            phone: '(11) 3456-7890',
            email: 'contato@teste.com',
            taxSettings: {
              taxRegime: 'simples',
              icmsRate: 7,
              issRate: 5,
              pisRate: 0.65,
              cofinsRate: 3,
            },
          },
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user.email).toBe(testEmail);
      expect(response.body.data.user.roles).toContain('admin');
      expect(response.body.data.user).toHaveProperty('establishmentId');

      createdUserId = response.body.data.user.id;
      createdEstablishmentId = response.body.data.user.establishmentId;

      // Verify establishment was created
      const establishment = await prisma.establishment.findUnique({
        where: { id: createdEstablishmentId },
      });
      expect(establishment).toBeTruthy();
      expect(establishment?.name).toBe('Restaurante Teste');
      expect(establishment?.cnpj).toBe(testCnpj);

      // Verify user was created
      const user = await prisma.user.findUnique({
        where: { id: createdUserId },
        include: { roles: { include: { role: true } } },
      });
      expect(user).toBeTruthy();
      expect(user?.establishmentId).toBe(createdEstablishmentId);
      expect(user?.roles.length).toBeGreaterThan(0);
      expect(user?.roles[0].role.name).toBe('admin');
    });

    it('should not register with weak password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'João Silva',
          email: 'test2@example.com',
          password: 'senha123', // Weak password
          establishment: {
            name: 'Restaurante Teste',
            cnpj: '12345678000190',
            address: {
              street: 'Rua Teste',
              number: '123',
              neighborhood: 'Centro',
              city: 'São Paulo',
              state: 'SP',
              zipCode: '01234-567',
            },
            phone: '(11) 3456-7890',
            email: 'contato@teste.com',
            taxSettings: {
              taxRegime: 'simples',
              icmsRate: 7,
              issRate: 5,
              pisRate: 0.65,
              cofinsRate: 3,
            },
          },
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toHaveProperty('password');
    });

    it('should not register with invalid CNPJ', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'João Silva',
          email: 'test3@example.com',
          password: 'Senha@123',
          establishment: {
            name: 'Restaurante Teste',
            cnpj: '123', // Invalid CNPJ
            address: {
              street: 'Rua Teste',
              number: '123',
              neighborhood: 'Centro',
              city: 'São Paulo',
              state: 'SP',
              zipCode: '01234-567',
            },
            phone: '(11) 3456-7890',
            email: 'contato@teste.com',
            taxSettings: {
              taxRegime: 'simples',
              icmsRate: 7,
              issRate: 5,
              pisRate: 0.65,
              cofinsRate: 3,
            },
          },
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should not register with duplicate email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'João Silva',
          email: testEmail, // Duplicate email
          password: 'Senha@123',
          establishment: {
            name: 'Restaurante Teste 2',
            cnpj: '98765432000190',
            address: {
              street: 'Rua Teste',
              number: '123',
              neighborhood: 'Centro',
              city: 'São Paulo',
              state: 'SP',
              zipCode: '01234-567',
            },
            phone: '(11) 3456-7890',
            email: 'contato2@teste.com',
            taxSettings: {
              taxRegime: 'simples',
              icmsRate: 7,
              issRate: 5,
              pisRate: 0.65,
              cofinsRate: 3,
            },
          },
        });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Email já cadastrado');
    });

    it('should not register with duplicate CNPJ', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'João Silva',
          email: 'test4@example.com',
          password: 'Senha@123',
          establishment: {
            name: 'Restaurante Teste 2',
            cnpj: testCnpj, // Duplicate CNPJ
            address: {
              street: 'Rua Teste',
              number: '123',
              neighborhood: 'Centro',
              city: 'São Paulo',
              state: 'SP',
              zipCode: '01234-567',
            },
            phone: '(11) 3456-7890',
            email: 'contato2@teste.com',
            taxSettings: {
              taxRegime: 'simples',
              icmsRate: 7,
              issRate: 5,
              pisRate: 0.65,
              cofinsRate: 3,
            },
          },
        });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('CNPJ já cadastrado');
    });

    it('should login with registered user', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testEmail,
          password: 'Senha@123',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user.email).toBe(testEmail);
      expect(response.body.data.user.establishmentId).toBe(createdEstablishmentId);
    });
  });

  describe('GET /api/v1/establishment', () => {
    let authToken: string;

    beforeAll(async () => {
      // Login to get token
      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testEmail,
          password: 'Senha@123',
        });

      authToken = loginResponse.body.data.token;
    });

    it('should get establishment of logged user', async () => {
      const response = await request(app)
        .get('/api/v1/establishment')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(createdEstablishmentId);
      expect(response.body.data.name).toBe('Restaurante Teste');
    });
  });

  describe('PUT /api/v1/establishment', () => {
    let authToken: string;

    beforeAll(async () => {
      // Login to get token
      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testEmail,
          password: 'Senha@123',
        });

      authToken = loginResponse.body.data.token;
    });

    it('should update establishment of logged user', async () => {
      const response = await request(app)
        .put('/api/v1/establishment')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Restaurante Atualizado',
          phone: '(11) 91234-5678',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Restaurante Atualizado');
      expect(response.body.data.phone).toBe('(11) 91234-5678');
    });
  });
});

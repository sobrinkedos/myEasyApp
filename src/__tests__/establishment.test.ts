import request from 'supertest';
import app from '@/app';
import prisma from '@/config/database';

describe('Establishment CRUD', () => {
  let authToken: string;
  let establishmentId: string;

  beforeAll(async () => {
    // Login to get auth token
    const loginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'admin@restaurant.com',
        password: 'Admin@123',
      });

    authToken = loginResponse.body.data.token;
  });

  afterAll(async () => {
    // Cleanup
    if (establishmentId) {
      await prisma.establishment.delete({
        where: { id: establishmentId },
      }).catch(() => {});
    }
    await prisma.$disconnect();
  });

  describe('POST /api/v1/establishment', () => {
    it('should create a new establishment', async () => {
      const response = await request(app)
        .post('/api/v1/establishment')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Restaurante Teste',
          cnpj: '12345678000190',
          address: {
            street: 'Rua Teste',
            number: '123',
            complement: 'Sala 1',
            neighborhood: 'Centro',
            city: 'São Paulo',
            state: 'SP',
            zipCode: '01234-567',
          },
          phone: '(11) 98765-4321',
          email: 'contato@teste.com',
          taxSettings: {
            taxRegime: 'simples',
            icmsRate: 7,
            issRate: 5,
            pisRate: 0.65,
            cofinsRate: 3,
          },
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.name).toBe('Restaurante Teste');
      
      establishmentId = response.body.data.id;
    });

    it('should not create establishment with invalid CNPJ', async () => {
      const response = await request(app)
        .post('/api/v1/establishment')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Restaurante Teste',
          cnpj: '123',
          address: {
            street: 'Rua Teste',
            number: '123',
            neighborhood: 'Centro',
            city: 'São Paulo',
            state: 'SP',
            zipCode: '01234-567',
          },
          phone: '(11) 98765-4321',
          email: 'contato@teste.com',
          taxSettings: {
            taxRegime: 'simples',
            icmsRate: 7,
            issRate: 5,
            pisRate: 0.65,
            cofinsRate: 3,
          },
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/establishment', () => {
    it('should list all establishments', async () => {
      const response = await request(app)
        .get('/api/v1/establishment')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/v1/establishment/:id', () => {
    it('should get establishment by id', async () => {
      const response = await request(app)
        .get(`/api/v1/establishment/${establishmentId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(establishmentId);
    });

    it('should return 404 for non-existent establishment', async () => {
      const response = await request(app)
        .get('/api/v1/establishment/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/v1/establishment/:id', () => {
    it('should update establishment', async () => {
      const response = await request(app)
        .put(`/api/v1/establishment/${establishmentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Restaurante Teste Atualizado',
          phone: '(11) 91234-5678',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Restaurante Teste Atualizado');
      expect(response.body.data.phone).toBe('(11) 91234-5678');
    });
  });

  describe('POST /api/v1/establishment/:id/logo', () => {
    it('should upload establishment logo', async () => {
      const response = await request(app)
        .post(`/api/v1/establishment/${establishmentId}/logo`)
        .set('Authorization', `Bearer ${authToken}`)
        .attach('logo', Buffer.from('fake-image'), 'logo.png');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('logoUrl');
    });
  });

  describe('DELETE /api/v1/establishment/:id', () => {
    it('should delete establishment', async () => {
      const response = await request(app)
        .delete(`/api/v1/establishment/${establishmentId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      
      // Clear the ID so afterAll doesn't try to delete again
      establishmentId = '';
    });
  });
});

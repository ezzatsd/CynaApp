import request from 'supertest';
import app from '../../app'; // Importer l'application Express

describe('Health Check Endpoint', () => {
    it('should return 200 OK and API status', async () => {
        const response = await request(app).get('/api/health');
        
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ status: 'API is running' });
    });

    it('should return 404 for unknown routes under /api', async () => {
         const response = await request(app).get('/api/non-existent-route');
         expect(response.status).toBe(404); // Ou le statut géré par votre handler 404 si vous en ajoutez un
    });

    it('should return HTML for the root route /', async () => {
        const response = await request(app).get('/');
        expect(response.status).toBe(200);
        expect(response.header['content-type']).toMatch(/html/);
        expect(response.text).toContain('Cyna Backend API is running!');
    });
}); 
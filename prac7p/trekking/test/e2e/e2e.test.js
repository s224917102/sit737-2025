require('dotenv').config();
const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const { app } = require('../../app'); // Import app & server

chai.use(chaiHttp);
const expect = chai.expect;

describe('🌍 End-to-End Testing', function () {
    this.timeout(10000);

    before(async function () {
        await mongoose.connect(process.env.MONGO_URL || 'mongodb+srv://pranjalpiya10:pranjalpiya1234%40@cluster0.e3i9m.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
    });

    after(async function () {
        await mongoose.connection.close();
        server.close();  // **Ensure the server closes after tests**
    });

    let token, trekId, agencyId, bookingId;

    // 1️⃣ **User Authentication Tests**
    it('✅ Should register a new user', async function () {
        const res = await chai.request(app)
            .post('/api/user/register')
            .send({
                fullName: 'John Doe',
                email: 'johndoe@example.com',
                password: 'SecurePass123',
                phone: '1234567890',
                gender: 'male'
            });

        expect(res).to.have.status(201);
        expect(res.body).to.have.property('_id');
    });

    it('✅ Should login successfully', async function () {
        const res = await chai.request(app)
            .post('/api/user/login')
            .send({ email: 'johndoe@example.com', password: 'SecurePass123' });

        expect(res).to.have.status(200);
        expect(res.body).to.have.property('token');
        token = res.body.token; // Store token for authenticated requests
    });

    it('🚨 Should fail to login with incorrect password', async function () {
        const res = await chai.request(app)
            .post('/api/user/login')
            .send({ email: 'johndoe@example.com', password: 'WrongPass' });

        expect(res).to.have.status(401);
    });

    // 2️⃣ **Trek Management Tests**
    it('✅ Should create a new trek', async function () {
        const res = await chai.request(app)
            .post('/api/treks')
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'Everest Base Camp',
                images: ['https://example.com/image1.jpg'],
                description: 'A beautiful trek to Everest Base Camp.',
                totalDays: 14,
                expenses: 1500,
                maxAltitude: 5380,
                difficultyLevel: 'Hard',
                bestSeason: 'Spring',
                trekMap: 'https://example.com/map.jpg',
                totalDistance: '130km',
                location: 'Nepal'
            });

        expect(res).to.have.status(201);
        expect(res.body).to.have.property('_id');
        trekId = res.body._id;
    });

    // 3️⃣ **Agency Management Tests**
    it('✅ Should register a new agency', async function () {
        const res = await chai.request(app)
            .post('/api/agencies')
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'Trekking Nepal',
                email: 'info@trekkingnepal.com',
                phone: '9876543210',
                address: 'Kathmandu, Nepal',
                description: 'A trusted trek agency',
                image: 'https://example.com/agency.jpg',
                services: ['Trekking', 'Guides']
            });

        expect(res).to.have.status(201);
        expect(res.body).to.have.property('_id');
        agencyId = res.body._id;
    });

    // 4️⃣ **Booking Flow Tests**
    it('✅ Should create a booking', async function () {
        const res = await chai.request(app)
            .post('/api/bookings')
            .set('Authorization', `Bearer ${token}`)
            .send({
                userId: '123456789012',
                fullName: 'John Doe',
                email: 'johndoe@example.com',
                phone: '1234567890',
                agencyId: agencyId,
                trekId: trekId,
                startDate: '2025-03-01',
                endDate: '2025-03-14',
                numberOfPeople: 2,
                totalPrice: 3000,
                status: 'pending'
            });

        expect(res).to.have.status(201);
        expect(res.body).to.have.property('_id');
        bookingId = res.body._id;
    });

    it('✅ Should retrieve booking details', async function () {
        const res = await chai.request(app)
            .get(`/api/bookings/${bookingId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res).to.have.status(200);
        expect(res.body._id).to.equal(bookingId);
    });

    it('✅ Should cancel a booking', async function () {
        const res = await chai.request(app)
            .put(`/api/bookings/${bookingId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ status: 'cancelled' });

        expect(res).to.have.status(200);
        expect(res.body.status).to.equal('cancelled');
    });

});
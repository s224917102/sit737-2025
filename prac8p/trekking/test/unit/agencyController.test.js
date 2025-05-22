require('dotenv').config();
const mongoose = require('mongoose');
const chai = require('chai');
const expect = chai.expect;
const Agency = require('../../model/agencyModel');

describe('🏢 Agency Model Unit Tests', function () {
    this.timeout(10000);

    before(async function () {
        await mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/testdb', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
    });

    after(async function () {
        await mongoose.connection.close();
    });

    beforeEach(async function () {
        await Agency.deleteMany({});
    });

    it('✅ Should create a valid agency', async function () {
        const agency = new Agency({
            name: 'Test Agency',
            email: 'test@agency.com',
            phone: '1234567890',
            address: '123 Test Street',
            description: 'A reliable test agency',
            image: 'https://example.com/image.jpg',
            services: ['Travel', 'Tourism']
        });

        const savedAgency = await agency.save();
        expect(savedAgency).to.have.property('_id');
        expect(savedAgency.email).to.equal('test@agency.com');
        expect(savedAgency.isVerified).to.be.false; // Default value check
    });

    it('❌ Should fail if required fields are missing', async function () {
        try {
            const agency = new Agency({}); // Empty data
            await agency.save();
        } catch (error) {
            expect(error).to.exist;
            expect(error.errors).to.have.property('name');
            expect(error.errors).to.have.property('email');
            expect(error.errors).to.have.property('phone');
        }
    });

    it('❌ Should enforce unique email constraint', async function () {
        await new Agency({
            name: 'Agency One',
            email: 'unique@agency.com',
            phone: '1112223333',
            address: 'First Street',
            description: 'A unique agency',
            image: 'https://example.com/image1.jpg',
            services: ['Marketing']
        }).save();

        try {
            await new Agency({
                name: 'Duplicate Agency',
                email: 'unique@agency.com',
                phone: '9998887777',
                address: 'Duplicate Street',
                description: 'Another agency with same email',
                image: 'https://example.com/image2.jpg',
                services: ['Consulting']
            }).save();
        } catch (error) {
            expect(error).to.exist;
            expect(error.code).to.equal(11000); // MongoDB unique constraint error
        }
    });

    it('✅ Should allow multiple services as an array', async function () {
        const agency = new Agency({
            name: 'Multi-Service Agency',
            email: 'multiservice@agency.com',
            phone: '5556667777',
            address: 'Service Street',
            description: 'An agency with multiple services',
            image: 'https://example.com/multi.jpg',
            services: ['Finance', 'Insurance', 'Legal']
        });

        const savedAgency = await agency.save();
        expect(savedAgency.services).to.be.an('array').that.includes('Finance');
    });
});
const mongoose = require('mongoose');
const chai = require('chai');
const { connectDB, disconnectDB } = require('../../dbConnect');
const User = require('../../model/user');

const expect = chai.expect;

describe('User Model', function () {
    before(async function () {
        this.timeout(30000); // Extend timeout for DB connection
        await connectDB();
    });

    beforeEach(async function () {
        // ✅ Clear users before each test to avoid duplicates
        await User.deleteMany({});
    });

    after(async function () {
        await disconnectDB();
    });

    it('should create a user successfully', async function () {
        const user = new User({
            fullName: 'John Doe',
            phone: '1234567890',
            email: 'johndoe@example.com',
            password: 'password123',
            gender: 'male'
        });

        const savedUser = await user.save();
        expect(savedUser).to.have.property('_id');
        expect(savedUser.email).to.equal('johndoe@example.com');
        expect(savedUser.role).to.equal('user'); // Default role
    });

    it('should fail to create a user without required fields', async function () {
        try {
            const user = new User({});
            await user.save();
        } catch (error) {
            expect(error).to.exist;
            expect(error.errors).to.have.property('email');
            expect(error.errors).to.have.property('password');
        }
    });
    it('should reject invalid email formats', async function () {
        const invalidEmails = ['invalidemail', 'user@com', 'test@.com', 'user@domain,com'];

        for (let email of invalidEmails) {
            try {
                await new User({
                    fullName: 'Invalid Email User',
                    phone: '1234567890',
                    email: email,
                    password: 'password123',
                    gender: 'male'
                }).save();
            } catch (error) {
                expect(error).to.exist;
                expect(error.errors).to.have.property('email');
            }
        }
    });

    it('should allow creating an admin user', async function () {
        const adminUser = new User({
            fullName: 'Admin User',
            phone: '9876543210',
            email: 'admin@example.com',
            password: 'securepassword',
            gender: 'male',
            role: 'admin' // Explicitly setting role to admin
        });

        const savedUser = await adminUser.save();
        expect(savedUser).to.have.property('_id');
        expect(savedUser.role).to.equal('admin'); // Ensures the role is correctly assigned
    });

    it('should reject passwords shorter than 6 characters', async function () {
        try {
            await new User({
                fullName: 'Short Password User',
                phone: '1234567890',
                email: 'shortpass@example.com',
                password: '123', // Too short
                gender: 'male'
            }).save();
        } catch (error) {
            expect(error).to.exist;
            expect(error.errors).to.have.property('password');
        }
    });


    it('should enforce unique email constraint', async function () {
        await new User({
            fullName: 'Jane Doe',
            phone: '1234567890',
            email: 'johndoe@example.com',
            password: 'password456',
            gender: 'female'
        }).save();

        try {
            await new User({
                fullName: 'Duplicate User',
                phone: '9999999999',
                email: 'johndoe@example.com', // Same email
                password: 'password789',
                gender: 'female'
            }).save();
        } catch (error) {
            expect(error).to.exist;
            expect(error.code).to.equal(11000); // MongoDB duplicate key error code
        }
    });
});
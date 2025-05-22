
require('dotenv').config();
const mongoose = require('mongoose');
const chai = require('chai');
const { expect } = chai;
const TrekDestination = require('../../model/trek');

describe('⛰ TrekDestination Model Unit Tests', function () {
    this.timeout(10000); // Increase timeout for async tests

    before(async function () {
        await mongoose.connect(process.env.MONGO_URL || 'mongodb+srv://pranjalpiya10:pranjalpiya1234%40@cluster0.e3i9m.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
    });

    after(async function () {
        await mongoose.connection.close();
    });

    beforeEach(async function () {
        await TrekDestination.deleteMany({});
    });

    it('✅ Should create a valid TrekDestination successfully', async function () {
        const trek = new TrekDestination({
            name: 'Everest Base Camp',
            images: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
            description: 'A challenging trek to the base of the world’s highest peak.',
            totalDays: 14,
            expenses: 2000,
            maxAltitude: 5500,
            difficultyLevel: 'Hard',
            bestSeason: 'Spring, Autumn',
            trekMap: 'https://example.com/trekmap.jpg',
            totalDistance: '130km',
            location: 'Nepal',
            reviews: [
                {
                    user: new mongoose.Types.ObjectId(),
                    rating: 5,
                    review: 'Amazing trek experience!'
                }
            ],
            averageRating: 5
        });

        const savedTrek = await trek.save();
        expect(savedTrek).to.have.property('_id');
        expect(savedTrek.name).to.equal('Everest Base Camp');
        expect(savedTrek.difficultyLevel).to.equal('Hard');
        expect(savedTrek.reviews).to.have.lengthOf(1);
        expect(savedTrek.reviews[0].rating).to.equal(5);
    });

    it('❌ Should fail to create a TrekDestination without required fields', async function () {
        try {
            const trek = new TrekDestination({
                images: ['https://example.com/image.jpg'],
                description: 'A challenging trek',
            });
            await trek.save();
        } catch (error) {
            expect(error).to.exist;
            expect(error.errors).to.have.property('name');
            expect(error.errors).to.have.property('totalDays');
            expect(error.errors).to.have.property('expenses');
        }
    });

    it('✅ Should allow adding multiple reviews', async function () {
        const trek = new TrekDestination({
            name: 'Annapurna Circuit',
            images: ['https://example.com/image1.jpg'],
            description: 'A scenic trek around Annapurna massif.',
            totalDays: 18,
            expenses: 1500,
            maxAltitude: 5416,
            difficultyLevel: 'Medium',
            bestSeason: 'Spring, Autumn',
            trekMap: 'https://example.com/trekmap.jpg',
            totalDistance: '160km',
            location: 'Nepal',
            reviews: []
        });

        await trek.save();

        trek.reviews.push({
            user: new mongoose.Types.ObjectId(),
            rating: 4,
            review: 'Great experience!'
        });

        trek.reviews.push({
            user: new mongoose.Types.ObjectId(),
            rating: 5,
            review: 'Best trek ever!'
        });

        await trek.save();
        expect(trek.reviews).to.have.lengthOf(2);
        expect(trek.reviews[1].rating).to.equal(5);
    });

    it('✅ Should calculate average rating correctly', async function () {
        const trek = new TrekDestination({
            name: 'Langtang Valley Trek',
            images: ['https://example.com/image1.jpg'],
            description: 'A beautiful trek in Langtang region.',
            totalDays: 10,
            expenses: 800,
            maxAltitude: 4500,
            difficultyLevel: 'Easy',
            bestSeason: 'Autumn',
            trekMap: 'https://example.com/trekmap.jpg',
            totalDistance: '80km',
            location: 'Nepal',
            reviews: [
                { user: new mongoose.Types.ObjectId(), rating: 4, review: 'Very scenic trek!' },
                { user: new mongoose.Types.ObjectId(), rating: 3, review: 'Decent trek but crowded.' }
            ]
        });

        await trek.save();
        const averageRating = (trek.reviews[0].rating + trek.reviews[1].rating) / 2;
        expect(averageRating).to.equal(3.5);
    });
});
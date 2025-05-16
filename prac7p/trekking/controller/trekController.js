// controller/trekController.js

const TrekDestination = require('../model/trek');

// Create Trek Destination
const createTrekDestination = async (req, res) => {
    const { name,
        images,
        description,
        totalDays,
        expenses,
        difficultyLevel,
        maxAltitude,
        bestSeason,
        trekMap,
        location,
        totalDistance
    } = req.body;
    try {
        if (
            !name ||
            !images ||
            !description ||
            !totalDays ||
            !expenses ||
            !difficultyLevel ||
            !maxAltitude ||
            !bestSeason ||
            !trekMap ||
            !location ||
            !totalDistance
        ) {
            console.error('Missing trek fields');
            return res.status(400).json({ statusCode: 400, message: 'Missing required fields' });

        }
        const newTrek = new TrekDestination({

            name,
            images,
            description,
            totalDays,
            expenses,
            difficultyLevel,
            maxAltitude,
            bestSeason,
            trekMap,
            location,
            totalDistance
        });

        await newTrek.save();
        res.status(201).json({ message: 'Trek destination created successfully', trek: newTrek });
    } catch (error) {
        res.status(500).json({ message: 'Error creating trek destination', error: error.message });
    }
};
// Get All Trek Destinations
const getAllTrekDestinations = async (req, res) => {
    try {
        const treks = await TrekDestination.find();
        res.status(200).json(treks);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching trek destinations', error: error.message });
    }
};

// Get Single Trek Destination by ID
const getTrekDestinationById = async (req, res) => {
    try {
        const trek = await TrekDestination.findById(req.params.id).populate({
            path: 'reviews.user', // Populate the user field in reviews
            select: 'fullName' // You can choose which user fields to include
        });

        if (!trek) {
            return res.status(404).json({ message: 'Trek destination not found' });
        }
        res.status(200).json(trek);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching trek destination', error: error.message });
    }
};




// Update Trek Destination
const updateTrekDestination = async (req, res) => {
    const trekId = req.params.id;
    const {
        name,
        images,
        description,
        totalDays,
        expenses,
        difficultyLevel,
        maxAltitude,
        bestSeason,
        trekMap,
        totalDistance,
    } = req.body;
    try {
        if (
            !name ||
            !images ||
            !description ||
            !totalDays ||
            !expenses ||
            !difficultyLevel ||
            !maxAltitude ||
            !bestSeason ||
            !trekMap ||
            !totalDistance
        ) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        const updatedTrek = await TrekDestination.findByIdAndUpdate(
            trekId,
            {
                name,
                images,
                description,
                totalDays,
                expenses,
                difficultyLevel,
                maxAltitude,
                bestSeason,
                trekMap,
                totalDistance,
            },
            { new: true }
        );
        if (!updatedTrek) {
            return res.status(404).json({ message: 'Trek destination not found' });
        }
        res.status(200).json({
            message: 'Trek destination updated successfully',
            trek: updatedTrek,
        });
    } catch (error) {
        res
            .status(500)
            .json({ message: 'Error updating trek destination', error: error.message });
    }
};

// Delete Trek Destination
const deleteTrekDestination = async (req, res) => {
    const trekId = req.params.id;
    try {
        const deletedTrek = await TrekDestination.findByIdAndDelete(trekId);
        if (!deletedTrek) {
            return res.status(404).json({ message: 'Trek destination not found' });
        }
        res.status(200).json({
            message: 'Trek destination deleted successfully',
            trek: deletedTrek,
        });
    } catch (error) {
        res
            .status(500)
            .json({ message: 'Error deleting trek destination', error: error.message });
    }
};










// Search Trek Destinations with filtering and sorting
const searchTrekDestinations = async (req, res) => {
    try {
        const { name, expenses, difficultyLevel, maxAltitude, totalDistance, bestSeason, sortBy, order } = req.query;

        // Create a filter object based on the query parameters
        let filter = {};

        // Filter by name (case-insensitive partial match)
        if (name) {
            filter.name = { $regex: name, $options: 'i' };
        }

        // Filter by max expenses
        if (expenses) {
            filter.expenses = { $lte: expenses }; // Less than or equal to the value
        }

        // Filter by difficulty level (Exact match: Easy, Medium, Hard)
        if (difficultyLevel) {
            filter.difficultyLevel = difficultyLevel;
        }

        // Filter by max altitude
        if (maxAltitude) {
            filter.maxAltitude = { $lte: maxAltitude }; // Less than or equal to the value
        }

        // Filter by total distance (less than or equal to given value)
        if (totalDistance) {
            filter.totalDistance = { $lte: totalDistance }; // Use string comparison or convert to number as needed
        }

        // Filter by best season
        if (bestSeason) {
            filter.bestSeason = bestSeason; // Exact match for season
        }

        // Sorting logic
        let sort = {};
        if (sortBy) {
            const sortField = sortBy;
            const sortOrder = order === 'desc' ? -1 : 1; // Ascending or descending order
            sort[sortField] = sortOrder;
        }

        // Fetch filtered and sorted trek data from the database
        const treks = await TrekDestination.find(filter).sort(sort);

        // Return the filtered treks
        res.status(200).json(treks);
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ message: 'Error searching trek destinations', error: error.message });
    }
};


// Add review to a specific trek destination
const addReview = async (req, res) => {
    try {
        const trekId = req.params.id;
        const { rating, review } = req.body;

        // Find the trek destination by ID
        const trekDestination = await TrekDestination.findById(trekId);

        if (!trekDestination) {
            return res.status(404).json({ message: 'Trek destination not found' });
        }

        // Check if user has already submitted a review (Optional)
        const alreadyReviewed = trekDestination.reviews.find(r => r.user.toString() === req.user._id.toString());
        if (alreadyReviewed) {
            return res.status(400).json({ message: 'You have already reviewed this trek' });
        }

        // Create a new review
        const newReview = {
            user: req.user._id, // The user ID from the token
            rating: Number(rating),
            review,
        };

        // Add the review to the trek's reviews array
        trekDestination.reviews.push(newReview);

        // Recalculate the average rating
        trekDestination.averageRating = trekDestination.reviews.reduce((acc, item) => item.rating + acc, 0) / trekDestination.reviews.length;

        // Save the trek destination with the new review
        await trekDestination.save();

        res.status(201).json({ message: 'Review added successfully', trekDestination });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};



const getUserReviewForTrek = async (req, res) => {
    try {
        const trekDestination = await TrekDestination.findById(req.params.id);

        if (!trekDestination) {
            return res.status(404).json({ message: 'Trek destination not found' });
        }

        // Find the review by the current user
        const userReview = trekDestination.reviews.find(
            (review) => review.user.toString() === req.user._id.toString()
        );

        if (!userReview) {
            return res.status(404).json({ message: 'No review found for this user on this trek destination' });
        }

        res.status(200).json(userReview);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};


// trekController.js

const updateUserReview = async (req, res) => {
    try {
        const trekDestination = await TrekDestination.findById(req.params.id);

        if (!trekDestination) {
            return res.status(404).json({ message: 'Trek destination not found' });
        }

        // Find the review by the current user
        const userReview = trekDestination.reviews.find(
            (review) => review.user.toString() === req.user._id.toString()
        );

        if (!userReview) {
            return res.status(404).json({ message: 'No review found for this user on this trek destination' });
        }

        // Update the review and rating fields if they exist in the request body
        if (req.body.rating) {
            userReview.rating = req.body.rating;
        }
        if (req.body.review) {
            userReview.review = req.body.review;
        }

        // Recalculate the average rating after the update
        trekDestination.averageRating = trekDestination.reviews.reduce(
            (acc, item) => item.rating + acc,
            0
        ) / trekDestination.reviews.length;

        // Save the updated trek destination
        await trekDestination.save();

        res.status(200).json({ message: 'Review updated successfully', trekDestination });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// trekController.js

const deleteUserReview = async (req, res) => {
    try {
        const trekDestination = await TrekDestination.findById(req.params.id);

        if (!trekDestination) {
            return res.status(404).json({ message: 'Trek destination not found' });
        }

        // Find the index of the review by the current user
        const reviewIndex = trekDestination.reviews.findIndex(
            (review) => review.user.toString() === req.user._id.toString()
        );

        if (reviewIndex === -1) {
            return res.status(404).json({ message: 'No review found for this user on this trek destination' });
        }

        // Remove the review from the reviews array
        trekDestination.reviews.splice(reviewIndex, 1);

        // Recalculate the average rating after deletion
        trekDestination.averageRating = trekDestination.reviews.length
            ? trekDestination.reviews.reduce((acc, item) => item.rating + acc, 0) / trekDestination.reviews.length
            : 0;

        // Save the updated trek destination
        await trekDestination.save();

        res.status(200).json({ message: 'Review deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};





module.exports = {
    updateTrekDestination,
    deleteTrekDestination, getUserReviewForTrek, updateUserReview, deleteUserReview, createTrekDestination, getAllTrekDestinations, getTrekDestinationById, searchTrekDestinations, addReview
};

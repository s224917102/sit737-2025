const Guide = require('../model/guide');

// Create a new guide
exports.createGuide = async (req, res) => {
    try {
        const { title, description, content, category, featuredImage, images, tags, author } = req.body;

        // Validate input presence
        if (!title || !description || !content || !category || !featuredImage || !images || !tags || !author) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Additional validation: Ensure 'images' and 'tags' are arrays
        if (!Array.isArray(images) || !Array.isArray(tags)) {
            return res.status(400).json({ message: "'images' and 'tags' must be arrays" });
        }

        const guide = new Guide({ title, description, content, category, featuredImage, images, tags, author });
        const savedGuide = await guide.save();
        res.status(201).json({ message: 'Guides created successfully', trek: savedGuide });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error while creating guide' });
    }
};


// Get all guides
exports.getAllGuides = async (req, res) => {
    try {
        const guides = await Guide.find().sort({ createdAt: -1 });
        res.status(200).json(guides);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error while fetching guides' });
    }
};

// Get a single guide by ID
exports.getGuideById = async (req, res) => {
    try {
        const guide = await Guide.findById(req.params.id);
        if (!guide) {
            return res.status(404).json({ message: 'Guide not found' });
        }
        res.status(200).json(guide);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error while fetching the guide' });
    }
};

// Update a guide
exports.updateGuide = async (req, res) => {
    try {
        const updatedGuide = await Guide.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedGuide) {
            return res.status(404).json({ message: 'Guide not found' });
        }
        res.status(200).json(updatedGuide);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error while updating the guide' });
    }
};

// Delete a guide
exports.deleteGuide = async (req, res) => {
    try {
        const deletedGuide = await Guide.findByIdAndDelete(req.params.id);
        if (!deletedGuide) {
            return res.status(404).json({ message: 'Guide not found' });
        }
        res.status(200).json({ message: 'Guide deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error while deleting the guide' });
    }
};

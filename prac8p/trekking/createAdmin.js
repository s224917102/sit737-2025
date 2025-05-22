const connectDB = require('./dbConnect'); // Import the connection function
const User = require('./model/user'); // Assuming your User model is in './model/user'
const bcrypt = require('bcryptjs');

// Create admin user function
async function createAdmin() {
    await connectDB();

    const adminData = {
        fullName: 'Admin',
        email: 'admin@admin.com',
        password: 'Admin1234@',
        phone: '9845023754',
        gender: 'Male',
        role: 'admin',
    };
    

    try {
        const adminExists = await User.findOne({ email: adminData.email });

        if (adminExists) {
            console.log('Admin already exists');
        } else {
            // Hash password here if you want to do it manually
            const hashedPassword = await bcrypt.hash(adminData.password, 10);
            adminData.password = hashedPassword;

            const adminUser = new User(adminData);
            await adminUser.save();
            console.log('Admin user created successfully');
        }
    } catch (error) {
        console.error('Error creating admin user:', error);
    }
}

createAdmin();

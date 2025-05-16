// const mongoose = require('mongoose');
// const chai = require('chai');
// const { connectDB, disconnectDB } = require('../../dbConnect');  // ✅ Correct import

// const expect = chai.expect;

// describe('Database Connection', function () {
//     before(async function () {
//         this.timeout(30000); // Extend timeout for DB connection
//         await connectDB();
//     });

//     it('should connect to the database without error', function () {
//         expect(mongoose.connection.readyState).to.equal(1);
//     });

//     after(async function () {
//         await disconnectDB();
//     });
// });
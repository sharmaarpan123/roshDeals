import mongoose from 'mongoose';
const mongoInit = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log(' connecting to mongodb');
    }
    catch (error) {
        console.log('error while connecting to mongodb');
    }
};
export default mongoInit;
//# sourceMappingURL=index.js.map
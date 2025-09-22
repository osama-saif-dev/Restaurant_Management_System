import mongoose from 'mongoose';

const connectDb = async () => {
    try{
        await mongoose.connect(process.env.MONGO_URL);
        console.log('Connection with db successfully');
    } catch(err) {
        console.log(`Connection with db faild ${err.message}`);
    }
}

export default connectDb;
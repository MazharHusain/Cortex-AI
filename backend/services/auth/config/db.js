import mongoose from "mongoose"

const connectDb=async ()=>{
    try {
       mongoose.set('bufferTimeoutMS', 3000);
       await mongoose.connect(process.env.MONGODB_URI, {
           serverSelectionTimeoutMS: 4000
       }) 
       console.log("db connected")
    } catch (error) {
       console.log(`db error ${error}`) 
    }
}

export default connectDb
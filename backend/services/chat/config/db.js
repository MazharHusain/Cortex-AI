import mongoose from "mongoose"

const connectDb=async ()=>{
    try {
       mongoose.set('bufferTimeoutMS', 2500);
       await mongoose.connect(process.env.MONGODB_URI, {
           serverSelectionTimeoutMS: 3000
       }) 
       console.log("chat db connected")
    } catch (error) {
       console.log(`chat db error ${error}`) 
    }
}

export default connectDb
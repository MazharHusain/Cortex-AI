import axios from "axios"

export const deductCredits=async (userId,agent)=>{
    try {
       if (!userId || String(userId).startsWith("guest-")) {
           return null
       }
       const {data}=await axios.post(`${process.env.AUTH_SERVICE}/deduct-credits`,{userId,agent})
       return data
    } catch (error) {
        console.log(error)
        return null
    }
}
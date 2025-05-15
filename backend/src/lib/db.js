import mongoose from "mongoose"

export const connectDB = async () =>{

    // console.log(process.env.MONGODB_URI)

    try{
        const conn = await mongoose.connect(process.env.MONGODB_URI)

        console.log( " MONGODB Connected",conn.connection.host)
    }
    catch(err){

        console.log("connection failed to mongoDB",err)

    }
}
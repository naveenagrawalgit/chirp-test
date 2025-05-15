import jwt from "jsonwebtoken"

export const generateTokens =(userId,res)=>{

    const token = jwt.sign({userId},process.env.JWT_SECRET,{
        expiresIn:"7d"
    })

    // first argument is the name of the cokkie which is "jwt"
    res.cookie("jwt",token,{
        maxAge:7* 24*60*60*1000, //milli second equivalent of 7d
        httpOnly: true, // prevent XSS attacks 'cross-site scripting attacks'
        sameSite: "strict", // csrf attacks cross-site request forgery attacks
        secure: process.env.NODE_ENV !== "development"
        })

return token;



}
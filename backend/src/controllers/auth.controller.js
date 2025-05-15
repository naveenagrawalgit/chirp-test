import User from "../models/user.model.js"
import { generateTokens } from "../lib/utils.js"
import bcrypt from "bcryptjs"
import cloudinary from "../lib/cloudinary.js"

export const signup = async (req,res)=>{
    console.log("data inside req.body of signup", req.body)
    const {fullName, email,password} = req.body

    try {

        if(!fullName || !email || !password){
            return res.status(400).json({message: "All fields are required"})
        }

        if(password.length < 6){
            return res.status(400).json({message:"Password must be at least 6 chracters"})
        }


        // only to check if already a user with the email exist or not

    
        const user = await User.findOne({email})
        if(user) return res.status(400).json({message: "Email already exists "})

             //hash password

            const salt = await bcrypt.genSalt(10)
            const hashedPassword = await bcrypt.hash(password,salt)

            const newUser = new User({
                fullName:fullName, // read below comment we can also simply and write fullName instead
                email, // same as email: email (as both have same name we can give only one and it will work)
                password: hashedPassword
            })

            if(newUser) {

                // after saving user to databse we generate jwt token
                generateTokens(newUser._id,res)
                await newUser.save();

                res.status(201).json({
                    _id:newUser._id,
                    fullName: newUser.fullName,
                    email:newUser.email,
                    profilePic: newUser.profilePic

                })

            }
            else{
                res.status(400).json({message: "Invalid user data"})
            }

    } catch (error) {

        console.log("error inside signup",error.message, error)
        res.status(500).json({message: "internal server error"})
    }

}




export const login = async (req,res)=>{
     const {email,password} = req.body

     console.log(email)

     try {
        const user = await User.findOne({email})
        console.log(user)

        if(!user) return res.status(400).json({message: "Invalid credentials"})

         const isPasswordCorrect = await bcrypt.compare(password, user.password)

         if(!isPasswordCorrect){
            return res.status(400).json({message: "Invalid credentials"})
         }

         generateTokens(user._id, res)

         // sending data to frontend here
         res.status(200).json({

            _id:user._id,
            fullName: user.fullName,
            email: user.email,
            profilePic: user.profilePic,
         })



     } catch (error) {
        console.log("ERROR IN LOGIN CONTROLLER",error.message)

        res.status(500).json({message: "Internal server error"})
        
     }
}





export const logout = (req,res)=>{
    
    try{
        res.cookie("jwt","",{maxAge:0})
        res.status(200).json({message: "Logged out successfully"})

    }catch(err){
        console.log("error during logout",err)
        res.status(500).json({message: "Internal server error"})

    }
}

export const updateProfile = async(req,res) =>{

    try {
        const {profilePic} = req.body;

        // getting by next() from midddleware of auth
        const userId = req.user._id;

        if(!profilePic) return  res.status(400).json({message: "Profile pic is required"});


        const uploadResponse = await cloudinary.uploader.upload(profilePic)

        const updatedUser = await User.findByIdAndUpdate(userId,{profilePic:uploadResponse.secure_url},{new:true})

        res.status(200).json({updatedUser})


    } catch (error) {

        console.log("error in updating the profile pic",error)

        res.status(500),json({message: "Internal server error during updation of profilepic"})

        
    }
};


//to check authentication if user refreshes 

export const checkAuth = (req,res)=> {
    try {
        res.status(200).json(req.user);
    } catch (error) {
        console.log("error in check auth controller", error.message)
        res.status(500).json({message: "Internal server Error"})
    }

}



import dotenv from "dotenv"
import cookieparser from "cookie-parser"
import  express from "express"
import authRoutes from "./routes/auth.route.js"
import { connectDB } from "./lib/db.js";
import  messageRoutes  from "./routes/message.route.js";
import cors from "cors"
import path from "path"
import { app,server } from "./lib/socket.js";
dotenv.config()

const PORT = process.env.PORT
const __dirname = path.resolve();

app.use(express.json({limit: '50mb'}))
app.use(cookieparser())
app.use(cors({
    
        origin: "http://localhost:5173",
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"]
    }
    ))


// declare all middlewares before mounting any route or else it will not work
app.use("/api/auth", authRoutes)
app.use("/api/messages",messageRoutes)


if(process.env.NODE_ENV ===   "production"){
    app.use(express.static(path.join(__dirname,'../frontend/dist')));

    app.get("/{*any}",(req,res)=>{
        res.sendFile(path.join(__dirname,'../frontend','dist','index.html'));
    });

}



server.listen(PORT,() =>{
    console.log("server is running on port "+ PORT)

    connectDB()
})


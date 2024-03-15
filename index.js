import express from "express"
import "dotenv/config"
import cors from "cors"
import connection from "./db/db.js"
import userRouter from "./Route/userRouter.js"




const app = express()
connection()

app.use(cors({
    origin: process.env.ORIGIN,
    credentials: true
}));
app.use(express.json())
app.use(express.urlencoded({extended:true}))

app.use("/",userRouter)

app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Error"
    res.status(statusCode).json({
        status: 'Error',
        statusCode,
        message
    });
})

const port = process.env.PORT

app.listen(port,()=>{
    console.log("server is connected")
})
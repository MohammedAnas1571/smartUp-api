import mongoose from "mongoose"
import  bcrypt from 'bcrypt';
import  Admin from './model/adminModel.js'
import "dotenv/config"





mongoose
  .connect(process.env.MONGO)
  .then(() => console.log('DB Connected'))
  .catch(err => console.error('Error connecting to MongoDB:', err));

const seedAdmin = async ()=>{
    try{
    const admin = process.env.ADMINUSERNAME
    const password = process.env.ADMINPASSWORD

    const hashedPassword = await bcrypt.hashSync(password,10);
    await Admin.create({
        email : admin,
        password : hashedPassword
    })
        console.log('Admin created successfully');
        process.exit();
} catch(error){
    
        console.log(error)
        process.exit(1);
} }



seedAdmin();
import mongoose from "mongoose";
import dotenv from "dotenv"

dotenv.config({path: "variables.env"})

export const conectarDB = async ()=>{
    try{
        await mongoose.connect(process.env.DB_MONGO, {
            useNewUrlParser: true,
        })
        console.log("DB conectada")
    }catch(e){
        console.log("Error al conectar la base de datos", e)
        process.exit(1)
    }
}


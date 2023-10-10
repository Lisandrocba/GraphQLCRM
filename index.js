import { ApolloServer } from "apollo-server";
import typeDefs from "./db/schema.js";
import resolvers from "./db/resolvers.js";
import { conectarDB } from "./config/db.js";
import dotenv from "dotenv"
import jwt from "jsonwebtoken"
dotenv.config({path: "variables.env"})

//conectando base de datos
conectarDB()


//servidor
const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({req})=>{
        const token = req.headers['authorization'] || ''
        if(token){
            try {
                const usuario = jwt.verify(token.replace('Bearer ', ''), process.env.SECRETA);
                return{
                    usuario
                }
            } catch (error) {
                console.log("No se pudo encontrar el vendedor")
            }
        }
    }
})

server.listen({port: process.env.PORT || 4000}).then(({url})=>{
    console.log(`Servidor listo en la URL ${url}`)
})

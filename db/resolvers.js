import Usuario from "../models/Usuarios.js";
import Producto from "../models/Productos.js";
import Cliente from "../models/Clientes.js";
import Pedido from "../models/Pedidos.js"
import bcryptjs from "bcryptjs";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { trusted } from "mongoose";
dotenv.config({ path: "variables.env" });

const createToken = (objeto, secreta, expiresIn) => {
  const { id, email, nombre, apellido } = objeto;
  return jwt.sign({ id, email, nombre, apellido }, secreta, { expiresIn });
};

//Resolver
const resolvers = {
  Query: {
    /* usuarios: */

    obtenerUsuario: async (_, {}, ctx) => {
      return ctx.usuario
    },

     /* productos: */

    obtenerProductos: async () => {
      try {
        const productos = Producto.find({});
        return productos;
      } catch (error) {
        console.log("Error al buscar el producto", error)
      }
    },
    obtenerProductoId: async (_, { id }) => {
      try {
        const producto = await Producto.findById(id);
        if (!producto) {
          throw new Error("No se encontro el producto");
        }
        return producto;
      } catch (error) {
        console.log("Error al buscar el producto", error);
      }
    },

     /* clientes: */

    obtenerClientes: async()=>{
      try {
        const clientes = await Cliente.find({})
        return clientes
      } catch (error) {
        console.log("Error al obtener lo clientes ", error)
      }
    },
    obtenerClientesPorVendedor: async(_,{}, ctx)=>{
      try { 
        const clientes = await Cliente.find({vendedor: ctx.usuario.id.toString()})
        return clientes
      } catch (error) {
        console.log("Error al buscar los clientes por vendedor", error)
      }
    },
    obtenerCliente: async(_, {id}, ctx)=>{
      try {
        const cliente = await Cliente.findById(id)
        if(!cliente){
          throw new Error("No se encontro el cliente");
        }
        if(cliente.vendedor.toString() !== ctx.usuario.id){
          throw new Error("No tienes las credenciales");
        }
        return cliente
      } catch (error) {
        console.log("Error al buscar el cliente", error)
      }
    },

    /* Pedidos: */
    obtenerPedidos: async()=>{
      try {
        const pedidos = await Pedido.find({})
        if(!pedidos){
          throw new Error("No se encontraron pedidos")
        }
        return pedidos
      } catch (error) {
        console.log("Error al obtener los pedidos", error)
      }
    },
    obtenerPedidosVendedor: async(_, {}, ctx)=>{
      try {
        const pedidos = await Pedido.find({vendedor: ctx.usuario.id.toString()}).populate("cliente")
        if(!pedidos){
          throw new Error("No se encontraron pedidos")
        }
        return pedidos
      } catch (error) {
        console.log("Error al obtener los pedidos", error)
      }
    },
    obtenerPedido: async(_, {id}, ctx)=>{
      try {
        const pedido = await Pedido.findById(id)
        if(!pedido){
          throw new Error("No se encontro el pedido")
        }
        if(pedido.vendedor.toString() !== ctx.usuario.id){
          throw new Error("No tienes las credenciales")
        }

        return pedido
      } catch (error) {
        console.log("Error al buscar el pedido ", error)
      }
    },

    /* Busquedas Avanzadas */
    mejoresClientes: async()=>{
      const clientes = await Pedido.aggregate([
        {$match: {estado : "COMPLETADO"}},
        {$group : {
          _id: "$cliente",
          total: {$sum: '$total'}
        }},
        {$lookup: {
          from: 'clientes',
          localField: '_id',
          foreignField: '_id',
          as: 'cliente'
        }},
        {$sort: {
          total: -1
        }}
      ])

      return clientes
    },
    mejoresVendedores: async()=>{
      const vendedor = Pedido.aggregate([
        {$match: {estado: "COMPLETADO"}},
        {$group: {
          _id: '$vendedor',
          total: {$sum: '$total'}
        }},
        {$lookup: {
          from: 'usuarios',
          localField: '_id',
          foreignField: '_id',
          as: 'vendedor'
        }},
        {$limit: 3},
        {$sort: {
          total: -1
        }}
      ])
      return vendedor
    }
  },
  Mutation: {
     /* usuarios: */

    crearUsuario: async (_, { input }) => {
      const { email, password } = input;

      const usuarioExiste = await Usuario.findOne({ email });
      if (usuarioExiste) {
        throw new Error("El usuario ya se encuentra registrado");
      }

      const salt = await bcryptjs.genSalt(10);
      input.password = await bcryptjs.hash(password, salt);

      try {
        const usuario = new Usuario(input);
        usuario.save();
        return usuario;
      } catch (e) {
        console.log(e);
      }
    },
    autenticarUsuario: async (_, { input }) => {
      const { email, password } = input;

      const usuarioExiste = await Usuario.findOne({ email });
      if (!usuarioExiste) {
        throw new Error("El usuario no existe");
      }

      const passwordCorrecta = await bcryptjs.compare(
        password,
        usuarioExiste.password
      );
      if (!passwordCorrecta) {
        throw new Error("La contraseña es incorrecta");
      }

      return {
        token: createToken(usuarioExiste, process.env.SECRETA, "24h"),
      };
    },

     /* productos: */

    crearProducto: async (_, { input }) => {
      try {
        const nuevoProducto = new Producto(input);
        const producto = await nuevoProducto.save();
        return producto;
      } catch (error) {
        console.log("Error al cargar el producto", error);
      }
    },
    actualizarProducto: async (_, { id, input }) => {
      try {
        let producto = await Producto.findById(id);
        if (!producto) {
          throw new Error("No se encontro el producto");
        }
        producto = await Producto.findOneAndUpdate({ _id: id }, input, {
          new: true,
        });
        return producto;
      } catch (error) {
        console.log("Error al modificar el producto", error);
      }
    },
    eliminarProducto: async (_, { id }) => {
      try {
        let producto = await Producto.findById(id);
        if (!producto) {
          throw new Error("El producto no existe");
        }
        producto = await Producto.findOneAndDelete({ _id: id });
        return "Producto eliminado con exito";
      } catch (error) {
        console.log("Error al eliminar el producto", error);
      }
    },

     /* clientes: */
     
    crearCliente: async (_, { input }, ctx) => {
        const { email } = input;
        const cliente = await Cliente.findOne({ email });
        if (cliente) {
          throw new Error("El cliente ya se encuentra registrado");
        }
        const nuevoCliente = await Cliente(input);
        nuevoCliente.vendedor = ctx.usuario.id
        const resultado = await nuevoCliente.save();

        return resultado;
    },
    actualizarCliente: async(_, {id, input}, ctx)=>{
      const cliente = await Cliente.findById(id);
      if(!cliente){
        throw new Error("No se encontro el cliente")
      }
      if(cliente.vendedor.toString() !== ctx.usuario.id){
        throw new Error("No tienes las credenciales");
      }
      try {
        const nuevoCliente = Cliente.findOneAndUpdate({_id: id}, input, {new: true})
        return nuevoCliente
      } catch (error) {
        console.log("Error al modificar el cliente", error)
      }
     
    },
    eliminarCliente: async(_, {id}, ctx)=>{
      const cliente = await Cliente.findById(id);
      if(!cliente){
        throw new Error("No se encontro el cliente")
      }
      if(cliente.vendedor.toString() !== ctx.usuario.id){
        throw new Error("No tienes las credenciales");
      }
      try {
        await Cliente.findOneAndDelete({_id: id})
        return "Cliente eliminado"
      } catch (error) {
        console.log("Error al modificar el cliente", error)
      }
     
    },

    /* pedidos: */
    nuevoPedido: async(_, {input}, ctx)=>{
      // verificar cliente
      const {cliente} = input
      const verificarCliente = await Cliente.findById(cliente)
      if(!verificarCliente){
        throw new Error("El cliente seleccionado no existe")
      }

      //verificar si el cliente es del vendedor
      if(verificarCliente.vendedor.toString() !== ctx.usuario.id){
        throw new Error("No se tienen las credenciales del cliente")
      }


      //revisar el stock
      for await (const articulo of input.pedido){
        const {id} = articulo;
        const producto = await Producto.findById(id)

        if(articulo.cantidad > producto.stock){
          throw new Error(`El producto ${producto.nombre} excede la cantidad disponible`)
        }else{
          producto.stock = producto.stock - articulo.cantidad;

          await producto.save()
        }
      }

      //asignarle el vendedor
      const nuevoPedido = new Pedido(input)
      nuevoPedido.vendedor = ctx.usuario.id

      //guardar
      const resultado = await nuevoPedido.save()
      return resultado
    },
    actualizarPedido: async(_, {id, input}, ctx)=>{
      try {
        const {cliente} = input
        const pedido = await Pedido.findById(id)
        if(!pedido){
          throw new Error("No se encontro el pedido ")
        }
        const clienteExiste = await Cliente.findById(cliente)
        if(!clienteExiste){
          throw new Error("No se encontro el cliente ")
        }
        if(clienteExiste.vendedor.toString() !== ctx.usuario.id){
          throw new Error("No tienes las credenciales")
        }
        if(input.pedido){
          let index = 0
          for await (const articulo of input.pedido){
            const {id, cantidad} = articulo
          const producto = await Producto.findById(id)
           if(cantidad > pedido.pedido[index].cantidad){
              let cant = 0
              cant = cantidad - pedido.pedido[index].cantidad
              producto.stock = producto.stock - cant
              await producto.save() 
            }else{
              let cant = 0
              cant = pedido.pedido[index].cantidad - cantidad 
              producto.stock = producto.stock + cant
              await producto.save() 
            } 
            index++
          }
        }

        const resultado = await Pedido.findOneAndUpdate({_id: id}, input, {new: true})
        return resultado

      } catch (error) {
        console.log("Error al modificar el pedido ", error)
      }
    },
    eliminarPedido: async(_, {id}, ctx)=>{
     
        const pedido = await Pedido.findById(id)
        console.log("el pedido: ",pedido)
        if(!pedido){
          throw new Error("No se encontro el pedido")
        }
        if(pedido.vendedor.toString() !== ctx.usuario.id){
          throw new Error("No tienes las credenciales")
        }

        await Pedido.findOneAndDelete({_id: id})
        return "Pedido Eliminado" 
    },
    obtenerPedidosEstado: async(_,{estado}, ctx)=>{
      const pedidos = await Pedido.find({vendedor: ctx.usuario.id, estado})
      if(!pedidos){
        throw new Error("No se encontro el pedido")
      }
      return pedidos
    },

    /* Busquedas Avanzadas */
    buscarProducto: async(_, {text})=>{
      const productos = await Producto.find({$text: {$search: text}}).limit(10)
      return productos
    }
  },
};

export default resolvers;

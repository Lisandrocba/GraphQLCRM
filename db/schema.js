import { gql } from "apollo-server";

//Schema
const typeDefs = gql`
type Usuario{
    id: ID
    nombre: String
    apellido: String
    email: String
    current: String
}

type Token{
    token: String
}

type Producto{
    id: ID
    nombre: String
    stock: Int
    precio: Float
    current: String
}

type Cliente{
    id: ID
    nombre: String!
    apellido: String!
    email: String!
    telefono: String
    creado: String
    vendedor: ID
}

type Pedido{
    id: ID
    pedido: [PedidoGrupo]
    total: Float
    cliente: Cliente
    vendedor: ID
    estado: EstadoPedido
    creado: String
}

type PedidoGrupo{
    id: ID
    cantidad: Int
    nombre: String
    precio: Float
}

type TopCliente{
    total: Float
    cliente: [Cliente]
}

type TopVendedor{
    total: Float
    vendedor: [Usuario]
}

input UsuarioInput {
    nombre: String!
    apellido: String!
    email: String!
    password: String!
}


input TokenInput{
    email: String!
    password: String!
}

input ProductoInput{
    nombre: String!
    stock: Int!
    precio: Float!
}

input ClienteInput{
    nombre: String!
    apellido: String!
    email: String!
    telefono: String
}

input PedidoProductoInput{
    id: ID
    cantidad: Int
    nombre: String
    precio: Float
}

input PedidoInput{
    pedido: [PedidoProductoInput]
    total: Float
    cliente: ID
    estado: EstadoPedido
}

enum EstadoPedido{
    PENDIENTE
    COMPLETADO
    CANCELADO
}

type Query {
    # Usuarios:
    obtenerUsuario: Usuario

    # Productos:
    obtenerProductos: [Producto]
    obtenerProductoId(id: ID!): Producto

    # Cliente:
    obtenerClientes: [Cliente]
    obtenerClientesPorVendedor: [Cliente]
    obtenerCliente(id: ID!): Cliente

    # Pedido:
    obtenerPedidos: [Pedido]
    obtenerPedidosVendedor: [Pedido]
    obtenerPedido(id: ID!): Pedido

    # Busquedas Avanzadas
    mejoresClientes: [TopCliente]
    mejoresVendedores: [TopVendedor]
    
}

type Mutation {
    # Usuarios:
    crearUsuario(input: UsuarioInput): Usuario
    autenticarUsuario(input: TokenInput): Token

    # Productos:
    crearProducto(input: ProductoInput): Producto
    actualizarProducto(id: ID!, input: ProductoInput): Producto
    eliminarProducto(id: ID!): String

    # Cliente:
    crearCliente(input: ClienteInput): Cliente
    actualizarCliente(id: ID!, input: ClienteInput): Cliente
    eliminarCliente(id: ID!): String

    # Pedido:
    nuevoPedido(input: PedidoInput): Pedido
    actualizarPedido(id: ID!, input: PedidoInput): Pedido
    eliminarPedido(id: ID!): String
    obtenerPedidosEstado(estado: String!): [Pedido] 

    # Busquedas Avanzadas
    buscarProducto(text: String!): [Producto]
}
`

export default typeDefs
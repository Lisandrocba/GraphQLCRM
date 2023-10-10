import mongoose from "mongoose";

const PedidosSchema = mongoose.Schema({
    pedido:{
        type: Array,
        required: true,
    },
    total:{
        type: Number,
        required: true
    },
    cliente: {
        type: mongoose.Schema.Types.ObjectID,
        required: true,
        ref: "Cliente"
    },
    vendedor: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Usuario"
    },
    estado: {
        type: String,
        default: "PENDIENTE"
    },
    creado: {
        type: Date,
        default: Date.now()
    }
})

export default mongoose.model("Pedido", PedidosSchema)
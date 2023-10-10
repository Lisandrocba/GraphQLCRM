import mongoose from "mongoose";

const productosSchema = mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    stock: {
        type: Number,
        required: true,
        trim: true
    },
    precio: {
        type: Number,
        required: true,
        trim: true
    },
    current: {
        type: Date,
        default: Date.now()
    }
})

productosSchema.index({nombre: 'text'})

export default mongoose.model("Producto", productosSchema)
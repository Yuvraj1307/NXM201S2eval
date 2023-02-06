const mongoose=require("mongoose")

const userschema=mongoose.Schema({
    name:String,
    mail:String,
    pass:String,
    role:{type:String,enum:["user","manager"],default:"user"}
})

const usermodel=mongoose.model("users",userschema)
module.exports={
    usermodel
}
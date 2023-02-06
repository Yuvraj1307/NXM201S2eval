const express=require("express")
const {connection}=require("./config/db")
const {usermodel}=require("./model/usermodel")
const bcrypt=require("bcrypt")
const jwt=require("jsonwebtoken")
const {authontication,authorise}=require("./moddleware/auth")
const fs=require("fs")

const app=express()
app.use(express.json())
app.get("/",(req,res)=>{
    res.send("hello")
})

app.post("/signup",async (req,res)=>{
    let {name,mail,pass,role}=req.body
    bcrypt.hash(pass, 5, async function(err, hash) {
              
        const user=await usermodel.insertMany({name,mail,pass:hash,role})
        console.log(user)
        res.send("user is created")
    });
  

  //  console.log({name,mail,pass,role})
   
})

app.post("/login",async (req,res)=>{
    const {mail,pass}=req.body
    const user=await usermodel.findOne({mail})
    if(!user){
        res.send("please signup")
    }

    const hashpass=user?.pass
    bcrypt.compare(pass, hashpass, function(err, result) {
        if(result == true){
            const token=jwt.sign({userID: user._id}, 'secret', { expiresIn: 60 });
            const refreshtoken=jwt.sign({userID: user._id}, 'refreshsecret', { expiresIn: 300 });
            res.send({msg:"login sucess",token,refreshtoken})
        }else{
            res.send("login failed")
        }
    });
    // console.log(user)
    // res.send(user)
})


app.get("/gettoken",(req,res)=>{
    const refreshtoken=req.headers.authorization?.split(" ")[1]
    if(!refreshtoken){
        res.send("login please")
    }
    jwt.verify(refreshtoken, 'refreshsecret', function(err, decoded) {
       if(err){
        res.send({msg:"please login",err:err.message})
       }else{
        const token=jwt.sign({userID: decoded.userID}, 'secret', { expiresIn: 60 });
        res.send({token})
       }
       
       
      });
})
app.get("/logout",(req,res)=>{
     const token = req.headers.authorization?.split(" ")[1]
     const blacklist=JSON.parse(fs.readFileSync("./blacklist.json","utf-8"))
     blacklist.push(token)
     fs.writeFileSync("./blacklist.json",JSON.stringify(blacklist))
     res.send("logout seccess")
})
app.get("/goldrate",authontication,(req,res)=>{
    res.send("rates")
})
app.get("/userstats",authontication,authorise(["manager"]),(req,res)=>{
res.send("user states")
})

require('dotenv').config()
app.listen(process.env.port,async ()=>{
    try{
        await connection
        console.log("connected to db")
    }catch(err){
        console.log("cant connect to db")
        console.log(err)
    }
})
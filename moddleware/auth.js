const jwt=require("jsonwebtoken")
const fs=require("fs")

const authontication=(req,res,next)=>{

const token=req.headers.authorization?.split(" ")[1]

if(!token){
    res.send("login please")
}

const blacklist=JSON.parse(fs.readFileSync("./blacklist.json","utf-8"))

if(blacklist.includes(token)){
    res.send("login again")
}


jwt.verify(token, 'secret', function(err, decoded) {
    
      if(err){
        res.send({msg:"please login","err":err.message})
      }else{
        const role=decoded.role
        req.body.userrole=role
        next()
      }


  });




}


const authorise=(array)=>{

    return (req,res,next)=>{
        const role=req.body.userrole
        if(array.includes(role)){
            next()
        }else{
            res.send("cant access")
        }
    }
}



module.exports={
    authontication,authorise
}
const Express=require("express")
const Mongoose=require("mongoose")
const Cors=require("cors")
const Bcrypt=require("bcrypt")
const Jwt=require("jsonwebtoken")
const userModel = require("./models/users")

let app=Express()

app.use(Express.json())
app.use(Cors())

Mongoose.connect("mongodb+srv://amruthabinu:amruthabinu2002@cluster0.bwn2sfy.mongodb.net/collegeEventDb?retryWrites=true&w=majority&appName=Cluster0")

app.get("/signup",(req,res)=>{
    
    let input=req.body
    let hashedPassword = Bcrypt.hashSync(req.body.password,10)
    console.log(hashedPassword)
    req.body.password=hashedPassword
    
    userModel.find({email:req.body.email}).then(

        (items)=>{
            if(items.length>0){
                res.json({"status":"Email id already exist"})
            }
            else{

                let result=new userModel(input)
                result.save()
                res.json({"status":"Successfull"})
            }
        }

    ).catch(
        (error)=>{}
    )



})

app.listen(4050,()=>{
    console.log("Server Started")
})
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


//SIGNIN
app.post("/signin",(req,res)=>{
    let input=req.body
    let result=userModel.find({email:req.body.email}).then(
        (items)=>{
            if (items.length>0) {

                const passwordValidator=Bcrypt.compareSync(req.body.password,items[0].password)
                if (passwordValidator) {
                    Jwt.sign({email:req.body.email},"collegeEventApp",{expiresIn:"1d"},
                        (error,token)=>{
                            if (error) {
                                res.json({"status":"error","errorMessage":error})
                            } else {
                                res.json({"status":"success","token":token,"userId":items[0]._id})
                            }
                        }
                    )
                    
                } else {
                    res.json({"status":"Incorrect password"})
                    
                }
                
            } else {
                res.json({"status":"Invalid email id"})
            }

        }
    ).catch()
})



//SIGNUP
app.post("/signup",(req,res)=>{
    
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
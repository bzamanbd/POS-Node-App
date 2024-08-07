import express from 'express' 
import 'dotenv'
import routes from './routes/index.js'
import globalErrorHandler from './middlewares/globalErrorHandler.js'

const app = express() 
const port = process.env.PORT || 4010

app.use(express.json())
app.use(routes)

app.get('/',(req,res)=>{ 
    res.status(200).json({message:"Welcome to the multi-tenancy app. This is home route of the app"})
})

app.use('*',(req,res)=>{ 
    res.status(404).json({ 
        message:`${req.originalUrl} <== Route not found`
    })
})

app.use(globalErrorHandler)

app.listen(port,()=>console.log(`server is running at http://localhost:${port}`))
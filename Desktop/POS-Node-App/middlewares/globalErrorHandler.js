const globalErrorHandler =(err,req,res,next)=>{
    const status = err.status? err.status : "False"
    const message = err.message
    const stack = err.stack
    const statusCode = err.statusCode? err.statusCode : 500
    res.status(statusCode).json({ status,message,stack })
 }

 export default globalErrorHandler
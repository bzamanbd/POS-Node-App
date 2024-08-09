const appRes = (res, status,success,message, data = null) => {
    res.status(status).json({
      success: success || 'True',
      message: message,
      data: data
    });
  };
  
export default appRes;  
import prisma from '../../db_client/prisma_client.js';
import PDFDocument from 'pdfkit';
import {Parser} from 'json2csv'
import appErr from '../../utils/appErr.js';

export const totalSalesReport = async(req,res,next)=>{  
    const shopId = req.shopOwner.shopId
    try {
        const totalSales = await prisma.sale.aggregate({ 
            where:{shopId}, 
            _sum:{totalPrice:true}
        })
        res.status(200).json({
            message:'The Total Sales',
            totalSales
        });    
    } catch (e) {
        return next(appErr(e.message,500))
    }
    
}

export const totalSalesReportPdf = async(req,res,next)=>{  
    const shopId = req.shopOwner.shopId
    try {
        const totalSales = await prisma.sale.aggregate({ 
            where:{shopId}, 
            _sum:{totalPrice:true}
        });

        const doc = new PDFDocument();
        let filename = 'total_sales_report.pdf';
        filename = encodeURIComponent(filename);
        res.setHeader('Content-disposition', 'attachment; filename="' + filename + '"');
        res.setHeader('Content-type', 'application/pdf');
        doc.save().moveTo(0, 0).lineTo(0, 70).lineTo(0, 70).lineTo(50, 0).fill('#FF3300');
        doc.fontSize(16)
        doc.fill('#000000')
        doc.text(`Total Sales: ${totalSales._sum.totalPrice}`,{align:'center'},);
        doc.text('dhaka,bangladesh',{align:'center'});
        
        doc.pipe(res);
        doc.end();  
    } catch (e) {
        return next(appErr(e.message,500))
    }
    
}

export const totalSalesReportCsv = async(req,res,next)=>{  
    const shopId = req.shopOwner.shopId
    try {
        const totalSales = await prisma.sale.aggregate({ 
            where:{shopId}, 
            _sum:{totalPrice:true}
        });
        const fields = ['_sum.totalPrice'];
        const opts = { fields };
        const parser = new Parser(opts);
        const csv = parser.parse(totalSales); 

        res.header('Content-Type', 'text/csv');
        res.attachment('total_sales_report.csv');
        res.send(csv);
    } catch (e) {
        return next(appErr(e.message,500))
    }
    
}

export const salesReportByProduct = async(req,res,next)=>{  
    const shopId = req.shopOwner.shopId
    try {
        const sales = await prisma.saleItem.groupBy({
            where:{shopId},
            by:['productId'],
            _sum:{quantity:true, totalPrice:true},
        })
        res.status(200).json({
            message:'Product base sales',
            sales
        });
    } catch (e) {
        return next(appErr(e.message,500))
    }
    
}

export const salesReportByProductCsv = async(req,res,next)=>{  
    const shopId = req.shopOwner.shopId
    try {
        const sales = await prisma.saleItem.groupBy({
            where:{shopId},
            by:['productId'],
            _sum:{quantity:true, totalPrice:true},
        })

        const fields = ['productId', '_sum.quantity', '_sum.totalPrice'];
        const opts = { fields };
        const parser = new Parser(opts);
        const csv = parser.parse(sales);
      
        res.header('Content-Type', 'text/csv');
        res.attachment('sales_by_product_report.csv');
        res.send(csv);
    } catch (e) {
        return next(appErr(e.message,500))
    }
    
}

export const salesReportByProductPdf = async(req,res,next)=>{  
    const shopId = req.shopOwner.shopId
    try {
        const sales = await prisma.saleItem.groupBy({
            where:{shopId},
            by:['productId'],
            _sum:{quantity:true, totalPrice:true},
        });

        const doc = new PDFDocument();
        let filename = 'sales_by_product_report.pdf';
        filename = encodeURIComponent(filename);
        res.setHeader('Content-disposition', 'attachment; filename="' + filename + '"');
        res.setHeader('Content-type', 'application/pdf');
        
        doc.text('Report of Sales by Product', {align: 'center'});
        
        sales.forEach((item) => {
            doc.text(`Product ID: ${item.productId}`);
            doc.text(`Quantity Sold: ${item._sum.quantity}`);
            doc.text(`Total Sales: ${item._sum.totalPrice}`);
            doc.text('------------------------------------');
          });

        doc.pipe(res);
        doc.end();
    } catch (e) {
        return next(appErr(e.message,500))
    }
    
}

export const salesReportByDate = async(req,res,next)=>{  
    const { startDate, endDate } = req.query;
    const shopId = req.shopOwner.shopId
    const start = new Date(startDate)
    const end = new Date(endDate)

    if (!startDate || !endDate) return next(appErr('startDate and endDate query parameters are required',400))
    
    if (isNaN(start) || isNaN(end)) return next(appErr('Invalid date format',400))
    
    try {
        const salesByDate  = await prisma.sale.findMany({ 
            where:{ 
                shopId,
                saleDate:{ 
                    gte: new Date(startDate),
                    lte: new Date(endDate),
                },
            },
            
        })
        const totalSales = salesByDate.reduce((acc, sale) => acc + sale.totalPrice, 0);
        
        res.status(200).json({ 
            message:`Total sales from ${start.getDate()}-${start.getMonth()+1}-${start.getFullYear()} to ${end.getDate()}-${end.getMonth()+1}-${end.getFullYear()}`,
            totalSales,
            salesByDate
        })

    } catch (e) {
        if (e.message === 'Invalid date format') {
            return next(appErr('Invalid date format. Please use YYYY-MM-DD format',400))
        } else {
            return next(appErr(e.message,500))
        }
    }
    
}
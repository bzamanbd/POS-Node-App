import prisma from '../../db_client/prisma_client.js';

import PDFDocument from 'pdfkit';

import {Parser} from 'json2csv'

export const totalSalesReport = async(req,res)=>{  
    const shopId = req.salesman.shopId
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
        return res.status(500).json({ 
            error:"Something went wrong", 
            e
        })
    }
    
}


export const totalSalesReportPdf = async(req,res)=>{  
    const shopId = req.salesman.shopId
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
        return res.status(500).json({ 
            error:"Something went wrong", 
            e
        })
    }
    
}

export const totalSalesReportCsv = async(req,res)=>{  
    const shopId = req.salesman.shopId
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
        return res.status(500).json({ 
            error:"Something went wrong", 
            e
        })
    }
    
}



export const salesReportByProduct = async(req,res)=>{  
    const shopId = req.salesman.shopId
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
        return res.status(500).json({ 
            error:"Something went wrong", 
            e
        })
    }
    
}



export const salesReportByProductCsv = async(req,res)=>{  
    const shopId = req.salesman.shopId
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
        return res.status(500).json({ 
            error:"Something went wrong", 
            e
        })
    }
    
}

export const salesReportByProductPdf = async(req,res)=>{  
    const shopId = req.salesman.shopId
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
        return res.status(500).json({ 
            error:"Something went wrong", 
            e
        })
    }
    
}

export const salesReportByDate = async(req,res)=>{  
    const { startDate, endDate } = req.query;
    const shopId = req.salesman.shopId
    const start = new Date(startDate)
    const end = new Date(endDate)

    if (!startDate || !endDate) {
        return res.status(400).json({ error: 'startDate and endDate query parameters are required' });
      }

    if (isNaN(start) || isNaN(end)) {
        throw new Error('Invalid date format');
      }

    try {
        const sales  = await prisma.sale.findMany({ 
            where:{ 
                shopId,
                saleDate:{ 
                    gte: start,
                    lte: end,
                },
            },
        })
        const totalSales = sales.reduce((acc, sale) => acc + sale.totalPrice, 0);
        res.status(200).json({ 
            message:`Total sales from ${start.getDate()}-${start.getMonth()+1}-${start.getFullYear()} to ${end.getDate()}-${end.getMonth()+1}-${end.getFullYear()}`,
            totalSales,
            sales
        })
    } catch (error) {
        if (error.message === 'Invalid date format') {
            return res.status(400).json({ error: 'Invalid date format. Please use YYYY-MM-DD format.' });
        } else {
            return res.status(500).json({ error: error.message });
        }
    }
    
}
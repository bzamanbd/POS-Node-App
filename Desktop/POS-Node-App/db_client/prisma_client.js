import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient({ 
    log:["query"]
}).$extends({
    client: {
      async calculateSaleItemProfitAndUpdateProduct(saleItemId) {
        const saleItem = await this.saleItem.findUnique({
          where: { id: saleItemId },
          include: { product: true },
        });
  
        if (!saleItem) {
          throw new Error(`SaleItem with ID ${saleItemId} not found`);
        }
  
        const product = saleItem.product;
        const quantity = saleItem.quantity;
  
        // Check if sufficient quantity is available
        if (product.quantity < quantity) {
          throw new Error(`Insufficient quantity for product ID ${product.id}`);
        }
  
        const totalPrice = product.salePrice * quantity;
        const profit = (product.salePrice - product.costPrice) * quantity;
  
        // Update the sale item with calculated values
        await this.saleItem.update({
          where: { id: saleItemId },
          data: { totalPrice, profit },
        });
  
        // Update product quantity
        await this.product.update({
          where: { id: product.id },
          data: { quantity: product.quantity - quantity },
        });
  
        return { totalPrice, profit };
      },
  
      async calculateSaleTotalPrice(saleId) {
        const saleItems = await this.saleItem.findMany({
          where: { saleId },
        });
  
        const totalSalePrice = saleItems.reduce((acc, item) => acc + item.totalPrice, 0);
  
        // Update the sale with the calculated total price
        await this.sale.update({
          where: { id: saleId },
          data: { totalPrice: totalSalePrice },
        });
  
        return { totalPrice: totalSalePrice };
      }
    }
  });

export default prisma

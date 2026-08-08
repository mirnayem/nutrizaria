-- AlterTable
ALTER TABLE "Brand" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "saleEndAt" TIMESTAMP(3),
ADD COLUMN     "salePrice" DOUBLE PRECISION,
ADD COLUMN     "saleStartAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "ProductVariant" ADD COLUMN     "salePrice" DOUBLE PRECISION;

-- CreateIndex
CREATE INDEX "Product_salePrice_idx" ON "Product"("salePrice");

-- CreateIndex
CREATE INDEX "Product_saleStartAt_saleEndAt_idx" ON "Product"("saleStartAt", "saleEndAt");

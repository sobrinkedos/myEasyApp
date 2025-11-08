-- Create stock_transactions table
CREATE TABLE IF NOT EXISTS "stock_transactions" (
    "id" TEXT NOT NULL,
    "ingredientId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "quantity" DECIMAL(10,3) NOT NULL,
    "unitCost" DECIMAL(10,4),
    "totalValue" DECIMAL(12,2),
    "reason" TEXT,
    "reference" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_transactions_pkey" PRIMARY KEY ("id")
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "stock_transactions_ingredientId_createdAt_idx" ON "stock_transactions"("ingredientId", "createdAt");
CREATE INDEX IF NOT EXISTS "stock_transactions_type_idx" ON "stock_transactions"("type");
CREATE INDEX IF NOT EXISTS "stock_transactions_createdAt_idx" ON "stock_transactions"("createdAt");

-- Add foreign keys
ALTER TABLE "stock_transactions" ADD CONSTRAINT "stock_transactions_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "ingredients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "stock_transactions" ADD CONSTRAINT "stock_transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

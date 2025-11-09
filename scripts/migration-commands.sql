-- Execute estes comandos um por vez no Neon Console
-- Copie e cole cada bloco separadamente

-- 1. Criar enum
CREATE TYPE "CounterOrderStatus" AS ENUM (
    'AGUARDANDO_PAGAMENTO',
    'PENDENTE',
    'PREPARANDO',
    'PRONTO',
    'ENTREGUE',
    'CANCELADO'
);

-- 2. Criar tabela counter_orders
CREATE TABLE "counter_orders" (
    "id" TEXT NOT NULL,
    "orderNumber" SERIAL NOT NULL,
    "customerName" VARCHAR(100),
    "status" "CounterOrderStatus" NOT NULL DEFAULT 'AGUARDANDO_PAGAMENTO',
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "notes" VARCHAR(500),
    "cancellationReason" VARCHAR(200),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paidAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "readyAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "establishmentId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    CONSTRAINT "counter_orders_pkey" PRIMARY KEY ("id")
);

-- 3. Criar tabela counter_order_items
CREATE TABLE "counter_order_items" (
    "id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "totalPrice" DECIMAL(10,2) NOT NULL,
    "notes" VARCHAR(200),
    "counterOrderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    CONSTRAINT "counter_order_items_pkey" PRIMARY KEY ("id")
);

-- 4. Criar índice único
CREATE UNIQUE INDEX "counter_orders_establishmentId_orderNumber_key" 
ON "counter_orders"("establishmentId", "orderNumber");

-- 5. Criar índice composto
CREATE INDEX "counter_orders_establishmentId_status_idx" 
ON "counter_orders"("establishmentId", "status");

-- 6. Criar índice orderNumber
CREATE INDEX "counter_orders_orderNumber_idx" 
ON "counter_orders"("orderNumber");

-- 7. Criar índice createdAt
CREATE INDEX "counter_orders_createdAt_idx" 
ON "counter_orders"("createdAt");

-- 8. Criar índice counterOrderId
CREATE INDEX "counter_order_items_counterOrderId_idx" 
ON "counter_order_items"("counterOrderId");

-- 9. Foreign key establishment
ALTER TABLE "counter_orders" 
ADD CONSTRAINT "counter_orders_establishmentId_fkey" 
FOREIGN KEY ("establishmentId") 
REFERENCES "establishments"("id") 
ON DELETE RESTRICT ON UPDATE CASCADE;

-- 10. Foreign key user
ALTER TABLE "counter_orders" 
ADD CONSTRAINT "counter_orders_createdById_fkey" 
FOREIGN KEY ("createdById") 
REFERENCES "users"("id") 
ON DELETE RESTRICT ON UPDATE CASCADE;

-- 11. Foreign key counter order
ALTER TABLE "counter_order_items" 
ADD CONSTRAINT "counter_order_items_counterOrderId_fkey" 
FOREIGN KEY ("counterOrderId") 
REFERENCES "counter_orders"("id") 
ON DELETE CASCADE ON UPDATE CASCADE;

-- 12. Foreign key product
ALTER TABLE "counter_order_items" 
ADD CONSTRAINT "counter_order_items_productId_fkey" 
FOREIGN KEY ("productId") 
REFERENCES "Product"("id") 
ON DELETE RESTRICT ON UPDATE CASCADE;

-- Verificar se tudo foi criado
SELECT 'Migration concluída com sucesso!' as status;

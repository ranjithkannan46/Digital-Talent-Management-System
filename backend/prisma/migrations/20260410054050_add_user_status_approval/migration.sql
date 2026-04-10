-- DropIndex
DROP INDEX "notifications_userId_read_createdAt_idx";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'pending';

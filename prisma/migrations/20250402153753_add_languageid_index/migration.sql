-- AlterTable
ALTER TABLE "Snippet" ALTER COLUMN "isValid" SET DEFAULT true;

-- CreateIndex
CREATE INDEX "Snippet_languageId_idx" ON "Snippet"("languageId");

-- AlterTable
ALTER TABLE "BlogPost" ADD COLUMN     "facebookPostIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "photos" TEXT[] DEFAULT ARRAY[]::TEXT[];

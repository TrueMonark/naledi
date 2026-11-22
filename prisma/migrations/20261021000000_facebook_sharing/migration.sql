-- AlterTable
ALTER TABLE "BlogPost" ADD COLUMN     "facebookError" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "facebookPostId" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "facebookPostedAt" TIMESTAMP(3);

/*
  Warnings:

  - Added the required column `name` to the `testimonial_configs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "testimonial_configs" ADD COLUMN     "name" TEXT NOT NULL;

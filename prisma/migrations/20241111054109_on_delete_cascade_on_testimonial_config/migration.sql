-- DropForeignKey
ALTER TABLE "landing_pages" DROP CONSTRAINT "landing_pages_testimonial_config_id_fkey";

-- DropForeignKey
ALTER TABLE "testimonial_configs" DROP CONSTRAINT "testimonial_configs_admin_id_fkey";

-- AddForeignKey
ALTER TABLE "landing_pages" ADD CONSTRAINT "landing_pages_testimonial_config_id_fkey" FOREIGN KEY ("testimonial_config_id") REFERENCES "testimonial_configs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "testimonial_configs" ADD CONSTRAINT "testimonial_configs_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "admins"("id") ON DELETE CASCADE ON UPDATE CASCADE;

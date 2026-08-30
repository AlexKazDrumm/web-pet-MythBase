import type { MigrationInterface, QueryRunner } from "typeorm";

export class LegacySchemaCompatibility1788103623973
  implements MigrationInterface
{
  name = "LegacySchemaCompatibility1788103623973";

  public async up(queryRunner: QueryRunner): Promise<void> {
    const altNames = await queryRunner.getTable("alt_creature_names");
    if (
      altNames?.findColumnByName("name_id") &&
      !altNames.findColumnByName("name")
    ) {
      await queryRunner.renameColumn("alt_creature_names", "name_id", "name");
    }

    const nativeNames = await queryRunner.getTable("native_creature_names");
    if (
      nativeNames?.findColumnByName("name_id") &&
      !nativeNames.findColumnByName("name")
    ) {
      await queryRunner.renameColumn(
        "native_creature_names",
        "name_id",
        "name",
      );
    }

    await queryRunner.query(
      `ALTER TABLE "locations" ALTER COLUMN "parent_id" DROP NOT NULL`,
    );

    await queryRunner.query(`
      UPDATE "locations" AS location
      SET "parent_id" = NULL
      WHERE "parent_id" IS NOT NULL
        AND NOT EXISTS (
          SELECT 1
          FROM "locations" AS parent
          WHERE parent."id" = location."parent_id"
        )
    `);

    await queryRunner.query(
      `ALTER TABLE "alt_creature_names" ALTER COLUMN "creature_id" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "native_creature_names" ALTER COLUMN "creature_id" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "creature_locations" ALTER COLUMN "creature_id" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "creature_locations" ALTER COLUMN "location_id" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "creatures" ALTER COLUMN "type_id" SET NOT NULL`,
    );

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_locations_parent" ON "locations" ("parent_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_creatures_type" ON "creatures" ("type_id")`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "UQ_creature_location" ON "creature_locations" ("creature_id", "location_id")`,
    );

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM pg_constraint
          WHERE conrelid = 'locations'::regclass
            AND contype = 'f'
            AND pg_get_constraintdef(oid) LIKE 'FOREIGN KEY (parent_id)%'
        ) THEN
          ALTER TABLE "locations"
          ADD CONSTRAINT "FK_locations_parent_compat"
          FOREIGN KEY ("parent_id") REFERENCES "locations"("id")
          ON DELETE CASCADE;
        END IF;
      END
      $$
    `);
  }

  public async down(): Promise<void> {}
}

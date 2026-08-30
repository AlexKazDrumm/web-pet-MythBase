import type { MigrationInterface, QueryRunner } from "typeorm";

export class InitSchema1788103623972 implements MigrationInterface {
    name = 'InitSchema1788103623972'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "locations" ("id" SERIAL NOT NULL, "name" character varying(128) NOT NULL, "parent_id" integer, CONSTRAINT "PK_7cc1c9e3853b94816c094825e74" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_locations_parent" ON "locations" ("parent_id") `);
        await queryRunner.query(`CREATE TABLE "creature_locations" ("id" SERIAL NOT NULL, "creature_id" integer NOT NULL, "location_id" integer NOT NULL, CONSTRAINT "PK_1500c050420e0cca1969c2be2c1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "UQ_creature_location" ON "creature_locations" ("creature_id", "location_id") `);
        await queryRunner.query(`CREATE TABLE "native_creature_names" ("id" SERIAL NOT NULL, "name" character varying(128) NOT NULL, "creature_id" integer NOT NULL, CONSTRAINT "PK_5ea14ff4ffe0bb93c238e7550be" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "types" ("id" SERIAL NOT NULL, "name" character varying(64) NOT NULL, CONSTRAINT "UQ_fa170fda66d232af69b7f880c9e" UNIQUE ("name"), CONSTRAINT "PK_33b81de5358589c738907c3559b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "creatures" ("id" SERIAL NOT NULL, "name" character varying(128) NOT NULL, "description" text NOT NULL, "cover_link" character varying(256) NOT NULL, "type_id" integer NOT NULL, CONSTRAINT "PK_8cb042c5f12e3a089b0aad287f9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_creatures_type" ON "creatures" ("type_id") `);
        await queryRunner.query(`CREATE TABLE "alt_creature_names" ("id" SERIAL NOT NULL, "name" character varying(128) NOT NULL, "creature_id" integer NOT NULL, CONSTRAINT "PK_a74ea48646baa9f17a2f058261d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "locations" ADD CONSTRAINT "FK_ce8370570fc9bb582e9510b94a0" FOREIGN KEY ("parent_id") REFERENCES "locations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "creature_locations" ADD CONSTRAINT "FK_9111ba7134cf15fe26d4ee33c2d" FOREIGN KEY ("creature_id") REFERENCES "creatures"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "creature_locations" ADD CONSTRAINT "FK_fe331908fff7b0210465e08aa8f" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "native_creature_names" ADD CONSTRAINT "FK_88ceb6d9ec5ba589ac7f933970d" FOREIGN KEY ("creature_id") REFERENCES "creatures"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "creatures" ADD CONSTRAINT "FK_5cf6a7f66a069b13055323b9afd" FOREIGN KEY ("type_id") REFERENCES "types"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "alt_creature_names" ADD CONSTRAINT "FK_68270cc6a704825d7016d6dbd85" FOREIGN KEY ("creature_id") REFERENCES "creatures"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "alt_creature_names" DROP CONSTRAINT "FK_68270cc6a704825d7016d6dbd85"`);
        await queryRunner.query(`ALTER TABLE "creatures" DROP CONSTRAINT "FK_5cf6a7f66a069b13055323b9afd"`);
        await queryRunner.query(`ALTER TABLE "native_creature_names" DROP CONSTRAINT "FK_88ceb6d9ec5ba589ac7f933970d"`);
        await queryRunner.query(`ALTER TABLE "creature_locations" DROP CONSTRAINT "FK_fe331908fff7b0210465e08aa8f"`);
        await queryRunner.query(`ALTER TABLE "creature_locations" DROP CONSTRAINT "FK_9111ba7134cf15fe26d4ee33c2d"`);
        await queryRunner.query(`ALTER TABLE "locations" DROP CONSTRAINT "FK_ce8370570fc9bb582e9510b94a0"`);
        await queryRunner.query(`DROP TABLE "alt_creature_names"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_creatures_type"`);
        await queryRunner.query(`DROP TABLE "creatures"`);
        await queryRunner.query(`DROP TABLE "types"`);
        await queryRunner.query(`DROP TABLE "native_creature_names"`);
        await queryRunner.query(`DROP INDEX "public"."UQ_creature_location"`);
        await queryRunner.query(`DROP TABLE "creature_locations"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_locations_parent"`);
        await queryRunner.query(`DROP TABLE "locations"`);
    }

}

import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCryopreservedSemenTable1766278825697 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "cryopreserved_semen" (
                "id" SERIAL NOT NULL,
                "patientDni" character varying(20) NOT NULL,
                "phenotype" jsonb,
                "cryoTank" character varying(50),
                "cryoRack" character varying(50),
                "cryoTube" character varying(50),
                "isAvailable" boolean NOT NULL DEFAULT true,
                "cryopreservationDate" TIMESTAMP,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_cryopreserved_semen" PRIMARY KEY ("id")
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "cryopreserved_semen"`);
    }

}

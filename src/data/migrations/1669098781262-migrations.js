const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class migrations1669098781262 {
    name = 'migrations1669098781262'

    async up(queryRunner) {
        await queryRunner.query(`
            CREATE TABLE "zeroex_post" (
                "id" SERIAL NOT NULL,
                "image" character varying,
                "wallet_address" character varying NOT NULL,
                "price" numeric(4, 8) NOT NULL,
                "collection_name" character varying NOT NULL,
                "signed_object" character varying NOT NULL,
                "creation_date" TIMESTAMP NOT NULL DEFAULT now(),
                "update_date" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_5e6afd4a15db8cfb4b87b955085" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "post"
            ADD "type" integer NOT NULL DEFAULT '0'
        `);
        await queryRunner.query(`
            ALTER TABLE "post"
            ADD "zero_ex_post_id" integer
        `);
        await queryRunner.query(`
            ALTER TABLE "post"
            ADD CONSTRAINT "UQ_ff216f588daa0d5c9d04c38db08" UNIQUE ("zero_ex_post_id")
        `);
        await queryRunner.query(`
            ALTER TABLE "post"
            ADD CONSTRAINT "FK_ff216f588daa0d5c9d04c38db08" FOREIGN KEY ("zero_ex_post_id") REFERENCES "zeroex_post"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    async down(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "post" DROP CONSTRAINT "FK_ff216f588daa0d5c9d04c38db08"
        `);
        await queryRunner.query(`
            ALTER TABLE "post" DROP CONSTRAINT "UQ_ff216f588daa0d5c9d04c38db08"
        `);
        await queryRunner.query(`
            ALTER TABLE "post" DROP COLUMN "zero_ex_post_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "post" DROP COLUMN "type"
        `);
        await queryRunner.query(`
            DROP TABLE "zeroex_post"
        `);
    }
}

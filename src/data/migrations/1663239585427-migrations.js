const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class migrations1663239585427 {
    name = 'migrations1663239585427'

    async up(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "processed_blocks"
            ADD "blockchain_type" integer NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "users"
            ADD "has_lens_profile" boolean NOT NULL DEFAULT false
        `);
        await queryRunner.query(`
            ALTER TABLE "token_transfers_content"
            ADD "blockchain_type" integer NOT NULL DEFAULT '0'
        `);
    }

    async down(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "token_transfers_content" DROP COLUMN "blockchain_type"
        `);
        await queryRunner.query(`
            ALTER TABLE "users" DROP COLUMN "has_lens_profile"
        `);
        await queryRunner.query(`
            ALTER TABLE "processed_blocks" DROP COLUMN "blockchain_type"
        `);
    }
}

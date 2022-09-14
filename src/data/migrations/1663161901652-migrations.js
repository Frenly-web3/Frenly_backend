const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class migrations1663161901652 {
    name = 'migrations1663161901652'

    async up(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "token_transfers_content"
            ADD "status" integer NOT NULL DEFAULT '1'
        `);
        await queryRunner.query(`
            ALTER TABLE "token_transfers_content"
            ADD "is_removed" boolean NOT NULL DEFAULT false
        `);
    }

    async down(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "token_transfers_content" DROP COLUMN "is_removed"
        `);
        await queryRunner.query(`
            ALTER TABLE "token_transfers_content" DROP COLUMN "status"
        `);
    }
}

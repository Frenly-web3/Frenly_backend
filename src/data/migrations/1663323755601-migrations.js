const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class migrations1663323755601 {
    name = 'migrations1663323755601'

    async up(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "token_transfers_content"
            ADD "lens_id" character varying
        `);
    }

    async down(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "token_transfers_content" DROP COLUMN "lens_id"
        `);
    }
}

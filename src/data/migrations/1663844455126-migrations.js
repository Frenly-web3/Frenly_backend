const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class migrations1663844455126 {
    name = 'migrations1663844455126'

    async up(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "token_transfers_content"
            ADD "image" character varying
        `);
    }

    async down(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "token_transfers_content" DROP COLUMN "image"
        `);
    }
}

const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class migrations1662985087133 {
    name = 'migrations1662985087133'

    async up(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "token_transfers_content"
            ADD "metadata_URI" character varying
        `);
    }

    async down(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "token_transfers_content" DROP COLUMN "metadata_URI"
        `);
    }
}

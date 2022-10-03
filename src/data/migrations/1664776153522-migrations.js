const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class migrations1664776153522 {
    name = 'migrations1664776153522'

    async up(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "token_transfers_content"
            ADD "is_mirror" boolean NOT NULL DEFAULT false
        `);
    }

    async down(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "token_transfers_content" DROP COLUMN "is_mirror"
        `);
    }
}

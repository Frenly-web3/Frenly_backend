const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class migrations1665404576665 {
    name = 'migrations1665404576665'

    async up(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "users"
            ADD "username" character varying
        `);
        await queryRunner.query(`
            ALTER TABLE "users"
            ADD "description" character varying
        `);
    }

    async down(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "users" DROP COLUMN "description"
        `);
        await queryRunner.query(`
            ALTER TABLE "users" DROP COLUMN "username"
        `);
    }
}

const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class migrations1665403070314 {
    name = 'migrations1665403070314'

    async up(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "users"
            ADD "avatar" character varying
        `);
    }

    async down(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "users" DROP COLUMN "avatar"
        `);
    }
}

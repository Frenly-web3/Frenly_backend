const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class migrations1664966615059 {
    name = 'migrations1664966615059'

    async up(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "users"
            ADD "role" integer NOT NULL DEFAULT '0'
        `);
    }

    async down(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "users" DROP COLUMN "role"
        `);
    }
}

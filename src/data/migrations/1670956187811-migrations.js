const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class migrations1670956187811 {
    name = 'migrations1670956187811'

    async up(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "community"
            ADD "description" character varying NOT NULL
        `);
    }

    async down(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "community" DROP COLUMN "description"
        `);
    }
}

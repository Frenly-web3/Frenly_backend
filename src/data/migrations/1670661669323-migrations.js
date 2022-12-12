const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class migrations1670661669323 {
    name = 'migrations1670661669323'

    async up(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "community"
            ADD "creation_date" TIMESTAMP NOT NULL DEFAULT now()
        `);
        await queryRunner.query(`
            ALTER TABLE "community"
            ADD "update_date" TIMESTAMP NOT NULL DEFAULT now()
        `);
    }

    async down(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "community" DROP COLUMN "update_date"
        `);
        await queryRunner.query(`
            ALTER TABLE "community" DROP COLUMN "creation_date"
        `);
    }
}

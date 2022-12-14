const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class migrations1670958895012 {
    name = 'migrations1670958895012'

    async up(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "community"
            ADD "image" character varying
        `);
    }

    async down(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "community" DROP COLUMN "image"
        `);
    }
}

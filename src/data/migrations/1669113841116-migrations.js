const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class migrations1669113841116 {
    name = 'migrations1669113841116'

    async up(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "zeroex_post"
            ALTER COLUMN "price" TYPE numeric
        `);
    }

    async down(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "zeroex_post"
            ALTER COLUMN "price" TYPE numeric(4, 8)
        `);
    }
}

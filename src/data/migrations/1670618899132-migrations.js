const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class migrations1670618899132 {
    name = 'migrations1670618899132'

    async up(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "community"
            ALTER COLUMN "name"
            SET NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "community"
            ALTER COLUMN "contract_address"
            SET NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "community"
            ADD CONSTRAINT "UQ_400fbb0a9afd42bb81ec5570f18" UNIQUE ("contract_address")
        `);
    }

    async down(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "community" DROP CONSTRAINT "UQ_400fbb0a9afd42bb81ec5570f18"
        `);
        await queryRunner.query(`
            ALTER TABLE "community"
            ALTER COLUMN "contract_address" DROP NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "community"
            ALTER COLUMN "name" DROP NOT NULL
        `);
    }
}

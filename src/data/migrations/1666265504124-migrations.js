const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class migrations1666265504124 {
    name = 'migrations1666265504124'

    async up(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "nft_token_post"
            ADD "mirror_description" character varying
        `);
    }

    async down(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "nft_token_post" DROP COLUMN "mirror_description"
        `);
    }
}

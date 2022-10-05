const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class migrations1664965310507 {
    name = 'migrations1664965310507'

    async up(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "users"
                RENAME COLUMN "is_registered" TO "has_lens_profile"
        `);
        await queryRunner.query(`
            ALTER TABLE "nft_token_post"
            ADD "lens_id" character varying
        `);
        await queryRunner.query(`
            ALTER TABLE "nft_token_post"
            ADD "is_mirror" boolean NOT NULL DEFAULT false
        `);
    }

    async down(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "nft_token_post" DROP COLUMN "is_mirror"
        `);
        await queryRunner.query(`
            ALTER TABLE "nft_token_post" DROP COLUMN "lens_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "users"
                RENAME COLUMN "has_lens_profile" TO "is_registered"
        `);
    }
}

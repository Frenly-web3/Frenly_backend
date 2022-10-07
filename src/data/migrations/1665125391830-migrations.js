const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class migrations1665125391830 {
    name = 'migrations1665125391830'

    async up(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "nft_metadata"
            ALTER COLUMN "metadata_uri" DROP NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "nft_metadata"
            ALTER COLUMN "image" DROP NOT NULL
        `);
    }

    async down(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "nft_metadata"
            ALTER COLUMN "image"
            SET NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "nft_metadata"
            ALTER COLUMN "metadata_uri"
            SET NOT NULL
        `);
    }
}

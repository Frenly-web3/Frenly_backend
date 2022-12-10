const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class migrations1670676358305 {
    name = 'migrations1670676358305'

    async up(queryRunner) {
        await queryRunner.query(`
            CREATE TABLE "users_communities_member_community" (
                "usersId" integer NOT NULL,
                "communityId" integer NOT NULL,
                CONSTRAINT "PK_017e5083a978a0560dd38079ec9" PRIMARY KEY ("usersId", "communityId")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_e295aaf1c05b1ff13e693ed265" ON "users_communities_member_community" ("usersId")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_ed3f8dc94b2016816441cff453" ON "users_communities_member_community" ("communityId")
        `);
        await queryRunner.query(`
            ALTER TABLE "users_communities_member_community"
            ADD CONSTRAINT "FK_e295aaf1c05b1ff13e693ed2652" FOREIGN KEY ("usersId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
        await queryRunner.query(`
            ALTER TABLE "users_communities_member_community"
            ADD CONSTRAINT "FK_ed3f8dc94b2016816441cff453d" FOREIGN KEY ("communityId") REFERENCES "community"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    async down(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "users_communities_member_community" DROP CONSTRAINT "FK_ed3f8dc94b2016816441cff453d"
        `);
        await queryRunner.query(`
            ALTER TABLE "users_communities_member_community" DROP CONSTRAINT "FK_e295aaf1c05b1ff13e693ed2652"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_ed3f8dc94b2016816441cff453"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_e295aaf1c05b1ff13e693ed265"
        `);
        await queryRunner.query(`
            DROP TABLE "users_communities_member_community"
        `);
    }
}

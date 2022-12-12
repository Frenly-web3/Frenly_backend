const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class migrations1670614045828 {
    name = 'migrations1670614045828'

    async up(queryRunner) {
        await queryRunner.query(`
            CREATE TABLE "community" (
                "id" SERIAL NOT NULL,
                "name" character varying,
                "contract_address" character varying,
                "creatorId" integer,
                CONSTRAINT "PK_cae794115a383328e8923de4193" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "community_members_users" (
                "communityId" integer NOT NULL,
                "usersId" integer NOT NULL,
                CONSTRAINT "PK_6a91ba9121810b6a34e02cf1da6" PRIMARY KEY ("communityId", "usersId")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_3e8eb0e5abdecc0b12bb5b2f4d" ON "community_members_users" ("communityId")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_68027a4399e1360c0114a886ca" ON "community_members_users" ("usersId")
        `);
        await queryRunner.query(`
            ALTER TABLE "community"
            ADD CONSTRAINT "FK_c380bb9e8e9434758231a0ad922" FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "community_members_users"
            ADD CONSTRAINT "FK_3e8eb0e5abdecc0b12bb5b2f4d5" FOREIGN KEY ("communityId") REFERENCES "community"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
        await queryRunner.query(`
            ALTER TABLE "community_members_users"
            ADD CONSTRAINT "FK_68027a4399e1360c0114a886ca9" FOREIGN KEY ("usersId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
    }

    async down(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "community_members_users" DROP CONSTRAINT "FK_68027a4399e1360c0114a886ca9"
        `);
        await queryRunner.query(`
            ALTER TABLE "community_members_users" DROP CONSTRAINT "FK_3e8eb0e5abdecc0b12bb5b2f4d5"
        `);
        await queryRunner.query(`
            ALTER TABLE "community" DROP CONSTRAINT "FK_c380bb9e8e9434758231a0ad922"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_68027a4399e1360c0114a886ca"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_3e8eb0e5abdecc0b12bb5b2f4d"
        `);
        await queryRunner.query(`
            DROP TABLE "community_members_users"
        `);
        await queryRunner.query(`
            DROP TABLE "community"
        `);
    }
}

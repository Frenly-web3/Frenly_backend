const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class migrations1670942562224 {
    name = 'migrations1670942562224'

    async up(queryRunner) {
        await queryRunner.query(`
            CREATE TABLE "comment" (
                "id" SERIAL NOT NULL,
                "description" character varying NOT NULL,
                "creation_date" TIMESTAMP NOT NULL DEFAULT now(),
                "update_date" TIMESTAMP NOT NULL DEFAULT now(),
                "creatorId" integer,
                "postId" integer,
                CONSTRAINT "PK_0b0e4bbc8415ec426f87f3a88e2" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "post_likes_users" (
                "postId" integer NOT NULL,
                "usersId" integer NOT NULL,
                CONSTRAINT "PK_a36a67a784bc8eb725fa998bab2" PRIMARY KEY ("postId", "usersId")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_879c8ea4691cb1bcfa756da66f" ON "post_likes_users" ("postId")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_a4df4b3e4af054986d1401a3c1" ON "post_likes_users" ("usersId")
        `);
        await queryRunner.query(`
            ALTER TABLE "comment"
            ADD CONSTRAINT "FK_b6bf60ecb9f6c398e349adff52f" FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "comment"
            ADD CONSTRAINT "FK_94a85bb16d24033a2afdd5df060" FOREIGN KEY ("postId") REFERENCES "post"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "post_likes_users"
            ADD CONSTRAINT "FK_879c8ea4691cb1bcfa756da66fb" FOREIGN KEY ("postId") REFERENCES "post"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
        await queryRunner.query(`
            ALTER TABLE "post_likes_users"
            ADD CONSTRAINT "FK_a4df4b3e4af054986d1401a3c1e" FOREIGN KEY ("usersId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
    }

    async down(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "post_likes_users" DROP CONSTRAINT "FK_a4df4b3e4af054986d1401a3c1e"
        `);
        await queryRunner.query(`
            ALTER TABLE "post_likes_users" DROP CONSTRAINT "FK_879c8ea4691cb1bcfa756da66fb"
        `);
        await queryRunner.query(`
            ALTER TABLE "comment" DROP CONSTRAINT "FK_94a85bb16d24033a2afdd5df060"
        `);
        await queryRunner.query(`
            ALTER TABLE "comment" DROP CONSTRAINT "FK_b6bf60ecb9f6c398e349adff52f"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_a4df4b3e4af054986d1401a3c1"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_879c8ea4691cb1bcfa756da66f"
        `);
        await queryRunner.query(`
            DROP TABLE "post_likes_users"
        `);
        await queryRunner.query(`
            DROP TABLE "comment"
        `);
    }
}

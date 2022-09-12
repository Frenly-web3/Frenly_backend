const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class migrations1662715564186 {
    name = 'migrations1662715564186'

    async up(queryRunner) {
        await queryRunner.query(`
            CREATE TABLE "processed_blocks" (
                "id" SERIAL NOT NULL,
                "block_number" integer NOT NULL,
                "timestamp" TIMESTAMP NOT NULL,
                CONSTRAINT "PK_44f50a9c605aa191aee292a2a84" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "user_content" (
                "id" SERIAL NOT NULL,
                "child_entity_id" integer NOT NULL,
                "child_entity_type" integer NOT NULL,
                "creation_date" TIMESTAMP NOT NULL DEFAULT now(),
                "update_date" TIMESTAMP NOT NULL DEFAULT now(),
                "ownerId" integer,
                CONSTRAINT "PK_cbcf43446e66a56d902c17b26a3" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "users" (
                "id" SERIAL NOT NULL,
                "nonce" integer,
                "wallet_address" character varying NOT NULL,
                "on_creation_block_number" integer NOT NULL,
                "creation_date" TIMESTAMP NOT NULL DEFAULT now(),
                "update_date" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "refresh_tokens" (
                "token_id" character varying NOT NULL,
                "jwt_id" character varying NOT NULL,
                "creation_date" TIMESTAMP NOT NULL DEFAULT now(),
                "expiry_date" TIMESTAMP NOT NULL,
                "is_used" boolean NOT NULL DEFAULT false,
                "is_invalidated" boolean NOT NULL DEFAULT false,
                "userId" integer,
                CONSTRAINT "PK_b4bffc4033b7bd52e241210710c" PRIMARY KEY ("token_id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "subscriptions" (
                "id" SERIAL NOT NULL,
                "creation_date" TIMESTAMP NOT NULL DEFAULT now(),
                "update_date" TIMESTAMP NOT NULL DEFAULT now(),
                "respondentId" integer,
                "subscriberId" integer,
                CONSTRAINT "PK_a87248d73155605cf782be9ee5e" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "token_transfers_content" (
                "id" SERIAL NOT NULL,
                "transaction_hash" character varying NOT NULL,
                "from_address" character varying NOT NULL,
                "to_address" character varying NOT NULL,
                "smart_contract_address" character varying NOT NULL,
                "token_id" character varying NOT NULL,
                "token_type" integer NOT NULL,
                "block_number" integer NOT NULL,
                CONSTRAINT "PK_8fc7a3b26e700badd0e198f446d" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "user_content"
            ADD CONSTRAINT "FK_564d52d6bd318791383aaade327" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "refresh_tokens"
            ADD CONSTRAINT "FK_610102b60fea1455310ccd299de" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "subscriptions"
            ADD CONSTRAINT "FK_449e5b51cd81db0bc8696cddf25" FOREIGN KEY ("respondentId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "subscriptions"
            ADD CONSTRAINT "FK_61d51ff73ec5afd7dc7c6c84309" FOREIGN KEY ("subscriberId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    async down(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "subscriptions" DROP CONSTRAINT "FK_61d51ff73ec5afd7dc7c6c84309"
        `);
        await queryRunner.query(`
            ALTER TABLE "subscriptions" DROP CONSTRAINT "FK_449e5b51cd81db0bc8696cddf25"
        `);
        await queryRunner.query(`
            ALTER TABLE "refresh_tokens" DROP CONSTRAINT "FK_610102b60fea1455310ccd299de"
        `);
        await queryRunner.query(`
            ALTER TABLE "user_content" DROP CONSTRAINT "FK_564d52d6bd318791383aaade327"
        `);
        await queryRunner.query(`
            DROP TABLE "token_transfers_content"
        `);
        await queryRunner.query(`
            DROP TABLE "subscriptions"
        `);
        await queryRunner.query(`
            DROP TABLE "refresh_tokens"
        `);
        await queryRunner.query(`
            DROP TABLE "users"
        `);
        await queryRunner.query(`
            DROP TABLE "user_content"
        `);
        await queryRunner.query(`
            DROP TABLE "processed_blocks"
        `);
    }
}

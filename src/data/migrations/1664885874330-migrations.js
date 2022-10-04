const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class migrations1664885874330 {
    name = 'migrations1664885874330'

    async up(queryRunner) {
        await queryRunner.query(`
            CREATE TABLE "likes" (
                "id" SERIAL NOT NULL,
                "postId" integer,
                "ownerId" integer,
                CONSTRAINT "PK_a9323de3f8bced7539a794b4a37" PRIMARY KEY ("id")
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
            CREATE TABLE "users" (
                "id" SERIAL NOT NULL,
                "nonce" integer,
                "wallet_address" character varying NOT NULL,
                "is_registered" boolean NOT NULL DEFAULT false,
                "creation_date" TIMESTAMP NOT NULL DEFAULT now(),
                "update_date" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "nft_metadata" (
                "id" SERIAL NOT NULL,
                "metadata_uri" character varying NOT NULL,
                "image" character varying NOT NULL,
                "blockchain_type" integer NOT NULL,
                "token_type" integer NOT NULL,
                "transfer_id" integer,
                CONSTRAINT "REL_25ab3868c7848e4d059f80cbb9" UNIQUE ("transfer_id"),
                CONSTRAINT "PK_c36d2ea36d7de5e265c30b8be80" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "nft_token_post" (
                "id" SERIAL NOT NULL,
                "tx_hash" character varying NOT NULL,
                "token_id" character varying NOT NULL,
                "from_address" character varying NOT NULL,
                "to_address" character varying NOT NULL,
                "sc_address" character varying NOT NULL,
                "block_number" integer NOT NULL,
                CONSTRAINT "PK_c7a8d981b5fe19065ced858130e" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "post" (
                "id" SERIAL NOT NULL,
                "status" integer NOT NULL DEFAULT '2',
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "update_date" TIMESTAMP NOT NULL DEFAULT now(),
                "ownerId" integer,
                "post_id" integer,
                "originalPostId" integer,
                CONSTRAINT "REL_4d093caee4d33b2745c7d05a41" UNIQUE ("post_id"),
                CONSTRAINT "PK_be5fda3aac270b134ff9c21cdee" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "comments" (
                "id" SERIAL NOT NULL,
                "text" character varying NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "postId" integer,
                "ownerId" integer,
                CONSTRAINT "PK_8bf68bc960f2b69e818bdb90dcb" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "processed_blocks" (
                "id" SERIAL NOT NULL,
                "block_number" integer NOT NULL,
                "blockchain_type" integer NOT NULL,
                "timestamp" TIMESTAMP NOT NULL,
                CONSTRAINT "PK_44f50a9c605aa191aee292a2a84" PRIMARY KEY ("id")
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
            ALTER TABLE "likes"
            ADD CONSTRAINT "FK_e2fe567ad8d305fefc918d44f50" FOREIGN KEY ("postId") REFERENCES "post"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "likes"
            ADD CONSTRAINT "FK_7a5016239762187b70892ad77da" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "refresh_tokens"
            ADD CONSTRAINT "FK_610102b60fea1455310ccd299de" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "nft_metadata"
            ADD CONSTRAINT "FK_25ab3868c7848e4d059f80cbb9e" FOREIGN KEY ("transfer_id") REFERENCES "nft_token_post"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "post"
            ADD CONSTRAINT "FK_4490d00e1925ca046a1f52ddf04" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "post"
            ADD CONSTRAINT "FK_4d093caee4d33b2745c7d05a41d" FOREIGN KEY ("post_id") REFERENCES "nft_token_post"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "post"
            ADD CONSTRAINT "FK_3af42338c5591886a6ddc76d141" FOREIGN KEY ("originalPostId") REFERENCES "post"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "comments"
            ADD CONSTRAINT "FK_e44ddaaa6d058cb4092f83ad61f" FOREIGN KEY ("postId") REFERENCES "post"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "comments"
            ADD CONSTRAINT "FK_c3e176b501c43e0f48a04f58c0e" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
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
            ALTER TABLE "comments" DROP CONSTRAINT "FK_c3e176b501c43e0f48a04f58c0e"
        `);
        await queryRunner.query(`
            ALTER TABLE "comments" DROP CONSTRAINT "FK_e44ddaaa6d058cb4092f83ad61f"
        `);
        await queryRunner.query(`
            ALTER TABLE "post" DROP CONSTRAINT "FK_3af42338c5591886a6ddc76d141"
        `);
        await queryRunner.query(`
            ALTER TABLE "post" DROP CONSTRAINT "FK_4d093caee4d33b2745c7d05a41d"
        `);
        await queryRunner.query(`
            ALTER TABLE "post" DROP CONSTRAINT "FK_4490d00e1925ca046a1f52ddf04"
        `);
        await queryRunner.query(`
            ALTER TABLE "nft_metadata" DROP CONSTRAINT "FK_25ab3868c7848e4d059f80cbb9e"
        `);
        await queryRunner.query(`
            ALTER TABLE "refresh_tokens" DROP CONSTRAINT "FK_610102b60fea1455310ccd299de"
        `);
        await queryRunner.query(`
            ALTER TABLE "likes" DROP CONSTRAINT "FK_7a5016239762187b70892ad77da"
        `);
        await queryRunner.query(`
            ALTER TABLE "likes" DROP CONSTRAINT "FK_e2fe567ad8d305fefc918d44f50"
        `);
        await queryRunner.query(`
            DROP TABLE "subscriptions"
        `);
        await queryRunner.query(`
            DROP TABLE "processed_blocks"
        `);
        await queryRunner.query(`
            DROP TABLE "comments"
        `);
        await queryRunner.query(`
            DROP TABLE "post"
        `);
        await queryRunner.query(`
            DROP TABLE "nft_token_post"
        `);
        await queryRunner.query(`
            DROP TABLE "nft_metadata"
        `);
        await queryRunner.query(`
            DROP TABLE "users"
        `);
        await queryRunner.query(`
            DROP TABLE "refresh_tokens"
        `);
        await queryRunner.query(`
            DROP TABLE "likes"
        `);
    }
}

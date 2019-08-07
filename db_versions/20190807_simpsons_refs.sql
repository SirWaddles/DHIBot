BEGIN TRANSACTION;
DROP INDEX "unique_markov_refs";
ALTER TABLE "markov_refs" ADD COLUMN "markov_db" TEXT NOT NULL DEFAULT "dhimarkov";
CREATE UNIQUE INDEX IF NOT EXISTS "unique_markov_refs" ON "markov_refs" (
	"markov_msg_id",
	"ref_msg_id",
	"markov_db"
);
COMMIT;

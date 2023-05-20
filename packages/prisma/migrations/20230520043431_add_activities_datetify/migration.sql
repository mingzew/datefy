-- CreateTable
CREATE TABLE "Activity_Datetify" (
    "id" SERIAL NOT NULL,
    "data" JSONB,
    "type" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Activity_Datetify_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_activity_datetify_eventtype" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_user_activity_datetify" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_activity_datetify_eventtype_AB_unique" ON "_activity_datetify_eventtype"("A", "B");

-- CreateIndex
CREATE INDEX "_activity_datetify_eventtype_B_index" ON "_activity_datetify_eventtype"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_user_activity_datetify_AB_unique" ON "_user_activity_datetify"("A", "B");

-- CreateIndex
CREATE INDEX "_user_activity_datetify_B_index" ON "_user_activity_datetify"("B");

-- AddForeignKey
ALTER TABLE "_activity_datetify_eventtype" ADD CONSTRAINT "_activity_datetify_eventtype_A_fkey" FOREIGN KEY ("A") REFERENCES "Activity_Datetify"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_activity_datetify_eventtype" ADD CONSTRAINT "_activity_datetify_eventtype_B_fkey" FOREIGN KEY ("B") REFERENCES "EventType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_user_activity_datetify" ADD CONSTRAINT "_user_activity_datetify_A_fkey" FOREIGN KEY ("A") REFERENCES "Activity_Datetify"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_user_activity_datetify" ADD CONSTRAINT "_user_activity_datetify_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

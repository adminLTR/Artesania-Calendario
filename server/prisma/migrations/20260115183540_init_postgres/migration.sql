-- CreateEnum
CREATE TYPE "StudentStatus" AS ENUM ('regular', 'needs_renewal', 'new');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('none', 'present', 'absent');

-- CreateEnum
CREATE TYPE "AttendanceType" AS ENUM ('present', 'absent');

-- CreateEnum
CREATE TYPE "PieceStatus" AS ENUM ('creada', 'en_secado', 'bizcochada', 'esmaltada', 'cocida_final', 'concluida');

-- CreateEnum
CREATE TYPE "GiftCardType" AS ENUM ('modelado', 'torno');

-- CreateTable
CREATE TABLE "students" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(50) NOT NULL,
    "classesRemaining" INTEGER NOT NULL DEFAULT 0,
    "status" "StudentStatus" NOT NULL DEFAULT 'new',
    "paymentMethod" VARCHAR(100),
    "notes" TEXT,
    "price" DECIMAL(10,2),
    "classType" VARCHAR(100),
    "expiryDate" DATE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assigned_classes" (
    "id" SERIAL NOT NULL,
    "studentId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "startTime" VARCHAR(10) NOT NULL,
    "endTime" VARCHAR(10) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "assigned_classes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "class_sessions" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "startTime" VARCHAR(10) NOT NULL,
    "endTime" VARCHAR(10) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "class_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_students" (
    "id" SERIAL NOT NULL,
    "sessionId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "studentName" VARCHAR(255) NOT NULL,
    "attendanceStatus" "AttendanceStatus" NOT NULL DEFAULT 'none',

    CONSTRAINT "session_students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance_history" (
    "id" SERIAL NOT NULL,
    "studentId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "status" "AttendanceType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attendance_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ceramic_pieces" (
    "id" TEXT NOT NULL,
    "alumnoId" TEXT,
    "owner" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "status" "PieceStatus" NOT NULL DEFAULT 'creada',
    "fechaCreacion" DATE NOT NULL,
    "fechaConclusion" DATE,
    "glazeType" VARCHAR(100),
    "deliveryDate" DATE,
    "notes" TEXT,
    "extraCommentary" TEXT,
    "tecnica" VARCHAR(100),
    "hornoId" VARCHAR(100),
    "lote" VARCHAR(100),
    "foto" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ceramic_pieces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clients" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(50),
    "email" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gift_cards" (
    "id" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "numClasses" INTEGER NOT NULL,
    "type" "GiftCardType" NOT NULL,
    "scheduledDate" DATE,
    "createdAtGift" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "extraCommentary" TEXT,

    CONSTRAINT "gift_cards_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "students_status_idx" ON "students"("status");

-- CreateIndex
CREATE INDEX "students_name_idx" ON "students"("name");

-- CreateIndex
CREATE INDEX "assigned_classes_studentId_idx" ON "assigned_classes"("studentId");

-- CreateIndex
CREATE INDEX "assigned_classes_date_idx" ON "assigned_classes"("date");

-- CreateIndex
CREATE INDEX "class_sessions_date_idx" ON "class_sessions"("date");

-- CreateIndex
CREATE INDEX "session_students_sessionId_idx" ON "session_students"("sessionId");

-- CreateIndex
CREATE INDEX "session_students_studentId_idx" ON "session_students"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "session_students_sessionId_studentId_key" ON "session_students"("sessionId", "studentId");

-- CreateIndex
CREATE INDEX "attendance_history_studentId_idx" ON "attendance_history"("studentId");

-- CreateIndex
CREATE INDEX "attendance_history_date_idx" ON "attendance_history"("date");

-- CreateIndex
CREATE UNIQUE INDEX "attendance_history_studentId_sessionId_key" ON "attendance_history"("studentId", "sessionId");

-- CreateIndex
CREATE INDEX "ceramic_pieces_alumnoId_idx" ON "ceramic_pieces"("alumnoId");

-- CreateIndex
CREATE INDEX "ceramic_pieces_status_idx" ON "ceramic_pieces"("status");

-- CreateIndex
CREATE INDEX "clients_name_idx" ON "clients"("name");

-- CreateIndex
CREATE INDEX "gift_cards_type_idx" ON "gift_cards"("type");

-- CreateIndex
CREATE INDEX "gift_cards_buyerId_idx" ON "gift_cards"("buyerId");

-- CreateIndex
CREATE INDEX "gift_cards_recipientId_idx" ON "gift_cards"("recipientId");

-- AddForeignKey
ALTER TABLE "assigned_classes" ADD CONSTRAINT "assigned_classes_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_students" ADD CONSTRAINT "session_students_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "class_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_students" ADD CONSTRAINT "session_students_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_history" ADD CONSTRAINT "attendance_history_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_history" ADD CONSTRAINT "attendance_history_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "class_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ceramic_pieces" ADD CONSTRAINT "ceramic_pieces_alumnoId_fkey" FOREIGN KEY ("alumnoId") REFERENCES "students"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gift_cards" ADD CONSTRAINT "gift_cards_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gift_cards" ADD CONSTRAINT "gift_cards_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

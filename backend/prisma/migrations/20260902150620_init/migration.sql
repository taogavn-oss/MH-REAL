-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "PublishStatus" AS ENUM ('draft', 'published', 'unpublished');

-- CreateEnum
CREATE TYPE "RequirementChannel" AS ENUM ('web', 'other_media');

-- CreateEnum
CREATE TYPE "RequirementStatus" AS ENUM ('draft', 'pending_am', 'approved_am', 'pending_hq', 'approved_hq', 'rejected');

-- CreateEnum
CREATE TYPE "ApprovalActionType" AS ENUM ('submit', 'approve', 'reject');

-- CreateEnum
CREATE TYPE "CandidateStatus" AS ENUM ('received', 'survey_sent', 'survey_completed', 'no_response', 'passed', 'failed', 'interview_scheduled', 'interview_completed', 'cancelled', 'interview_adjustment_needed');

-- CreateEnum
CREATE TYPE "InterviewType" AS ENUM ('web', 'onsite');

-- CreateEnum
CREATE TYPE "SlotStatus" AS ENUM ('open', 'booked', 'closed');

-- CreateEnum
CREATE TYPE "ScheduleStatus" AS ENUM ('scheduled', 'changed', 'cancelled', 'completed');

-- CreateEnum
CREATE TYPE "NotificationRecipient" AS ENUM ('candidate', 'internal_user');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('sms', 'email');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('scheduled', 'sent', 'failed');

-- CreateEnum
CREATE TYPE "RikuOpDirection" AS ENUM ('inbound', 'outbound');

-- CreateEnum
CREATE TYPE "RikuOpStatus" AS ENUM ('success', 'failed');

-- CreateEnum
CREATE TYPE "MasterImportType" AS ENUM ('area', 'store', 'sm', 'sub_sm', 'am');

-- CreateTable
CREATE TABLE "roles" (
    "id" UUID NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "employee_code" VARCHAR(50) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "full_name" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(20),
    "role_id" UUID NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'active',
    "last_login_at" TIMESTAMPTZ,
    "created_by" UUID,
    "updated_by" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "actor_id" UUID,
    "actor_role" VARCHAR(20),
    "action" VARCHAR(50) NOT NULL,
    "entity_type" VARCHAR(100) NOT NULL,
    "entity_id" VARCHAR(100),
    "before_data" JSONB,
    "after_data" JSONB,
    "ip_address" VARCHAR(45),
    "user_agent" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "areas" (
    "id" UUID NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "block" VARCHAR(100),
    "created_by" UUID,
    "updated_by" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "areas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stores" (
    "id" UUID NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "area_id" UUID NOT NULL,
    "prefecture" VARCHAR(100),
    "address" TEXT,
    "allow_car_commute" BOOLEAN NOT NULL DEFAULT true,
    "publish_status" "PublishStatus" NOT NULL,
    "created_by" UUID,
    "updated_by" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "stores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "area_manager_assignments" (
    "id" UUID NOT NULL,
    "area_id" UUID NOT NULL,
    "am_user_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "area_manager_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "store_manager_assignments" (
    "id" UUID NOT NULL,
    "store_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "is_primary" BOOLEAN NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "store_manager_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "master_data_import_logs" (
    "id" UUID NOT NULL,
    "import_type" "MasterImportType" NOT NULL,
    "file_name" VARCHAR(255) NOT NULL,
    "imported_by" UUID NOT NULL,
    "total_rows" INTEGER NOT NULL,
    "success_rows" INTEGER NOT NULL,
    "failed_rows" INTEGER NOT NULL,
    "error_detail" JSONB,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "master_data_import_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_requirements" (
    "id" UUID NOT NULL,
    "store_id" UUID NOT NULL,
    "channel" "RequirementChannel" NOT NULL,
    "status" "RequirementStatus" NOT NULL,
    "current_version_id" UUID,
    "published_version_id" UUID,
    "created_by" UUID,
    "updated_by" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "job_requirements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_requirement_versions" (
    "id" UUID NOT NULL,
    "job_requirement_id" UUID NOT NULL,
    "version_no" INTEGER NOT NULL,
    "payload" JSONB NOT NULL,
    "submitted_by" UUID,
    "submitted_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "job_requirement_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "approval_actions" (
    "id" UUID NOT NULL,
    "job_requirement_version_id" UUID NOT NULL,
    "actor_id" UUID NOT NULL,
    "action" "ApprovalActionType" NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "approval_actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blacklist_entries" (
    "id" UUID NOT NULL,
    "full_name" VARCHAR(255),
    "phone" VARCHAR(20),
    "email" VARCHAR(255),
    "reason" TEXT,
    "created_by" UUID,
    "updated_by" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "blacklist_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidates" (
    "id" UUID NOT NULL,
    "rikuop_candidate_id" VARCHAR(100),
    "full_name" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(20),
    "email" VARCHAR(255),
    "store_id" UUID,
    "status" "CandidateStatus" NOT NULL,
    "is_duplicate" BOOLEAN NOT NULL DEFAULT false,
    "is_blacklisted" BOOLEAN NOT NULL DEFAULT false,
    "source" VARCHAR(50),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "candidates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidate_survey_tokens" (
    "id" UUID NOT NULL,
    "candidate_id" UUID NOT NULL,
    "token_hash" VARCHAR(255) NOT NULL,
    "expires_at" TIMESTAMPTZ NOT NULL,
    "used_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "candidate_survey_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidate_survey_responses" (
    "id" UUID NOT NULL,
    "candidate_id" UUID NOT NULL,
    "desired_store_ids" JSONB NOT NULL,
    "experience" TEXT,
    "desired_working_hours" JSONB,
    "desired_period" VARCHAR(100),
    "desired_days_per_week" VARCHAR(50),
    "other_conditions" TEXT,
    "event_work" BOOLEAN NOT NULL DEFAULT false,
    "contact_available_days" JSONB,
    "contact_available_time" JSONB,
    "car_commute_note" TEXT,
    "interview_type" "InterviewType" NOT NULL,
    "preferred_dates" JSONB NOT NULL,
    "submitted_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "candidate_survey_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interview_slots" (
    "id" UUID NOT NULL,
    "store_id" UUID NOT NULL,
    "sm_user_id" UUID NOT NULL,
    "slot_date" DATE NOT NULL,
    "start_time" TIME NOT NULL,
    "end_time" TIME NOT NULL,
    "status" "SlotStatus" NOT NULL,
    "note" TEXT,
    "version" INTEGER NOT NULL,
    "created_by" UUID,
    "updated_by" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "interview_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interview_schedules" (
    "id" UUID NOT NULL,
    "candidate_id" UUID NOT NULL,
    "slot_id" UUID NOT NULL,
    "store_id" UUID NOT NULL,
    "status" "ScheduleStatus" NOT NULL,
    "interview_type" "InterviewType" NOT NULL,
    "location_info" JSONB,
    "reminder_sent_at" TIMESTAMPTZ,
    "created_by" UUID,
    "updated_by" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "interview_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL,
    "recipient_type" "NotificationRecipient" NOT NULL,
    "recipient_id" UUID NOT NULL,
    "channel" "NotificationChannel" NOT NULL,
    "template_code" VARCHAR(100) NOT NULL,
    "payload" JSONB,
    "status" "NotificationStatus" NOT NULL,
    "idempotency_key" VARCHAR(255) NOT NULL,
    "scheduled_at" TIMESTAMPTZ NOT NULL,
    "sent_at" TIMESTAMPTZ,
    "retry_count" INTEGER NOT NULL DEFAULT 0,
    "error_message" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rikuop_sync_logs" (
    "id" UUID NOT NULL,
    "direction" "RikuOpDirection" NOT NULL,
    "entity_type" VARCHAR(50) NOT NULL,
    "entity_id" VARCHAR(100),
    "request_payload" JSONB,
    "response_payload" JSONB,
    "status" "RikuOpStatus" NOT NULL,
    "error_message" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rikuop_sync_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "roles_code_key" ON "roles"("code");

-- CreateIndex
CREATE UNIQUE INDEX "users_employee_code_key" ON "users"("employee_code");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "areas_code_key" ON "areas"("code");

-- CreateIndex
CREATE UNIQUE INDEX "stores_code_key" ON "stores"("code");

-- CreateIndex
CREATE UNIQUE INDEX "area_manager_assignments_area_id_am_user_id_key" ON "area_manager_assignments"("area_id", "am_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "store_manager_assignments_store_id_user_id_key" ON "store_manager_assignments"("store_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "job_requirements_store_id_channel_key" ON "job_requirements"("store_id", "channel");

-- CreateIndex
CREATE UNIQUE INDEX "job_requirement_versions_job_requirement_id_version_no_key" ON "job_requirement_versions"("job_requirement_id", "version_no");

-- CreateIndex
CREATE INDEX "blacklist_entries_phone_idx" ON "blacklist_entries"("phone");

-- CreateIndex
CREATE INDEX "blacklist_entries_email_idx" ON "blacklist_entries"("email");

-- CreateIndex
CREATE UNIQUE INDEX "candidates_rikuop_candidate_id_key" ON "candidates"("rikuop_candidate_id");

-- CreateIndex
CREATE UNIQUE INDEX "candidate_survey_tokens_token_hash_key" ON "candidate_survey_tokens"("token_hash");

-- CreateIndex
CREATE UNIQUE INDEX "candidate_survey_responses_candidate_id_key" ON "candidate_survey_responses"("candidate_id");

-- CreateIndex
CREATE UNIQUE INDEX "interview_slots_sm_user_id_slot_date_start_time_key" ON "interview_slots"("sm_user_id", "slot_date", "start_time");

-- CreateIndex
CREATE UNIQUE INDEX "interview_schedules_slot_id_key" ON "interview_schedules"("slot_id");

-- CreateIndex
CREATE UNIQUE INDEX "notifications_idempotency_key_key" ON "notifications"("idempotency_key");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stores" ADD CONSTRAINT "stores_area_id_fkey" FOREIGN KEY ("area_id") REFERENCES "areas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "area_manager_assignments" ADD CONSTRAINT "area_manager_assignments_area_id_fkey" FOREIGN KEY ("area_id") REFERENCES "areas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "area_manager_assignments" ADD CONSTRAINT "area_manager_assignments_am_user_id_fkey" FOREIGN KEY ("am_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "store_manager_assignments" ADD CONSTRAINT "store_manager_assignments_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "store_manager_assignments" ADD CONSTRAINT "store_manager_assignments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_data_import_logs" ADD CONSTRAINT "master_data_import_logs_imported_by_fkey" FOREIGN KEY ("imported_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_requirements" ADD CONSTRAINT "job_requirements_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_requirement_versions" ADD CONSTRAINT "job_requirement_versions_job_requirement_id_fkey" FOREIGN KEY ("job_requirement_id") REFERENCES "job_requirements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approval_actions" ADD CONSTRAINT "approval_actions_job_requirement_version_id_fkey" FOREIGN KEY ("job_requirement_version_id") REFERENCES "job_requirement_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approval_actions" ADD CONSTRAINT "approval_actions_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidates" ADD CONSTRAINT "candidates_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_survey_tokens" ADD CONSTRAINT "candidate_survey_tokens_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_survey_responses" ADD CONSTRAINT "candidate_survey_responses_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_slots" ADD CONSTRAINT "interview_slots_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_slots" ADD CONSTRAINT "interview_slots_sm_user_id_fkey" FOREIGN KEY ("sm_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_schedules" ADD CONSTRAINT "interview_schedules_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_schedules" ADD CONSTRAINT "interview_schedules_slot_id_fkey" FOREIGN KEY ("slot_id") REFERENCES "interview_slots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_schedules" ADD CONSTRAINT "interview_schedules_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

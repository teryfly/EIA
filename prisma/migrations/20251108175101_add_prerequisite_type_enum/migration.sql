-- CreateEnum
CREATE TYPE "Phase" AS ENUM ('Inception', 'Elaboration', 'Construction', 'Transition');

-- CreateEnum
CREATE TYPE "NodeStatus" AS ENUM ('locked', 'available', 'in_progress', 'ready');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('draft', 'completed');

-- CreateEnum
CREATE TYPE "AIDraftStatus" AS ENUM ('pending', 'accepted', 'previously_used', 'rejected');

-- CreateEnum
CREATE TYPE "AlertStatus" AS ENUM ('pending', 'handled', 'ignored', 'archived');

-- CreateEnum
CREATE TYPE "EdgeType" AS ENUM ('required', 'optional');

-- CreateEnum
CREATE TYPE "TemplateCategory" AS ENUM ('Standard', 'Simplified', 'Agile', 'Custom');

-- CreateEnum
CREATE TYPE "TemplateStatus" AS ENUM ('Draft', 'Published', 'Archived', 'ValidationFailed');

-- CreateEnum
CREATE TYPE "AlertSource" AS ENUM ('impact_analysis', 'rollback_detection');

-- CreateEnum
CREATE TYPE "UpstreamActionType" AS ENUM ('SupplementNewDocs', 'ReviseExistingDocs');

-- CreateEnum
CREATE TYPE "DraftGenType" AS ENUM ('initial_draft', 'conversation_refinement', 'rejection_regeneration');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('pending', 'running', 'completed', 'failed');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('scheduled', 'running', 'completed', 'failed', 'cancelled');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('admin', 'project_manager', 'developer', 'reviewer', 'viewer');

-- CreateEnum
CREATE TYPE "ConfigDataType" AS ENUM ('string', 'integer', 'boolean', 'json', 'float');

-- CreateEnum
CREATE TYPE "IssueSeverity" AS ENUM ('error', 'warning', 'info');

-- CreateEnum
CREATE TYPE "IssueType" AS ENUM ('phase_invalid', 'circular_dependency', 'orphaned_node', 'missing_doctype', 'invalid_edge', 'workflow_empty');

-- CreateEnum
CREATE TYPE "PrerequisiteType" AS ENUM ('required', 'optional');

-- CreateTable
CREATE TABLE "rup_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "TemplateCategory" NOT NULL,
    "estimatedDuration" TEXT,
    "status" "TemplateStatus" NOT NULL DEFAULT 'Draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rup_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_definitions" (
    "id" TEXT NOT NULL,
    "rupTemplateId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "phases" "Phase"[],
    "priority" INTEGER NOT NULL,
    "estimatedDuration" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workflow_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flow_template_nodes" (
    "id" TEXT NOT NULL,
    "workflowDefinitionId" TEXT NOT NULL,
    "fullId" TEXT NOT NULL,
    "docTypeId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "phase" "Phase" NOT NULL,
    "workflow" TEXT NOT NULL,
    "priority" INTEGER NOT NULL,
    "estimatedDuration" TEXT,
    "positionX" INTEGER NOT NULL,
    "positionY" INTEGER NOT NULL,
    "completionCondition" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "flow_template_nodes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flow_template_edges" (
    "id" TEXT NOT NULL,
    "workflowDefinitionId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "type" "EdgeType" NOT NULL,
    "label" TEXT,
    "weight" INTEGER NOT NULL DEFAULT 1,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "flow_template_edges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cross_flow_dependencies" (
    "id" TEXT NOT NULL,
    "rupTemplateId" TEXT NOT NULL,
    "sourceWorkflowId" TEXT NOT NULL,
    "sourceNodeId" TEXT NOT NULL,
    "sourceFullId" TEXT NOT NULL,
    "targetWorkflowId" TEXT NOT NULL,
    "targetNodeId" TEXT NOT NULL,
    "targetFullId" TEXT NOT NULL,
    "type" "EdgeType" NOT NULL,
    "displayLabel" TEXT,
    "description" TEXT,
    "weight" INTEGER NOT NULL DEFAULT 1,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cross_flow_dependencies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "validation_issues" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "workflowId" TEXT,
    "nodeId" TEXT,
    "severity" "IssueSeverity" NOT NULL,
    "type" "IssueType" NOT NULL,
    "message" TEXT NOT NULL,
    "details" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "validation_issues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "rupTemplateId" TEXT NOT NULL,
    "currentPhase" "Phase" NOT NULL,
    "ownerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flow_instances" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "rupTemplateId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "flow_instances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_instances" (
    "id" TEXT NOT NULL,
    "flowInstanceId" TEXT NOT NULL,
    "workflowDefinitionId" TEXT NOT NULL,
    "workflowName" TEXT NOT NULL,
    "workflowCode" TEXT NOT NULL,
    "totalNodes" INTEGER NOT NULL DEFAULT 0,
    "completedNodes" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workflow_instances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "node_instances" (
    "id" TEXT NOT NULL,
    "workflowInstanceId" TEXT NOT NULL,
    "templateNodeId" TEXT NOT NULL,
    "fullTemplateNodeId" TEXT NOT NULL,
    "docTypeId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "phase" "Phase" NOT NULL,
    "priority" INTEGER NOT NULL,
    "status" "NodeStatus" NOT NULL DEFAULT 'locked',
    "documentIds" TEXT[],
    "documentCount" INTEGER NOT NULL DEFAULT 0,
    "completedDocumentCount" INTEGER NOT NULL DEFAULT 0,
    "completionConditionSnapshot" JSONB NOT NULL,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "node_instances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prerequisites" (
    "id" TEXT NOT NULL,
    "nodeInstanceId" TEXT NOT NULL,
    "prerequisiteNodeInstanceId" TEXT NOT NULL,
    "fullTemplateNodeId" TEXT NOT NULL,
    "satisfied" BOOLEAN NOT NULL DEFAULT false,
    "type" "PrerequisiteType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prerequisites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "nodeInstanceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" "DocumentStatus" NOT NULL DEFAULT 'draft',
    "currentVersion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "lastModifiedBy" TEXT,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_versions" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "summary" TEXT,
    "aiDraftId" TEXT,
    "isRollback" BOOLEAN NOT NULL DEFAULT false,
    "skipImpactAnalysis" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_drafts" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "AIDraftStatus" NOT NULL DEFAULT 'pending',
    "content" TEXT NOT NULL,
    "conversationSessionId" TEXT,
    "autoGenerated" BOOLEAN NOT NULL DEFAULT true,
    "rejectionReason" TEXT,
    "rejectedBy" TEXT,
    "associatedVersions" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),

    CONSTRAINT "ai_drafts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversation_sessions" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "aiRole" TEXT NOT NULL,
    "backgroundTaskStatus" TEXT,
    "lastGeneratedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversation_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_messages" (
    "id" TEXT NOT NULL,
    "conversationSessionId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "background_generation_tasks" (
    "id" TEXT NOT NULL,
    "conversationSessionId" TEXT NOT NULL,
    "triggeredBy" TEXT NOT NULL,
    "triggerMessage" TEXT NOT NULL,
    "status" "TaskStatus" NOT NULL DEFAULT 'pending',
    "generatedDraftIds" TEXT[],
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "background_generation_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_draft_sequences" (
    "id" TEXT NOT NULL,
    "nextNumber" BIGINT NOT NULL DEFAULT 1,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_draft_sequences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "regeneration_alerts" (
    "id" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "createdBy" "AlertSource" NOT NULL,
    "status" "AlertStatus" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "handledAt" TIMESTAMP(3),
    "ignoredAt" TIMESTAMP(3),
    "ignoreReason" TEXT,
    "restoredAt" TIMESTAMP(3),

    CONSTRAINT "regeneration_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "upstream_clarification_alerts" (
    "id" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "actionType" "UpstreamActionType" NOT NULL,
    "status" "AlertStatus" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "handledAt" TIMESTAMP(3),
    "ignoredAt" TIMESTAMP(3),
    "ignoreReason" TEXT,
    "restoredAt" TIMESTAMP(3),

    CONSTRAINT "upstream_clarification_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "doc_types" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "workflow" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "template" TEXT,
    "supportedFormats" TEXT[],
    "systemPrompt" TEXT NOT NULL,
    "group" TEXT,
    "priority" INTEGER NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "phases" "Phase"[],
    "sourcesDocTypes" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "doc_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phase_mappings" (
    "id" TEXT NOT NULL,
    "workflowCode" TEXT NOT NULL,
    "allowedPhases" "Phase"[],
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "phase_mappings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_service_configs" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "apiKey" TEXT NOT NULL,
    "apiEndpoint" TEXT NOT NULL,
    "temperature" DOUBLE PRECISION NOT NULL DEFAULT 0.7,
    "maxTokens" INTEGER NOT NULL DEFAULT 4000,
    "timeoutMs" INTEGER NOT NULL DEFAULT 60000,
    "retryMaxAttempts" INTEGER NOT NULL DEFAULT 3,
    "retryDelayMs" INTEGER NOT NULL DEFAULT 1000,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_service_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "archive_policies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "archiveDaysAfterHandled" INTEGER NOT NULL DEFAULT 30,
    "archiveDaysAfterIgnored" INTEGER NOT NULL DEFAULT 30,
    "cronExpression" TEXT NOT NULL DEFAULT '0 2 * * *',
    "batchSize" INTEGER NOT NULL DEFAULT 100,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "retentionDays" INTEGER NOT NULL DEFAULT 365,
    "deleteAfterArchive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "archive_policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "archive_jobs" (
    "id" TEXT NOT NULL,
    "policyId" TEXT NOT NULL,
    "status" "JobStatus" NOT NULL DEFAULT 'scheduled',
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "processedCount" INTEGER NOT NULL DEFAULT 0,
    "archivedCount" INTEGER NOT NULL DEFAULT 0,
    "errorCount" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "nextScheduledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "archive_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "department" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastLoginAt" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_configs" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "dataType" "ConfigDataType" NOT NULL,
    "category" TEXT,
    "description" TEXT,
    "isEditable" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "system_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "oldValue" TEXT,
    "newValue" TEXT,
    "ipAddress" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "workflow_definitions_rupTemplateId_code_key" ON "workflow_definitions"("rupTemplateId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "flow_template_nodes_fullId_key" ON "flow_template_nodes"("fullId");

-- CreateIndex
CREATE INDEX "validation_issues_templateId_severity_idx" ON "validation_issues"("templateId", "severity");

-- CreateIndex
CREATE UNIQUE INDEX "document_versions_documentId_version_key" ON "document_versions"("documentId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "doc_types_code_key" ON "doc_types"("code");

-- CreateIndex
CREATE UNIQUE INDEX "phase_mappings_workflowCode_key" ON "phase_mappings"("workflowCode");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "system_configs_key_key" ON "system_configs"("key");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_entityType_entityId_idx" ON "audit_logs"("entityType", "entityId");

-- AddForeignKey
ALTER TABLE "workflow_definitions" ADD CONSTRAINT "workflow_definitions_rupTemplateId_fkey" FOREIGN KEY ("rupTemplateId") REFERENCES "rup_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flow_template_nodes" ADD CONSTRAINT "flow_template_nodes_workflowDefinitionId_fkey" FOREIGN KEY ("workflowDefinitionId") REFERENCES "workflow_definitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flow_template_nodes" ADD CONSTRAINT "flow_template_nodes_docTypeId_fkey" FOREIGN KEY ("docTypeId") REFERENCES "doc_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flow_template_edges" ADD CONSTRAINT "flow_template_edges_workflowDefinitionId_fkey" FOREIGN KEY ("workflowDefinitionId") REFERENCES "workflow_definitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cross_flow_dependencies" ADD CONSTRAINT "cross_flow_dependencies_rupTemplateId_fkey" FOREIGN KEY ("rupTemplateId") REFERENCES "rup_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "validation_issues" ADD CONSTRAINT "validation_issues_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "rup_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_rupTemplateId_fkey" FOREIGN KEY ("rupTemplateId") REFERENCES "rup_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flow_instances" ADD CONSTRAINT "flow_instances_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flow_instances" ADD CONSTRAINT "flow_instances_rupTemplateId_fkey" FOREIGN KEY ("rupTemplateId") REFERENCES "rup_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_instances" ADD CONSTRAINT "workflow_instances_flowInstanceId_fkey" FOREIGN KEY ("flowInstanceId") REFERENCES "flow_instances"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "node_instances" ADD CONSTRAINT "node_instances_workflowInstanceId_fkey" FOREIGN KEY ("workflowInstanceId") REFERENCES "workflow_instances"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "node_instances" ADD CONSTRAINT "node_instances_templateNodeId_fkey" FOREIGN KEY ("templateNodeId") REFERENCES "flow_template_nodes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prerequisites" ADD CONSTRAINT "prerequisites_nodeInstanceId_fkey" FOREIGN KEY ("nodeInstanceId") REFERENCES "node_instances"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prerequisites" ADD CONSTRAINT "prerequisites_prerequisiteNodeInstanceId_fkey" FOREIGN KEY ("prerequisiteNodeInstanceId") REFERENCES "node_instances"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_nodeInstanceId_fkey" FOREIGN KEY ("nodeInstanceId") REFERENCES "node_instances"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_lastModifiedBy_fkey" FOREIGN KEY ("lastModifiedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_versions" ADD CONSTRAINT "document_versions_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_drafts" ADD CONSTRAINT "ai_drafts_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_drafts" ADD CONSTRAINT "ai_drafts_conversationSessionId_fkey" FOREIGN KEY ("conversationSessionId") REFERENCES "conversation_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_sessions" ADD CONSTRAINT "conversation_sessions_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_messages" ADD CONSTRAINT "ai_messages_conversationSessionId_fkey" FOREIGN KEY ("conversationSessionId") REFERENCES "conversation_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "background_generation_tasks" ADD CONSTRAINT "background_generation_tasks_conversationSessionId_fkey" FOREIGN KEY ("conversationSessionId") REFERENCES "conversation_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "regeneration_alerts" ADD CONSTRAINT "regeneration_alerts_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "node_instances"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "upstream_clarification_alerts" ADD CONSTRAINT "upstream_clarification_alerts_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "node_instances"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "archive_jobs" ADD CONSTRAINT "archive_jobs_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "archive_policies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

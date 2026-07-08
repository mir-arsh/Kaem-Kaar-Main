export const ACTIVE_JOB_STATUSES = new Set(["open", "in_progress", "assigned"]);

export const isActiveJobStatus = (status) => ACTIVE_JOB_STATUSES.has(status);

export const isCompletedJobStatus = (status) => status === "completed";

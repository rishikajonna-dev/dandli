export const FREE_PLAN_LIMITS = {
  aiMapsLifetime: 2,
  totalNodesLifetime: 150,
};

export function isAiGenerationAllowed(count = 0) {
  return count < FREE_PLAN_LIMITS.aiMapsLifetime;
}

export function isNodeCreationAllowed(count = 0) {
  return count < FREE_PLAN_LIMITS.totalNodesLifetime;
}

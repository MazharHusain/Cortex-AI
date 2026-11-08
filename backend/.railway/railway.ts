import { defineRailway, github, project, service, database } from "railway/iac";

// Variables are managed via Railway dashboard / CLI
// Do NOT put secrets here - they are set directly in Railway
export default defineRailway(() => {
  const authService = service("auth-service", {
    source: github("MazharHusain/Cortex-AI", {
      branch: "main",
    }),
  });

  const chatService = service("chat-service", {
    source: github("MazharHusain/Cortex-AI", {
      branch: "main",
    }),
  });

  const agentService = service("agent-service", {
    source: github("MazharHusain/Cortex-AI", {
      branch: "main",
    }),
  });

  const gateway = service("gateway", {
    source: github("MazharHusain/Cortex-AI", {
      branch: "main",
    }),
  });

  return project("patient-creation", {
    resources: [authService, chatService, agentService, gateway],
  });
});

import { WorkflowState } from "@/types/compose";
import { parseDockerCompose } from "./composeGenerator";

export function downloadWorkflow(workflow: WorkflowState) {
  const json = JSON.stringify(workflow, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "orkestral-workflow.json";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function uploadWorkflow(): Promise<WorkflowState> {
  return new Promise((resolve, reject) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) {
        reject(new Error("No file selected"));
        return;
      }

      try {
        const text = await file.text();
        const workflow: WorkflowState = JSON.parse(text);
        resolve(workflow);
      } catch (error) {
        reject(error);
      }
    };

    input.click();
  });
}

export function uploadComposeWorkflow(): Promise<WorkflowState> {
  return new Promise((resolve, reject) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".yml,.yaml";

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) {
        reject(new Error("No file selected"));
        return;
      }

      try {
        const text = await file.text();
        const parsed = parseDockerCompose(text);

        const workflow: WorkflowState = {
          services: parsed.services,
          networks: parsed.networks,
          comments: [],
          edgeConnections: parsed.edgeConnections,
          nodePositions: {},
          version: "1.0",
        };

        resolve(workflow);
      } catch (error) {
        reject(error);
      }
    };

    input.click();
  });
}

export function loadWorkflowFromLocalStorage(): WorkflowState | null {
  try {
    const saved = localStorage.getItem("orkestral-workflow");
    if (saved) {
      return JSON.parse(saved) as WorkflowState;
    }
  } catch (error) {
    console.error("Error loading workflow from localStorage:", error);
  }
  return null;
}

export interface ComposeService {
  id: string;
  name: string;
  image: string;
  ports: string[];
  volumes: string[];
  environment: Record<string, string>;
  dependsOn: string[];
  networks: string[];
  restart?: string;
  command?: string;
  containerName?: string;
}

export interface NetworkNode {
  id: string;
  name: string;
  driver?: string;
  external?: boolean;
}

export interface CommentNode {
  id: string;
  text: string;
}

export interface NodePosition {
  x: number;
  y: number;
}

export interface EdgeConnection {
  id: string;
  source: string;
  target: string;
  sourceHandle: string;
  targetHandle: string;
  type: "dependency" | "network";
}

export interface CanvasNode {
  id: string;
  type: "service" | "network" | "comment";
  position: NodePosition;
  data: ComposeService | NetworkNode | CommentNode;
}

export interface ServiceNode extends ComposeService {
  position: { x: number; y: number };
}

export interface ComposeProject {
  version: string;
  services: Record<string, Omit<ComposeService, "id" | "position">>;
  networks?: Record<string, any>;
  volumes?: Record<string, any>;
}

export interface ServiceTemplate {
  id: string;
  name: string;
  icon: string;
  description: string;
  config: Partial<ComposeService>;
}

export interface WorkflowState {
  services: ComposeService[];
  networks: NetworkNode[];
  comments: CommentNode[];
  edgeConnections: EdgeConnection[];
  nodePositions: Record<string, NodePosition>;
  version: string;
}

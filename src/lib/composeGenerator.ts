import yaml from "js-yaml";
import { ComposeService, NetworkNode, EdgeConnection } from "@/types/compose";

interface DockerComposeService {
  image: string;
  container_name?: string;
  ports?: string[];
  volumes?: string[];
  environment?: Record<string, string>;
  depends_on?: string[];
  networks?: string[];
  restart?: string;
  command?: string;
}

export interface ParsedDockerCompose {
  services: ComposeService[];
  networks: NetworkNode[];
  edgeConnections: EdgeConnection[];
}

export function generateDockerCompose(services: ComposeService[]): string {
  if (services.length === 0) {
    return "# No services defined yet\n# Add services using the templates or create custom nodes";
  }

  const composeServices: Record<string, DockerComposeService> = {};

  services.forEach((service) => {
    const serviceConfig: DockerComposeService = {
      image: service.image,
    };

    if (service.containerName) {
      serviceConfig.container_name = service.containerName;
    }

    if (service.ports && service.ports.length > 0) {
      serviceConfig.ports = service.ports;
    }

    if (service.volumes && service.volumes.length > 0) {
      serviceConfig.volumes = service.volumes;
    }

    if (service.environment && Object.keys(service.environment).length > 0) {
      serviceConfig.environment = service.environment;
    }

    if (service.dependsOn && service.dependsOn.length > 0) {
      serviceConfig.depends_on = service.dependsOn;
    }

    if (service.networks && service.networks.length > 0) {
      serviceConfig.networks = service.networks;
    }

    if (service.restart) {
      serviceConfig.restart = service.restart;
    }

    if (service.command) {
      serviceConfig.command = service.command;
    }

    composeServices[service.name] = serviceConfig;
  });

  const composeProject: Record<string, unknown> = {
    version: "3.9",
    services: composeServices,
  };

  // adiciona a seção de volumes se algum serviço usar volumes nomeados
  const namedVolumes = new Set<string>();
  services.forEach((service) => {
    service.volumes?.forEach((volume) => {
      // volumes nomeados não começam com . ou /
      if (!volume.startsWith(".") && !volume.startsWith("/")) {
        const volumeName = volume.split(":")[0];
        namedVolumes.add(volumeName);
      }
    });
  });

  if (namedVolumes.size > 0) {
    const volumes: Record<string, Record<string, never>> = {};
    namedVolumes.forEach((volumeName) => {
      volumes[volumeName] = {};
    });
    composeProject.volumes = volumes;
  }

  // adiciona a seção de redes se algum serviço usar redes
  const networks = new Set<string>();
  services.forEach((service) => {
    service.networks?.forEach((network) => {
      networks.add(network);
    });
  });

  if (networks.size > 0) {
    const networksConfig: Record<string, Record<string, never>> = {};
    networks.forEach((network) => {
      networksConfig[network] = {};
    });
    composeProject.networks = networksConfig;
  }

  return yaml.dump(composeProject, {
    indent: 2,
    lineWidth: -1,
    noRefs: true,
  });
}

export function parseDockerCompose(yamlContent: string): ParsedDockerCompose {
  try {
    const parsed = yaml.load(yamlContent) as {
      services?: Record<string, Record<string, unknown>>;
      networks?: Record<string, Record<string, unknown>>;
    };

    if (!parsed.services) {
      return { services: [], networks: [], edgeConnections: [] };
    }

    const services: ComposeService[] = [];
    const networks: NetworkNode[] = [];
    const edgeConnections: EdgeConnection[] = [];
    const timestamp = Date.now();

    // faz parse dos serviços
    Object.entries(parsed.services).forEach(([name, config], index) => {
      const configRecord = config as Record<string, unknown>;
      const service: ComposeService = {
        id: `service-${timestamp}-${index}`,
        name,
        image: (configRecord.image as string) || "",
        ports: Array.isArray(configRecord.ports)
          ? (configRecord.ports as string[])
          : [],
        volumes: Array.isArray(configRecord.volumes)
          ? (configRecord.volumes as string[])
          : [],
        environment: (configRecord.environment as Record<string, string>) || {},
        dependsOn: Array.isArray(configRecord.depends_on)
          ? (configRecord.depends_on as string[])
          : [],
        networks: Array.isArray(configRecord.networks)
          ? (configRecord.networks as string[])
          : [],
        restart: configRecord.restart as string | undefined,
        command: configRecord.command as string | undefined,
        containerName: configRecord.container_name as string | undefined,
      };

      services.push(service);
    });

    // faz parse das redes e cria os objetos NetworkNode
    if (parsed.networks) {
      Object.entries(parsed.networks).forEach(([name, config], index) => {
        const configRecord = config as Record<string, unknown>;
        const network: NetworkNode = {
          id: `network-${timestamp}-${index}`,
          name,
          driver: (configRecord.driver as string) || "bridge",
          external: (configRecord.external as boolean) || false,
        };

        networks.push(network);
      });
    }

    // cria as conexões pros depends_on dos serviços
    services.forEach((service) => {
      service.dependsOn?.forEach((depName) => {
        const targetService = services.find((s) => s.name === depName);
        if (targetService) {
          edgeConnections.push({
            id: `dep-${service.id}-${targetService.id}`,
            source: service.id,
            target: targetService.id,
            sourceHandle: "top",
            targetHandle: "bottom",
            type: "dependency",
          });
        }
      });
    });

    // cria as conexões entre serviços e redes
    services.forEach((service) => {
      service.networks?.forEach((networkName) => {
        const network = networks.find((n) => n.name === networkName);
        if (network) {
          edgeConnections.push({
            id: `net-${service.id}-${network.id}`,
            source: service.id,
            target: network.id,
            sourceHandle: "bottom",
            targetHandle: "top",
            type: "network",
          });
        }
      });
    });

    return { services, networks, edgeConnections };
  } catch (error) {
    console.error("Failed to parse docker-compose.yml:", error);
    return { services: [], networks: [], edgeConnections: [] };
  }
}

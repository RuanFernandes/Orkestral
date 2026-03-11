import { NextRequest, NextResponse } from "next/server";

// tipos pra resposta da API do Docker Hub
interface DockerImageInfo {
  architecture: string;
  os: string;
}

interface DockerHubTag {
  name: string;
  last_updated?: string;
  images?: DockerImageInfo[];
}

// rota proxy pra buscar tags de uma imagem Docker
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const namespace = searchParams.get("namespace");
    const repository = searchParams.get("repository");

    // valida os parâmetros
    if (!namespace || !repository) {
      return NextResponse.json(
        { results: [], error: "Parameters 'namespace' and 'repository' are required" },
        { status: 400 }
      );
    }

    // chama a API do Docker Hub pra buscar tags
    const dockerHubUrl = `https://hub.docker.com/v2/repositories/${namespace}/${repository}/tags?page_size=20`;
    
    const response = await fetch(dockerHubUrl, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error("Docker Hub Tags API error:", response.status, response.statusText);
      // retorna lista vazia em vez de quebrar a UI
      return NextResponse.json({ results: [] });
    }

    const data = await response.json();

    // transforma os resultados pro formato esperado
    const transformedResults = (data.results || []).map((tag: DockerHubTag) => ({
      name: tag.name,
      last_updated: tag.last_updated,
      images: (tag.images || []).map((img: DockerImageInfo) => ({
        architecture: img.architecture,
        os: img.os,
      })),
    }));

    return NextResponse.json({
      count: data.count || 0,
      results: transformedResults,
    });
  } catch (error) {
    console.error("Error fetching Docker Hub tags:", error);
    // retorna lista vazia pra não quebrar a UI
    return NextResponse.json({ results: [] });
  }
}

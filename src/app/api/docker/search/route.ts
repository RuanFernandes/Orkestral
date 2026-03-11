import { NextRequest, NextResponse } from "next/server";

// tipos pra resposta da API do Docker Hub (campos reais da API)
interface DockerHubRepo {
  repo_name: string;
  repo_owner?: string;
  short_description?: string;
  pull_count?: number;
  star_count?: number;
  is_official?: boolean;
}

// rota proxy pra evitar CORS ao buscar imagens do Docker Hub
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");

    // valida o parâmetro de busca
    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { results: [], error: "Query parameter 'q' is required" },
        { status: 400 }
      );
    }

    // chama a API do Docker Hub
    const dockerHubUrl = `https://hub.docker.com/v2/search/repositories/?query=${encodeURIComponent(query)}&page_size=10`;
    
    const response = await fetch(dockerHubUrl, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error("Docker Hub API error:", response.status, response.statusText);
      // retorna lista vazia em vez de quebrar a UI
      return NextResponse.json({ results: [] });
    }

    const data = await response.json();

    // debug: mostra os dados retornados
    if (process.env.NODE_ENV === "development") {
      console.log("Docker Hub response:", {
        query,
        count: data.count,
        resultsCount: data.results?.length || 0,
      });
    }

    // transforma os resultados pro formato esperado
    const transformedResults = (data.results || []).map((repo: DockerHubRepo) => {
      // garante que os campos obrigatórios existem
      if (!repo.repo_name) {
        console.warn("Repositório sem repo_name:", repo);
        return null;
      }
      
      // faz parse do repo_name pra extrair namespace e name
      // exemplos: "node" (oficial), "bitnami/node", "cimg/node"
      const parts = repo.repo_name.split("/");
      const namespace = parts.length > 1 ? parts[0] : "library";
      const name = parts.length > 1 ? parts[1] : parts[0];
      
      return {
        name: name,
        namespace: namespace,
        description: repo.short_description || "",
        pull_count: repo.pull_count || 0,
        star_count: repo.star_count || 0,
        is_official: repo.is_official || false,
      };
    }).filter(Boolean); // remove nulls

    if (process.env.NODE_ENV === "development") {
      console.log("Imagens transformadas:", transformedResults.length);
      if (transformedResults.length > 0) {
        console.log("Primeira imagem:", transformedResults[0]);
      }
    }

    return NextResponse.json({
      count: data.count || 0,
      results: transformedResults,
    });
  } catch (error) {
    console.error("Error fetching Docker Hub images:", error);
    // retorna lista vazia pra não quebrar a UI
    return NextResponse.json({ results: [] });
  }
}

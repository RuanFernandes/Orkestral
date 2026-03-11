"use client";

import {
  Input,
  InputGroup,
  InputRightElement,
  Spinner,
  Box,
  VStack,
  HStack,
  Text,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  Badge,
} from "@chakra-ui/react";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  DockerHubRepository,
  DockerHubSearchResponse,
  DockerImageTag,
} from "@/types/compose";

interface DockerImageAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

// tipo para sugestões que podem ser repos ou tags
interface ImageSuggestion {
  type: "repository" | "tag";
  fullName: string; // formato completo: "node" ou "node:alpine"
  displayName: string;
  description?: string;
  repo?: DockerHubRepository;
  tag?: DockerImageTag;
}

// cache em memória pra evitar chamadas repetidas
const searchCache = new Map<string, DockerHubRepository[]>();
const tagsCache = new Map<string, DockerImageTag[]>();

export function DockerImageAutocomplete({
  value,
  onChange,
  placeholder = "nginx:latest",
}: DockerImageAutocompleteProps) {
  const [searchTerm, setSearchTerm] = useState(value);
  const [suggestions, setSuggestions] = useState<ImageSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // faz parse do input pra separar repo de tag
  const parseInput = (input: string): { repo: string; tagFilter: string | null } => {
    // se contém ":", separa em repo e tag
    const colonIndex = input.indexOf(":");
    if (colonIndex !== -1) {
      const repo = input.substring(0, colonIndex);
      const tagFilter = input.substring(colonIndex + 1);
      
      if (process.env.NODE_ENV === "development") {
        console.log("Parse input:", { input, repo, tagFilter });
      }
      
      return { repo, tagFilter };
    }
    return { repo: input, tagFilter: null };
  };

  // busca imagens no Docker Hub via API proxy
  const searchDockerImages = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      return;
    }

    // faz parse pra ver se tem tag
    const { repo, tagFilter } = parseInput(query);

    setIsLoading(true);
    try {
      // se tem tag filter, busca o repo específico e suas tags
      if (tagFilter !== null) {
        // busca apenas o repo (sem a tag)
        const repoQuery = repo;
        
        // checa o cache de repositórios
        let repositories: DockerHubRepository[] = [];
        if (searchCache.has(repoQuery)) {
          repositories = searchCache.get(repoQuery)!;
        } else {
          const response = await fetch(
            `/api/docker/search?q=${encodeURIComponent(repoQuery)}`
          );

          if (!response.ok) {
            throw new Error("Falha ao buscar imagens");
          }

          const data: DockerHubSearchResponse = await response.json();
          repositories = data.results || [];
          searchCache.set(repoQuery, repositories);
        }

        // pega o primeiro resultado que bate com o nome
        const matchingRepo = repositories.find((r) => {
          const fullName = r.namespace === "library" ? r.name : `${r.namespace}/${r.name}`;
          return fullName === repo || r.name === repo;
        }) || repositories[0];

        if (!matchingRepo) {
          setSuggestions([]);
          return;
        }

        // busca as tags desse repositório
        const namespace = matchingRepo.namespace === "library" ? "library" : matchingRepo.namespace;
        const cacheKey = `${namespace}/${matchingRepo.name}`;
        
        let tags: DockerImageTag[] = [];
        if (tagsCache.has(cacheKey)) {
          tags = tagsCache.get(cacheKey)!;
        } else {
          const tagsResponse = await fetch(
            `/api/docker/tags?namespace=${encodeURIComponent(namespace)}&repository=${encodeURIComponent(matchingRepo.name)}`
          );

          if (tagsResponse.ok) {
            const tagsData = await tagsResponse.json();
            tags = tagsData.results || [];
            tagsCache.set(cacheKey, tags);
          }
        }

        // filtra as tags baseado no tagFilter
        const filteredTags = tags.filter((tag) =>
          tag.name.toLowerCase().includes(tagFilter.toLowerCase())
        );

        if (process.env.NODE_ENV === "development") {
          console.log("Tags found:", tags.length, "filtered:", filteredTags.length);
        }

        // cria sugestões no formato "repo:tag"
        const repoName = matchingRepo.namespace === "library" 
          ? matchingRepo.name 
          : `${matchingRepo.namespace}/${matchingRepo.name}`;

        const tagSuggestions: ImageSuggestion[] = filteredTags.slice(0, 10).map((tag) => ({
          type: "tag",
          fullName: `${repoName}:${tag.name}`,
          displayName: tag.name,
          tag,
          repo: matchingRepo,
        }));

        setSuggestions(tagSuggestions);
      } else {
        // busca normal de repositórios (sem tag)
        // checa o cache primeiro
        if (searchCache.has(query)) {
          const repos = searchCache.get(query)!;
          const repoSuggestions: ImageSuggestion[] = repos.map((repo) => ({
            type: "repository",
            fullName: repo.namespace === "library" ? repo.name : `${repo.namespace}/${repo.name}`,
            displayName: repo.namespace === "library" ? repo.name : `${repo.namespace}/${repo.name}`,
            description: repo.description,
            repo,
          }));
          setSuggestions(repoSuggestions);
          return;
        }

        // usa a rota de API do Next.js pra evitar CORS
        const response = await fetch(
          `/api/docker/search?q=${encodeURIComponent(query)}`
        );

        if (!response.ok) {
          throw new Error("Falha ao buscar imagens");
        }

        const data: DockerHubSearchResponse = await response.json();
        const results = data.results || [];

        // debug: mostra os resultados
        if (results.length > 0 && process.env.NODE_ENV === "development") {
          console.log("Images found:", results.length, "first:", results[0]);
        }

        // salva no cache
        searchCache.set(query, results);
        
        // converte pra sugestões
        const repoSuggestions: ImageSuggestion[] = results.map((repo) => ({
          type: "repository",
          fullName: repo.namespace === "library" ? repo.name : `${repo.namespace}/${repo.name}`,
          displayName: repo.namespace === "library" ? repo.name : `${repo.namespace}/${repo.name}`,
          description: repo.description,
          repo,
        }));
        
        setSuggestions(repoSuggestions);
      }
    } catch (error) {
      console.error("Erro ao buscar imagens Docker:", error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // debounce na busca
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (searchTerm && searchTerm.length >= 2) {
      debounceRef.current = setTimeout(() => {
        searchDockerImages(searchTerm);
      }, 300);
    } else {
      setSuggestions([]);
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchTerm, searchDockerImages]);

  // atualiza o search term quando o value externo muda
  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  const handleInputChange = (newValue: string) => {
    setSearchTerm(newValue);
    onChange(newValue);
    // só abre se tiver conteúdo suficiente
    if (newValue.length >= 2) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  const handleSelectSuggestion = (suggestion: ImageSuggestion) => {
    // preenche com o nome completo (repo ou repo:tag)
    setSearchTerm(suggestion.fullName);
    onChange(suggestion.fullName);
    setIsOpen(false);
    setSuggestions([]);
    
    // mantém o foco no input
    setTimeout(() => {
      inputRef.current?.focus();
    }, 10);
  };

  return (
    <Box position="relative">
      <Popover
        isOpen={isOpen && suggestions.length > 0}
        onClose={() => setIsOpen(false)}
        placement="bottom-start"
        matchWidth
        closeOnBlur={true}
        autoFocus={false}
        returnFocusOnClose={false}
      >
        <PopoverTrigger>
          <InputGroup>
            <Input
              ref={inputRef}
              value={searchTerm}
              onChange={(e) => handleInputChange(e.target.value)}
              onFocus={() => {
                if (searchTerm.length >= 2 && suggestions.length > 0) {
                  setIsOpen(true);
                }
              }}
              placeholder={placeholder}
              bg="#111827"
              border="1px solid"
              borderColor="#2d3748"
              _hover={{ borderColor: "#3b82f6" }}
              _focus={{ borderColor: "#3b82f6", boxShadow: "0 0 0 1px #3b82f6" }}
              autoComplete="off"
            />
            {isLoading && (
              <InputRightElement>
                <Spinner size="sm" color="blue.400" />
              </InputRightElement>
            )}
          </InputGroup>
        </PopoverTrigger>

        <PopoverContent
          bg="#1f2937"
          borderColor="#2d3748"
          maxH="300px"
          overflowY="auto"
          w="100%"
          sx={{
            "&::-webkit-scrollbar": {
              width: "8px",
            },
            "&::-webkit-scrollbar-track": {
              background: "#111827",
            },
            "&::-webkit-scrollbar-thumb": {
              background: "#374151",
              borderRadius: "4px",
            },
          }}
        >
          <PopoverBody p={2}>
            <VStack spacing={1} align="stretch">
              {suggestions.map((suggestion, index) => (
                <Box
                  key={`${suggestion.fullName}-${index}`}
                  p={3}
                  cursor="pointer"
                  borderRadius="md"
                  _hover={{ bg: "#374151" }}
                  onMouseDown={(e) => {
                    // usa onMouseDown pra capturar antes do onBlur do input
                    e.preventDefault();
                    handleSelectSuggestion(suggestion);
                  }}
                >
                  <HStack justify="space-between" mb={1}>
                    <Text color="gray.100" fontWeight="medium" fontSize="sm">
                      {suggestion.fullName}
                    </Text>
                    {suggestion.type === "repository" && suggestion.repo?.is_official && (
                      <Badge colorScheme="blue" fontSize="xs">
                        Oficial
                      </Badge>
                    )}
                    {suggestion.type === "tag" && (
                      <Badge colorScheme="green" fontSize="xs">
                        Tag
                      </Badge>
                    )}
                  </HStack>
                  {suggestion.type === "repository" && suggestion.description && (
                    <Text color="gray.400" fontSize="xs" noOfLines={2}>
                      {suggestion.description}
                    </Text>
                  )}
                  {suggestion.type === "tag" && suggestion.tag?.images && suggestion.tag.images.length > 0 && (
                    <Text color="gray.500" fontSize="xs">
                      {suggestion.tag.images[0].architecture} / {suggestion.tag.images[0].os}
                    </Text>
                  )}
                  {suggestion.type === "repository" && suggestion.repo && (suggestion.repo.pull_count || suggestion.repo.star_count) && (
                    <HStack spacing={3} mt={1}>
                      {suggestion.repo.pull_count && (
                        <Text color="gray.500" fontSize="xs">
                          {formatNumber(suggestion.repo.pull_count)} pulls
                        </Text>
                      )}
                      {suggestion.repo.star_count && (
                        <Text color="gray.500" fontSize="xs">
                          ⭐ {formatNumber(suggestion.repo.star_count)}
                        </Text>
                      )}
                    </HStack>
                  )}
                </Box>
              ))}
            </VStack>
          </PopoverBody>
        </PopoverContent>
      </Popover>
    </Box>
  );
}

// formata números grandes (1000 -> 1k, 1000000 -> 1M)
function formatNumber(num: number): string {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1) + "B";
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "k";
  }
  return num.toString();
}

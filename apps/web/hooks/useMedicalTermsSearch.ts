"use client";

import { useState, useEffect, useCallback } from "react";
import {
  searchMedicalTerms,
  MedicalTermsSearchResult,
} from "@/app/actions/doctor/medical-history/search-medical-terms";

interface UseMedicalTermsSearchOptions {
  debounceMs?: number;
  limit?: number;
}

interface UseMedicalTermsSearchReturn {
  query: string;
  setQuery: (query: string) => void;
  results: string[];
  totalCount: number;
  page: number;
  setPage: (page: number) => void;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
  reset: () => void;
}

export function useMedicalTermsSearch(
  options: UseMedicalTermsSearchOptions = {}
): UseMedicalTermsSearchReturn {
  const { debounceMs = 500, limit = 10 } = options;

  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [results, setResults] = useState<string[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalPages = Math.ceil(totalCount / limit);

  const search = useCallback(
    async (searchQuery: string, searchPage: number) => {
      if (searchQuery.length < 3) {
        setResults([]);
        setTotalCount(0);
        setError(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await searchMedicalTerms({
          query: searchQuery,
          page: searchPage,
          limit,
        });

        if (response.success && response.data) {
          setResults(response.data.rows);
          setTotalCount(response.data.total_count);
        } else {
          setError(response.error ?? "Error al buscar términos");
          setResults([]);
          setTotalCount(0);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
        setResults([]);
        setTotalCount(0);
      } finally {
        setIsLoading(false);
      }
    },
    [limit]
  );

  // Debounced search when query changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length >= 3) {
        search(query, page);
      } else {
        setResults([]);
        setTotalCount(0);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, page, debounceMs, search]);

  // Reset page when query changes
  useEffect(() => {
    setPage(1);
  }, [query]);

  const reset = useCallback(() => {
    setQuery("");
    setPage(1);
    setResults([]);
    setTotalCount(0);
    setError(null);
  }, []);

  return {
    query,
    setQuery,
    results,
    totalCount,
    page,
    setPage,
    totalPages,
    isLoading,
    error,
    reset,
  };
}

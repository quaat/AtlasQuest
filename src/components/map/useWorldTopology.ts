import { useEffect, useState } from "react";
import { loadWorldTopology } from "@/lib/geo";

interface State {
  topology: Awaited<ReturnType<typeof loadWorldTopology>> | null;
  loading: boolean;
  error: Error | null;
}

let cache: State["topology"] | null = null;

export function useWorldTopology(): State {
  const [state, setState] = useState<State>(() => ({
    topology: cache,
    loading: !cache,
    error: null,
  }));

  useEffect(() => {
    if (cache) return;
    let cancelled = false;
    loadWorldTopology()
      .then((t) => {
        cache = t;
        if (!cancelled) setState({ topology: t, loading: false, error: null });
      })
      .catch((e) => {
        if (!cancelled)
          setState({ topology: null, loading: false, error: e as Error });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}

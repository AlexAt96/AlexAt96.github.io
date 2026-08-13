"use client";

import { useEffect, useState } from "react";
import {
  cloneDefaultStarredPatterns,
  cloneDefaultStarredPatternsByCollection,
  scenarios,
  type ScenarioCollection,
  type ScenarioId,
} from "./scenarios";

const SCENARIO_STORAGE_KEY = "compass-ui-demo-scenario";
const STARRED_STORAGE_KEYS: Record<ScenarioCollection, string> = {
  compass: "compass-ui-starred-patterns",
  tracker: "poc-tracker-ui-starred-patterns",
};

function isScenarioId(value: string | null): value is ScenarioId {
  return value === "base" || value === "dcc-hackathon";
}

function readStarredPatterns(value: string | null, collection: ScenarioCollection): Record<ScenarioId, string[]> {
  const defaults = cloneDefaultStarredPatterns(collection);
  if (!value) return defaults;
  try {
    const parsed = JSON.parse(value) as Partial<Record<ScenarioId, unknown>>;
    return {
      base: Array.isArray(parsed.base) ? parsed.base.filter((item): item is string => typeof item === "string") : defaults.base,
      "dcc-hackathon": Array.isArray(parsed["dcc-hackathon"])
        ? parsed["dcc-hackathon"].filter((item): item is string => typeof item === "string")
        : defaults["dcc-hackathon"],
    };
  } catch {
    return defaults;
  }
}

export function useScenario(initialScenario?: ScenarioId, collection: ScenarioCollection = "compass") {
  const [scenarioId, setScenarioId] = useState<ScenarioId>(initialScenario ?? "base");
  const [starredByCollection, setStarredByCollection] = useState(cloneDefaultStarredPatternsByCollection);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const savedScenario = window.localStorage.getItem(SCENARIO_STORAGE_KEY);
      if (!initialScenario && isScenarioId(savedScenario)) setScenarioId(savedScenario);
      setStarredByCollection({
        compass: readStarredPatterns(window.localStorage.getItem(STARRED_STORAGE_KEYS.compass), "compass"),
        tracker: readStarredPatterns(window.localStorage.getItem(STARRED_STORAGE_KEYS.tracker), "tracker"),
      });
      setReady(true);
    });
    const sync = (event: StorageEvent) => {
      if (event.key === SCENARIO_STORAGE_KEY && isScenarioId(event.newValue)) setScenarioId(event.newValue);
      (Object.keys(STARRED_STORAGE_KEYS) as ScenarioCollection[]).forEach((targetCollection) => {
        if (event.key !== STARRED_STORAGE_KEYS[targetCollection]) return;
        setStarredByCollection((current) => ({
          ...current,
          [targetCollection]: readStarredPatterns(event.newValue, targetCollection),
        }));
      });
    };
    window.addEventListener("storage", sync);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("storage", sync);
    };
  }, [initialScenario]);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem(SCENARIO_STORAGE_KEY, scenarioId);
    (Object.keys(STARRED_STORAGE_KEYS) as ScenarioCollection[]).forEach((targetCollection) => {
      window.localStorage.setItem(STARRED_STORAGE_KEYS[targetCollection], JSON.stringify(starredByCollection[targetCollection]));
    });
  }, [ready, scenarioId, starredByCollection]);

  function selectScenario(next: ScenarioId) {
    setScenarioId(next);
    const url = new URL(window.location.href);
    if (next === "base") {
      url.searchParams.delete("scenario");
      if (url.pathname === "/" && !url.searchParams.has("system")) url.searchParams.set("system", collection);
    }
    else url.searchParams.set("scenario", next);
    window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
  }

  function toggleStar(patternId: string) {
    setStarredByCollection((current) => {
      const collectionStars = current[collection];
      const starred = collectionStars[scenarioId];
      return {
        ...current,
        [collection]: {
          ...collectionStars,
          [scenarioId]: starred.includes(patternId)
            ? starred.filter((id) => id !== patternId)
            : [...starred, patternId],
        },
      };
    });
  }

  function resetRecommendations() {
    setStarredByCollection((current) => ({
      ...current,
      [collection]: {
        ...current[collection],
        [scenarioId]: [...scenarios[scenarioId].recommendations[collection].defaultStarredPatternIds],
      },
    }));
  }

  const scenarioDefinition = scenarios[scenarioId];
  const recommendation = scenarioDefinition.recommendations[collection];
  const scenario = {
    ...scenarioDefinition,
    recommendationTitle: recommendation.title,
    recommendationCopy: recommendation.copy,
    defaultStarredPatternIds: recommendation.defaultStarredPatternIds,
  };

  return {
    ready,
    collection,
    scenarioId,
    scenario,
    recommendation,
    starredPatternIds: starredByCollection[collection][scenarioId],
    selectScenario,
    toggleStar,
    resetRecommendations,
  };
}

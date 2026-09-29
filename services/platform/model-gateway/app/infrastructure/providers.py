from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any


class InferenceProvider(ABC):
    name: str

    @abstractmethod
    async def chat(self, messages: list[dict[str, str]], model: str, **kwargs: Any) -> dict[str, Any]:
        ...

    @abstractmethod
    async def vision(self, prompt: str, image_url: str, model: str, **kwargs: Any) -> dict[str, Any]:
        ...

    @abstractmethod
    async def embeddings(self, texts: list[str], model: str, **kwargs: Any) -> dict[str, Any]:
        ...

    @abstractmethod
    async def structured_output(
        self,
        prompt: str,
        schema: dict[str, Any],
        model: str,
        **kwargs: Any,
    ) -> dict[str, Any]:
        ...


class MockProvider(InferenceProvider):
    """Explicit mock AI provider — not real inference."""

    name = "mock"

    async def chat(self, messages: list[dict[str, str]], model: str, **kwargs: Any) -> dict[str, Any]:
        last = messages[-1]["content"] if messages else ""
        return {
            "provider": self.name,
            "model": model,
            "modelVersion": "mock-1.0.0",
            "output": {
                "role": "assistant",
                "content": f"[MOCK] Echo: {last[:500]}",
            },
            "usage": {"promptTokens": 12, "completionTokens": 24, "totalTokens": 36},
            "costUsd": 0.0,
            "mocked": True,
        }

    async def vision(self, prompt: str, image_url: str, model: str, **kwargs: Any) -> dict[str, Any]:
        return {
            "provider": self.name,
            "model": model,
            "modelVersion": "mock-vision-1.0.0",
            "output": {
                "description": f"[MOCK] Vision analysis for prompt '{prompt}' and image '{image_url}'",
                "labels": ["jewellery", "ring", "gold"],
            },
            "usage": {"promptTokens": 20, "completionTokens": 40, "totalTokens": 60},
            "costUsd": 0.0,
            "mocked": True,
        }

    async def embeddings(self, texts: list[str], model: str, **kwargs: Any) -> dict[str, Any]:
        vectors = []
        for text in texts:
            # Deterministic pseudo-embedding for local tests
            seed = sum(ord(c) for c in text) % 97
            vectors.append([((seed + i) % 17) / 17.0 for i in range(8)])
        return {
            "provider": self.name,
            "model": model,
            "modelVersion": "mock-embed-1.0.0",
            "embeddings": vectors,
            "dimensions": 8,
            "usage": {"promptTokens": len(texts) * 4, "totalTokens": len(texts) * 4},
            "costUsd": 0.0,
            "mocked": True,
        }

    async def structured_output(
        self,
        prompt: str,
        schema: dict[str, Any],
        model: str,
        **kwargs: Any,
    ) -> dict[str, Any]:
        return {
            "provider": self.name,
            "model": model,
            "modelVersion": "mock-structured-1.0.0",
            "output": {"promptPreview": prompt[:120], "schemaKeys": list(schema.keys())},
            "usage": {"promptTokens": 15, "completionTokens": 20, "totalTokens": 35},
            "costUsd": 0.0,
            "mocked": True,
        }

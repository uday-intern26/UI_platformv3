from __future__ import annotations

import pytest

from app.application.gateway_service import ModelGatewayService


@pytest.mark.asyncio
async def test_mock_chat_marks_mocked():
    svc = ModelGatewayService()
    result = await svc.chat("ten_demo", [{"role": "user", "content": "hello"}], "jewellery-assistant")
    assert result["mocked"] is True
    assert "MOCK" in result["output"]["content"]
    usage = svc.get_usage("ten_demo")
    assert usage["totalTokens"] > 0


@pytest.mark.asyncio
async def test_embeddings_dimensions():
    svc = ModelGatewayService()
    result = await svc.embeddings("ten_demo", ["gold ring", "diamond necklace"], "jewellery-embed")
    assert result["dimensions"] == 8
    assert len(result["embeddings"]) == 2

import uuid
from typing import Any

_tests: list[dict[str, Any]] = []


def add_test(test: dict[str, Any]) -> dict[str, Any]:
    entry = {"id": str(uuid.uuid4()), **test}
    _tests.append(entry)
    return entry


def get_tests() -> list[dict[str, Any]]:
    return list(_tests)

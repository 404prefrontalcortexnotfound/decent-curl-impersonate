"""Module entry point for the JSONL worker."""

import asyncio

from .worker import run_worker


if __name__ == "__main__":
    asyncio.run(run_worker())

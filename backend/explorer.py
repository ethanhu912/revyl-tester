import asyncio
import base64
import os
import tempfile
import threading
from collections.abc import AsyncGenerator

import anthropic
from revyl import DeviceClient

from prompts import SYSTEM_PROMPT, TOOLS


def _get_screenshot_bytes(device) -> bytes:
    with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp:
        path = tmp.name
    try:
        device.screenshot(out=path)
        with open(path, "rb") as f:
            return f.read()
    finally:
        try:
            os.unlink(path)
        except OSError:
            pass


def _image_block(data: bytes) -> dict:
    return {
        "type": "image",
        "source": {
            "type": "base64",
            "media_type": "image/png",
            "data": base64.standard_b64encode(data).decode(),
        },
    }


def _run_exploration(
    device,
    app_name: str,
    queue: asyncio.Queue,
    loop: asyncio.AbstractEventLoop,
    stop_event: threading.Event,
) -> None:
    client = anthropic.Anthropic()

    initial_screenshot = _get_screenshot_bytes(device)
    messages = [
        {
            "role": "user",
            "content": [
                _image_block(initial_screenshot),
                {
                    "type": "text",
                    "text": f"Explore the {app_name} app. Start from this screen.",
                },
            ],
        }
    ]

    while True:
        if stop_event.is_set():
            break

        response = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=4096,
            system=SYSTEM_PROMPT,
            tools=TOOLS,
            messages=messages,
        )

        messages.append({"role": "assistant", "content": response.content})

        if response.stop_reason == "end_turn":
            break

        tool_results = []
        stop = False

        for block in response.content:
            if block.type != "tool_use":
                continue

            if block.name == "take_screenshot":
                screenshot_bytes = _get_screenshot_bytes(device)
                result_content = [_image_block(screenshot_bytes)]

            elif block.name == "take_action":
                device.instruction(description=block.input["description"])
                result_content = "Done."

            elif block.name == "generate_test":
                test = {k: block.input[k] for k in ["title", "screen", "steps", "expected", "priority"]}
                loop.call_soon_threadsafe(queue.put_nowait, test)
                result_content = "Test recorded."

            elif block.name == "done":
                stop = True
                result_content = "Exploration complete."

            else:
                result_content = f"Unknown tool: {block.name}"

            tool_results.append({
                "type": "tool_result",
                "tool_use_id": block.id,
                "content": result_content,
            })

        messages.append({"role": "user", "content": tool_results})

        if stop:
            break


async def explore_app(app_name: str) -> AsyncGenerator[dict, None]:
    queue: asyncio.Queue = asyncio.Queue()
    loop = asyncio.get_running_loop()
    stop_event = threading.Event()

    def run_in_thread():
        try:
            with DeviceClient.start(platform="ios") as device:
                _run_exploration(device, app_name, queue, loop, stop_event)
        except Exception as e:
            loop.call_soon_threadsafe(queue.put_nowait, {"error": str(e)})
        finally:
            loop.call_soon_threadsafe(queue.put_nowait, None)

    thread = threading.Thread(target=run_in_thread, daemon=True)
    thread.start()

    try:
        while True:
            item = await queue.get()
            if item is None:
                break
            yield item
    finally:
        stop_event.set()

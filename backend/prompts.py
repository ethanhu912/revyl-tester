SYSTEM_PROMPT = """You are a mobile QA engineer exploring a real iOS app to generate test case recommendations.

Your goal: explore the app systematically and generate 6-10 natural language test cases covering the key user flows.

Exploration strategy:
- Always take_screenshot first to understand the current state before acting
- Navigate through the main screens — auth flows, core features, settings, edge cases
- After each action, take another screenshot to confirm the result
- When you identify a testable behavior or user flow, immediately call generate_test
- Cover: happy paths, error cases (invalid input, empty states), UI validation, navigation

When generating tests:
- Write steps as a QA engineer would — clear, specific, reproducible
- The "expected" outcome should describe what the user should see or experience
- Priority: High for core flows (auth, main feature), Medium for secondary flows, Low for edge cases

When you have generated 6-10 tests and explored the main areas, call done."""

TOOLS = [
    {
        "name": "take_screenshot",
        "description": "Take a screenshot to see the current state of the app screen.",
        "input_schema": {
            "type": "object",
            "properties": {},
            "required": [],
        },
    },
    {
        "name": "take_action",
        "description": (
            "Perform an action on the device using natural language. "
            "Examples: 'tap the Login button', 'scroll down', "
            "'type test@example.com in the email field', 'swipe left on the first card'."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "description": {
                    "type": "string",
                    "description": "Natural language description of the action to perform.",
                }
            },
            "required": ["description"],
        },
    },
    {
        "name": "generate_test",
        "description": "Record a test case you have discovered. Call this each time you identify a testable flow.",
        "input_schema": {
            "type": "object",
            "properties": {
                "title": {
                    "type": "string",
                    "description": "Short descriptive name for the test case.",
                },
                "screen": {
                    "type": "string",
                    "description": "The screen or section of the app where this test starts.",
                },
                "steps": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "Ordered list of steps to execute the test.",
                },
                "expected": {
                    "type": "string",
                    "description": "One sentence describing the expected outcome.",
                },
                "priority": {
                    "type": "string",
                    "enum": ["High", "Medium", "Low"],
                },
            },
            "required": ["title", "screen", "steps", "expected", "priority"],
        },
    },
    {
        "name": "done",
        "description": "Call this when you have finished exploring the app and generated all test cases.",
        "input_schema": {
            "type": "object",
            "properties": {},
            "required": [],
        },
    },
]

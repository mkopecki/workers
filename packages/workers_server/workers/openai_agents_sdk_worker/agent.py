from agents import Agent, Runner
from server_adapter import get_run, create_message
import sys

run_id = sys.argv[1]
run = get_run(run_id)
print(run_id)
print(run)

agent = Agent(name="Assistant", instructions="You are a helpful assistant")

result = Runner.run_sync(
    agent, "Write a haiku about recursion in programming.")
content = result.final_output
print(content)

create_message(
    run["args"]["thread_id"],
    run["args"]["thread_state_id"],
    run_id,
    "agents_sdk",
    content,
)

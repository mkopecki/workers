import requests

base_url = "http://localhost:3000/worker"


def get_run(run_id):
    res = requests.get(f"{base_url}/run/{run_id}")
    return res.json()


def create_message(thread_id, thread_state_id, run_id, author, content):
    data = {
        'run_id': run_id,
        'thread_state_id': thread_state_id,
        'author': author,
        'content': content,
    }

    route = f"{base_url}/thread/{thread_id}/message"
    res = requests.post(route, json=data)
    return res.json()

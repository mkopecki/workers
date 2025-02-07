import { ThreadData } from "workers_server/src/types";
import { use_thread_data, use_thread_data_store } from "./use_thread_data";
import Tree, { RawNodeDatum } from "react-d3-tree";
import { cn } from "@/lib/utils";

const dfs_search = (node: RawNodeDatum, id: string): RawNodeDatum | null => {
  if (node.attributes.id === id) {
    return node;
  }
  if (node.children) {
    for (const child of node.children) {
      const result = dfs_search(child, id);
      if (result) {
        return result;
      }
    }
  }
  return null;
};

const build_tree_data = (thread_data: ThreadData) => {
  if (!thread_data) return {};

  const root_state = thread_data.thread_states.at(0);
  const root_node: RawNodeDatum = {
    name: "Root",
    attributes: {
      id: root_state.id,
    },
    children: [],
  };

  for (const thread_state of thread_data.thread_states.slice(1)) {
    const parent_node = dfs_search(root_node, thread_state.previous_thread_state_id);
    const child_node = {
      name: thread_state.id.slice(-5),
      attributes: {
        id: thread_state.id,
      },
      children: [],
    };
    parent_node?.children.push(child_node);
  }

  return root_node;
};

export const ThreadTree = () => {
  const thread_data_store = use_thread_data_store();

  const data = build_tree_data(thread_data_store.thread_data);

  const on_node_click = (id: string) => {
    console.log({ id });
    thread_data_store.load_thread_state(id);
  };

  const render_custom_node_element = ({ nodeDatum }) => {
    const is_selected = thread_data_store.thread_state?.id === nodeDatum.attributes.id;
    return (
      <g>
        <circle
          className={cn("stroke-white", is_selected ? "fill-white" : "fill-zinc-600")}
          strokeWidth="2"
          r="8"
          onClick={() => on_node_click(nodeDatum.attributes.id)}
        />
        <text className="fill-white stroke-white" strokeWidth="1" x="15" y="4">
          {nodeDatum.name}
        </text>
      </g>
    );
  };

  return (
    <div className="flex justify-center bg-slate-900 h-full">
      <Tree
        data={data}
        orientation="vertical"
        renderCustomNodeElement={render_custom_node_element}
        rootNodeClassName="text-white fill-current"
        pathClassFunc={() => "!stroke-white"}
        separation={{
          siblings: 1,
        }}
        nodeSize={{
          x: 100,
          y: 40,
        }}
        pathFunc="step"
      />
    </div>
  );
};

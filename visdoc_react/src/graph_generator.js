import {MarkerType} from '@xyflow/react';

const x_offset = 300
const y_offset = 300
const edge_color = '#007FFF'

export default function render_graph(repo_name, graph_sequences){
    // for (seq in graph_sequences){
    //     console.log(seq['sequence'], ':' )
    // }
    let nodes = []
    nodes.push(create_parent_node(repo_name))
    let edges = []
    let center_of_y_axis = parseInt(graph_sequences.length/2) * y_offset
    let y_start_pos = -center_of_y_axis
    for (let i = 0; i < graph_sequences.length; i++) {
        // console.log(graph_sequences[i]['edges']);
        for (let j = 0; j < graph_sequences[i]['edges'].length; j++) {

            let edge = graph_sequences[i]['edges'][j]
            
            // create the nodes
            if(j==0){
                let new_node = create_node(y_start_pos, i, 0, edge["source"])
                nodes.push(new_node)
                new_node = create_node(y_start_pos, i, 1, edge["target"])
                nodes.push(new_node)
                let new_edge = create_edge(repo_name, edge["source"])
                edges.push(new_edge)
            }
            else{
                let new_node = create_node(y_start_pos, i, j+1, edge["target"])
                nodes.push(new_node)
            }

            //create edges
            let new_edge = create_edge(edge["source"], edge["target"])
            edges.push(new_edge)

        }
    }
    // console.log(nodes)
    // console.log(edges)
    return [nodes, edges]
}

function create_node(y_start_pos, sequence_idx, edge_idx, node_name){
    let x_pos = (edge_idx+1) * x_offset
    let y_pos = y_start_pos + (sequence_idx) * y_offset

    return({
        id: node_name,
        data: { label: node_name },
        position: { x: x_pos, y: y_pos },
        sourcePosition: 'right',
        targetPosition: 'left',
        type:'node-with-toolbar'

      })
}

function create_edge(source, target){
    return({
        id: source+'_'+target,
        source: source,
        target: target,
        type: 'smoothstep',
        markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 20,
            height: 20,
            color: edge_color,
        },
        style: {
        strokeWidth: 2,
        stroke: edge_color,
        },
      })
}

function create_parent_node(repo_name){
    return({
        id: repo_name,
        data: { label: 'Contributing to '+repo_name },
        position: { x: 0, y: 0 },
        sourcePosition: 'right',
        targetPosition: 'left',
        type:'node-with-toolbar'
      })
}
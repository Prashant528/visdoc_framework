import {MarkerType} from '@xyflow/react';

const x_offset = 400
const y_offset = 200
const edge_color = '#007FFF'

export default function render_graph(repo_name, graph_sequences){
    // for (seq in graph_sequences){
    //     console.log(seq['sequence'], ':' )
    // }
    let nodes = []
    // nodes.push(create_parent_node(repo_name))
    let edges = []
    let end_of_y_axis = parseInt(graph_sequences.length/2) * y_offset
    console.log("End of y-axis = ", end_of_y_axis)
    let y_start_pos = -end_of_y_axis
    for (let i = 0; i < graph_sequences.length; i++) {
        // console.log(graph_sequences[i]['edges']);
        console.log("Plotting sequence at = ", y_start_pos + i * y_offset)
        for (let j = 0; j < graph_sequences[i]['edges'].length; j++) {

            let edge = graph_sequences[i]['edges'][j]
            
            // create the nodes
            if(j==0){
                let new_node = create_node(0-y_offset/2, 0, 0, edge["source"])
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
        type: 'bezier',
        markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 15,
            height: 25,
            color: edge_color,
        },
        style: {
        strokeWidth: 3,
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
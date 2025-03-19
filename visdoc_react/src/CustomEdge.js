import React from 'react';
import { getBezierPath } from '@xyflow/react';

const CustomEdge = ({ id, sourceX, sourceY, targetX, targetY, style = {}, markerEnd }) => {
  // Get the bezier path (React Flow's default bezier-like behavior)
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  // Calculate the rotation angle for the middle marker
  const angle = Math.atan2(targetY - sourceY, targetX - sourceX) * (180 / Math.PI);

  return (
    <>
      {/* Bezier path (same as default React Flow bezier) */}
      <path id={id} d={edgePath} style={style} className="react-flow__edge-path" markerEnd={markerEnd} />

      {/* Middle arrow marker */}
      <g transform={`translate(${labelX}, ${labelY}) rotate(${angle})`}>
        <polygon points="-6,-5 6,0 -6,5" fill="#ff4500" />
      </g>
    </>
  );
};

export default CustomEdge;

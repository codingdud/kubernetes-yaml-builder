import React from 'react';
import { type EdgeProps, getBezierPath } from '@xyflow/react';

const DataEdge: React.FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data
}) => {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <g>
      <path
        id={id as string}
        d={edgePath}
        stroke="#3b82f6"
        strokeWidth={2}
        fill="none"
        markerEnd="url(#arrowhead)"
      />
      {(data as any)?.label && (
        <text>
          <textPath href={`#${id}`} startOffset="35%">
            <tspan dy="-5" className="text-xs fill-blue-600">
              {String((data as any).label)}
            </tspan>
          </textPath>
        </text>
      )}
    </g>
  );
};

export default DataEdge;
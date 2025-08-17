import React from 'react';
import { type EdgeProps, getBezierPath, useReactFlow } from '@xyflow/react';
import { X } from 'lucide-react';

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
  const { deleteElements } = useReactFlow();
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const handleDelete = () => {
    deleteElements({ edges: [{ id }] });
  };

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
        <>
          <text>
            <textPath href={`#${id}`} startOffset="35%">
              <tspan dy="-5" className="text-xs fill-blue-600">
                {String((data as any).label)}
              </tspan>
            </textPath>
          </text>
          <foreignObject
            width={20}
            height={20}
            x={labelX - 10}
            y={labelY - 10}
            className="overflow-visible"
          >
            <button
              onClick={handleDelete}
              className="w-5 h-5 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white text-xs border border-white shadow-sm"
              title="Delete connection"
            >
              <X className="w-3 h-3" />
            </button>
          </foreignObject>
        </>
      )}
    </g>
  );
};

export default DataEdge;
"use client";

import { memo } from "react";
import {
  EdgeProps,
  getBezierPath,
  EdgeLabelRenderer,
  BaseEdge,
  useReactFlow,
} from "reactflow";
import { IconButton } from "@chakra-ui/react";
import { X } from "lucide-react";

export const NetworkEdge = memo(
  ({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerEnd,
    label,
    selected,
  }: EdgeProps) => {
    const { setEdges } = useReactFlow();
    const [edgePath, labelX, labelY] = getBezierPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
    });

    const onEdgeClick = (evt: React.MouseEvent) => {
      evt.stopPropagation();
      setEdges((edges) => edges.filter((edge) => edge.id !== id));
    };

    return (
      <>
        <BaseEdge
          id={id}
          path={edgePath}
          markerEnd={markerEnd}
          style={{
            ...style,
            stroke: selected ? "#a78bfa" : "#a78bfa",
            strokeWidth: selected ? 3 : 2,
            strokeDasharray: "5,5",
          }}
        />
        {(label || selected) && (
          <EdgeLabelRenderer>
            <div
              style={{
                position: "absolute",
                transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                display: "flex",
                alignItems: "center",
                gap: "4px",
                fontSize: 10,
                color: "#a78bfa",
                background: "#111827",
                padding: "2px 6px",
                borderRadius: 4,
                border: selected
                  ? "1px solid #a78bfa"
                  : "1px solid transparent",
                pointerEvents: "all",
              }}
              className="nodrag nopan"
            >
              {label && <span>{label}</span>}
              {selected && (
                <IconButton
                  aria-label="Delete edge"
                  icon={<X size={12} />}
                  size="xs"
                  variant="ghost"
                  colorScheme="red"
                  onClick={onEdgeClick}
                  minW="16px"
                  h="16px"
                  p={0}
                />
              )}
            </div>
          </EdgeLabelRenderer>
        )}
      </>
    );
  },
);

NetworkEdge.displayName = "NetworkEdge";

"use client";

import { Box, Text } from "@chakra-ui/react";

/**
 * OrkestralWatermark - A subtle attribution label displayed in the bottom-right corner of the canvas
 *
 * Features:
 * - Positioned absolutely in the bottom-right corner
 * - Disabled pointer events (acts as a watermark)
 * - Low opacity for minimal visual impact
 * - Persists across zoom/pan operations
 */
export function OrkestralWatermark() {
  return (
    <Box
      position="absolute"
      bottom="12px"
      right="12px"
      zIndex={10}
      pointerEvents="none"
      bg="rgba(0, 0, 0, 0.3)"
      px={2}
      py={1}
      borderRadius="md"
      backdropFilter="blur(4px)"
    >
      <Text
        fontSize="xs"
        fontWeight="medium"
        color="whiteAlpha.600"
        letterSpacing="wide"
      >
        Orkestral
      </Text>
    </Box>
  );
}

import { Box } from "@chakra-ui/react";
import React from "react";
import styled, { keyframes } from "styled-components";

const angleProperty = `
  @property --angle {
    syntax: "<angle>";
    initial-value: 0deg;
    inherits: false;
  }
`;

const spin = keyframes`
  from {
    --angle: 0deg;
  }
  to {
    --angle: 360deg;
  }
`;

const CardContainer = styled(Box).withConfig({
  shouldForwardProp: (prop) => prop !== "animate",
})`
  ${angleProperty}

  background: var(--chakra-colors-chakra-body-bg);
  border-radius: 10px;
  position: relative;

  &::before,
  &::after {
    content: "";
    position: absolute;
    height: 100%;
    width: 100%;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: -1;
    padding: 1px;
    border-radius: 10px;
    transition: opacity 1s ease, filter 1s ease;
  }

  &::before {
    filter: ${(props) => (props.animate ? "blur(0.5rem)" : "blur(0)")};
    opacity: ${(props) => (props.animate ? 0.7 : 1)};
    background-color: var(--chakra-colors-chakra-border-color);
  }

  &::after {
    background-image: conic-gradient(
      from var(--angle),
      #ff4545,
      #00ff99,
      #006aff,
      #ff0095,
      #ff4545
    );
    opacity: ${(props) => (props.animate ? 1 : 0)};
    animation: ${spin} 3s linear infinite;
  }
`;

const GlowCard = ({ children, animate, ...props }) => {
  return (
    <CardContainer animate={animate} {...props}>
      {children}
    </CardContainer>
  );
};

export default GlowCard;

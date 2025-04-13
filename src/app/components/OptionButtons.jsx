import React from "react";
import {
  Button,
  ButtonGroup,
  Icon,
  Flex,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";

/**
 * A reusable button group component for selecting options
 *
 * @param {Object} props
 * @param {Array} props.options - Array of option objects with value, label, icon (and optionally color)
 * @param {string} props.currentValue - The currently selected value
 * @param {Function} props.onChange - Function to call when an option is selected
 * @param {Object} props.rest - Additional props to pass to the ButtonGroup
 */
const OptionButtons = ({ options, currentValue, onChange, ...rest }) => {
  const activeBg = useColorModeValue("blue.50", "blue.900");
  const hoverBg = useColorModeValue("gray.50", "gray.700");

  return (
    <ButtonGroup width="100%" isAttached variant="outline" {...rest}>
      {options.map((option) => {
        const isSelected = currentValue === option.value;
        return (
          <Button
            key={option.value}
            flex="1"
            onClick={() => onChange(option.value)}
            bg={isSelected ? activeBg : "transparent"}
            borderColor={isSelected ? "blue.500" : undefined}
            _hover={{ bg: isSelected ? activeBg : hoverBg }}
            size="sm"
          >
            <Flex direction="row" align="center" justify="center" gap={1}>
              <Icon
                as={option.icon}
                color={option.color || "blue.500"}
                boxSize="1em"
              />
              <Text fontSize="xs" textTransform="uppercase">
                {option.label}
              </Text>
            </Flex>
          </Button>
        );
      })}
    </ButtonGroup>
  );
};

export default OptionButtons;

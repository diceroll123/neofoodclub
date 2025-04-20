import React from "react";
import { Flex, Icon, Switch, Text, Tooltip, Box } from "@chakra-ui/react";

/**
 * A generic settings row component that displays an icon, label, and a toggle control (Switch or Checkbox)
 *
 * @param {Object} props
 * @param {React.ElementType} props.icon - The icon component to display
 * @param {string} props.label - The text label for the setting
 * @param {boolean} props.isChecked - Whether the control is checked
 * @param {function} props.onChange - Function to call when the control is toggled
 * @param {string} props.tooltipText - Optional tooltip text to display on hover
 * @param {string} props.colorScheme - Optional color scheme for the switch (defaults to current color mode)
 * @param {Object} props.iconProps - Optional additional props for the icon
 * @param {boolean} props.isDisabled - Whether the control is disabled
 */
const SettingsRow = ({
  icon,
  label,
  isChecked,
  onChange,
  tooltipText,
  colorScheme,
  iconProps = {},
  isDisabled = false,
}) => {
  // Calculate icon size based on checked state
  const baseSize = iconProps.baseSize || "1em";
  const largeSize = iconProps.largeSize || "1.5em";
  const iconSize = isChecked ? largeSize : baseSize;

  // Extract props we don't want to pass directly to the Icon component
  const { baseSize: _, largeSize: _2, ...safeIconProps } = iconProps;

  const rowContent = (
    <Flex
      justify="space-between"
      align="center"
      width="100%"
      as="div"
      opacity={isDisabled ? 0.6 : 1}
      py={2}
      borderRadius="md"
      transition="background-color 0.2s"
    >
      <Flex
        align="center"
        flex="1"
        cursor={isDisabled ? "not-allowed" : "pointer"}
        onClick={isDisabled ? undefined : onChange}
        _hover={!isDisabled && { bg: "blackAlpha.50" }}
      >
        <Box
          minWidth="24px"
          width="24px"
          display="flex"
          justifyContent="center"
          mr={2}
        >
          {icon && (
            <Icon
              as={icon}
              color={safeIconProps.color}
              w={iconSize}
              h={iconSize}
              style={{
                transition:
                  "width 0.7s cubic-bezier(0.34, 1.56, 0.64, 1), height 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)",
                ...safeIconProps.style,
              }}
              {...safeIconProps}
            />
          )}
        </Box>
        <Text>{label}</Text>
      </Flex>
      <Box
        onClick={(e) => {
          // Prevent event bubbling to the parent Flex
          e.stopPropagation();
        }}
      >
        <Switch
          isChecked={isChecked}
          colorScheme={colorScheme}
          isDisabled={isDisabled}
          onChange={onChange}
        />
      </Box>
    </Flex>
  );

  if (tooltipText) {
    return (
      <Tooltip label={tooltipText} openDelay={600}>
        {rowContent}
      </Tooltip>
    );
  }

  return rowContent;
};

export default SettingsRow;

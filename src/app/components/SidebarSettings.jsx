import {
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  Icon,
  IconButton,
  VStack,
} from "@chakra-ui/react";
import { FaBars } from "react-icons/fa6";
import React from "react";

// Import components directly from TableSettings.jsx since we haven't split them yet
import NormalExtras from "./TableSettings/NormalExtras";
import TableModes from "./TableSettings/TableModes";
import LogitModelToggle from "./TableSettings/LogitModelToggle";
import CopyWithDomain from "./TableSettings/CopyWithDomain";
import ColorModeButton from "./TableSettings/ColorModeButton";

const SidebarSettings = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = React.useRef();

  return (
    <>
      <IconButton
        ref={btnRef}
        icon={<Icon as={FaBars} />}
        onClick={onOpen}
        aria-label="Open Settings"
        variant="ghost"
        size="md"
      />

      <Drawer
        isOpen={isOpen}
        placement="left"
        onClose={onClose}
        finalFocusRef={btnRef}
        size="xs"
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">Settings</DrawerHeader>

          <DrawerBody py={4}>
            <VStack spacing={2} align="stretch" width="100%">
              <TableModes />
              <NormalExtras />
              <LogitModelToggle />
              <CopyWithDomain />
              <ColorModeButton />
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default SidebarSettings;

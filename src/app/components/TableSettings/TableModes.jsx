import { useContext } from "react";
import { FaTable, FaSquareCaretDown } from "react-icons/fa6";
import Cookies from "universal-cookie";
import { getTableMode } from "../../util";
import SectionPanel from "../SectionPanel";
import { RoundContext } from "../../RoundState";
import OptionButtons from "../OptionButtons";

const TableModes = () => {
  const { setRoundState } = useContext(RoundContext);
  const cookies = new Cookies();

  const handleChange = (newValue) => {
    cookies.set("tableMode", newValue);
    setRoundState({ tableMode: newValue });
  };

  const options = [
    { value: "normal", label: "Table", icon: FaTable },
    { value: "dropdown", label: "Dropdown", icon: FaSquareCaretDown },
  ];

  const currentValue = getTableMode();

  return (
    <SectionPanel title="Pirate Selection Mode">
      <OptionButtons
        options={options}
        currentValue={currentValue}
        onChange={handleChange}
      />
    </SectionPanel>
  );
};

export default TableModes;

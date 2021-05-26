import Td from "./Td";

// this element is a special Td with minimal x-axis padding to cut down on giant tables

const Pd = (props) => (
	<Td px={1} {...props}>
		{props.children}
	</Td>
);

export default Pd;

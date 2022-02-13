import { extendTheme } from '@chakra-ui/react'

const config = {
    initialColorMode: 'dark',
    useSystemColorMode: true,
}

const colors = {
    nfc: {
        blue: "#90CDF4",
        blueDark: "#4BA0E4",

        gray: "#F7FAFC",
        grayDark: "#2D3748",

        green: "#9AE6B4",
        greenDark: "#50C17F",

        red: "#FEB2B2",
        redDark: "#F76C6C",

        orange: "#FBD38D",
        orangeDark: "#F0923E",

        yellow: "#FAF089",
        yellowDark: "#EFCF50",
    },
}

const theme = extendTheme({ config }, { colors });

export default theme;

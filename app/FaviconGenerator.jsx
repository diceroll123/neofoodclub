import { useEffect } from "react";

const faviconTemplate = (icon) => {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><text y="24" font-size="26">${icon}</text></svg>`;
};

function FaviconGenerator() {
  useEffect(() => {
    const emojis = [
      "🍗",
      "🍔",
      "🍞",
      "🥪",
      "🥨",
      "🍕",
      "🌭",
      "🌮",
      "🌯",
      "🍖",
      "🥩",
      "🥧",
      "🥓",
      "🦀",
    ];

    const linkForFavicon = document.querySelector(`head > link[rel='icon']`);

    if (linkForFavicon) {
      const favicon = faviconTemplate(
        emojis[Math.floor(Math.random() * emojis.length)]
      );

      linkForFavicon.setAttribute("href", `data:image/svg+xml,${favicon}`);
    }
  }, []); // Empty dependency array ensures this runs only once

  return null;
}

export default FaviconGenerator;

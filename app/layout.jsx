export const metadata = {
  title: "NeoFoodClub",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <link rel="icon" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <noscript>You need to enable JavaScript to run this app.</noscript>
        <main>{children}</main>
      </body>
    </html>
  );
}

import React from 'react';
import './globals.css';

const Layout = ({ children }) => {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#0ea5e9" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body className="bg-white text-gray-900">
        <nav className="p-4 bg-blue-500 text-white">
          <h1 className="text-xl font-bold">Kim Family App</h1>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  );
};

export default Layout;
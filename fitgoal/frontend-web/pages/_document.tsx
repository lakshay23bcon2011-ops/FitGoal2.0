import Document, { Html, Head, Main, NextScript } from 'next/document';

export default class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head />
        <body className="min-h-full flex flex-col bg-bg-primary text-text-primary">
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

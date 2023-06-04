import Document, { Head, Html, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          <link rel="icon" href="/favicon.ico" />
          <meta name="description" content="AIworks，让AI触手可及。" />
          <meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests"></meta>
          <meta property="og:site_name" content="aiworks.club" />
          <meta property="og:description" content="AIworks，让AI触手可及。" />
          <meta property="og:title" content="AIworks" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;

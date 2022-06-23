import PlausibleProvider from 'next-plausible';
import { SessionProvider } from 'next-auth/react';
import 'styles/globals.css';

export default function App({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <PlausibleProvider domain="platform-cms.vercel.app">
      <SessionProvider session={session}>
        <Component {...pageProps} />
      </SessionProvider>
    </PlausibleProvider>
  );
}

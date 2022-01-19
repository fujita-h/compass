import { ApolloProvider, ApolloClient, InMemoryCache } from "@apollo/client";
import { relayStylePagination } from "@apollo/client/utilities"
import { AppProps } from 'next/app'
import Head from 'next/head'
import '../styles/global.css'

const client = new ApolloClient({
  uri: "/api/graphql",
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          myJoinedGroupsCP: relayStylePagination(),
          usersCP: relayStylePagination(),
          myTimelineCP: relayStylePagination(),
          documentsCP: relayStylePagination(),
        }
      },
      Document: {
        fields: {
          Paper: {
            merge: true
          }
        }
      }
    }
  }),
  defaultOptions: {
    query: {
      fetchPolicy: 'network-only'
    },
    watchQuery: {
      fetchPolicy: 'cache-and-network'
    },
    mutate: {
      fetchPolicy: 'network-only'
    }
  }
});

const App = ({ Component, pageProps }: AppProps) => (
  <>
    <Head>
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1, shrink-to-fit=no"
      />
      <title key="title">compass</title>
      {/* <link rel="icon" href="/favicon.ico" /> */}
      {/* <link rel="apple-touch-icon" type="image/png" href="/apple-touch-icon-180x180.png" /> */}
      {/* <link rel="shortcut icon" href="/favicon.png" key="shortcutIcon" /> */}
      {/* <link rel="manifest" href="/manifest.json" /> */}
    </Head>
    <ApolloProvider client={client}>
      <Component {...pageProps} />
    </ApolloProvider>
  </>
)

export default App
// import { createApp } from "vue";
// import App from "./App.vue";
// import VueKonva from "vue-konva";
//
// const app = createApp(App);
// app.use(VueKonva);
// app.mount("#app");

import { createApp, provide, h } from "vue";
import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
} from "@apollo/client/core";
import { DefaultApolloClient } from "@vue/apollo-composable";
import App from "./App.vue";
import VueKonva from "vue-konva";

const httpLink = createHttpLink({
  uri: "http://catalog-mtz.ru/graphql",
});

// Create the apollo client
const apolloClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
  connectToDevTools: true,
});

const app = createApp({
  setup() {
    provide(DefaultApolloClient, apolloClient);
  },
  render() {
    return h(App);
  },
});

app.use(VueKonva);

app.mount("#app");

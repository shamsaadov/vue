<template>
  <div v-if="loading">Loading...</div>
  <div v-else>
    <div v-for="item in result.data" :key="item.id">
      {{ item?.name }}
    </div>
  </div>
</template>

<script>
import { useQuery } from "@vue/apollo-composable";
import gql from "graphql-tag";

export default {
  setup() {
    const { result, loading } = useQuery(gql`
      query {
        products(first: 15) {
          data {
            name
            id
          }
        }
      }
    `);

    return {
      result,
      loading,
    };
  },
};
</script>

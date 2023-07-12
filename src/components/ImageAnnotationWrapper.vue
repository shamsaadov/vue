<template>
  <div>
    <div v-if="spareParts && spareParts.product">
      <select
        @change="updateSelectedProduct"
        :value="annotation.selectedProduct"
      >
        <option
          v-for="part in spareParts.product.spare_parts.data"
          :key="part.name"
          :value="part.name"
        >
          {{ part.name }}
        </option>
      </select>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import gql from "graphql-tag";
import { useQuery } from "@vue/apollo-composable";

const GET_SPARE_PARTS_QUERY = gql`
  query GetSpareParts {
    product(id: 10400) {
      image
      spare_parts(first: 99) {
        data {
          image
          description
          non_current
          name
        }
      }
    }
  }
`;

export default defineComponent({
  props: ["annotation", "index"],
  methods: {
    updateSelectedProduct(event) {
      console.log("index: ", this.index);
      console.log("value: ", event.target.value);
      this.$emit("product-selected", this.index, event.target.value);
    },
  },
  setup() {
    const { result: spareParts } = useQuery(GET_SPARE_PARTS_QUERY);
    return { spareParts };
  },
});
</script>

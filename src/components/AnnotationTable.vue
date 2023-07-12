<template>
  <table class="annotation">
    <tr>
      <th>Примечания</th>
      <th>Запасные части</th>
    </tr>
    <tr v-for="(annotation, index) in annotations" :key="index">
      <td :class="{ highlighted: index === hoveredIndex }">
        <div class="annotation-item">
          <div style="display: flex">
            <p
              v-if="!annotation.editing"
              @click="$emit('start-edit-text', annotation, $event)"
            >
              {{ annotation.textConfig.text }}
            </p>
            <input
              v-if="annotation.editing"
              type="text"
              v-model="annotation.textConfig.text"
              @blur="$emit('end-edit-text', annotation)"
              @keydown.enter="$emit('end-edit-text', annotation)"
            />
            <button
              id="delete_btn"
              @click="$emit('delete-annotation', index, $event)"
            >
              &#128465;
            </button>
            <button
              id="edit_btn"
              type="button"
              @click="$emit('toggle-edit', annotation, $event)"
            >
              {{ annotation.editing ? "&#128190;" : "&#9998;" }}
            </button>
          </div>
        </div>
      </td>
      <td>
        <ImageAnnotationWrapper
          :annotation="annotation"
          :index="index"
          @product-selected="productSelected"
        />
      </td>
    </tr>
  </table>
</template>

<script>
import ImageAnnotationWrapper from "./ImageAnnotationWrapper.vue";

export default {
  components: {
    ImageAnnotationWrapper,
  },
  props: {
    annotations: {
      type: Array,
      required: true,
    },
    hoveredIndex: {
      type: Number,
      default: null,
    },
  },
  methods: {
    productSelected(index, product) {
      this.$emit("update-selected-product", index, product);
    },
  },
};
</script>

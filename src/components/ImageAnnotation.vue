<template>
  <SettingsBtn
    :drawingEnabled="drawingEnabled"
    @toggleDrawingEnabled="toggleDrawingEnabled"
    @resetAnnotations="resetAnnotations"
    @logAnnotations="logAnnotations"
    @loadImage="loadImage"
  />

  <div style="position: relative">
    <Stage
      ref="stage"
      :annotations="annotations"
      :photo="photo"
      :drawingEnabled="drawingEnabled"
      :imageConfig="imageConfig"
      @onLineMouseover="onLineMouseover"
      @onLineMouseout="onLineMouseout"
      @changeCircleColor="changeCircleColor"
      @startDrawing="startDrawing"
      @draw="draw"
    />
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
                @click="startEditText(annotation, $event)"
              >
                {{ annotation.textConfig.text }}
              </p>
            </div>
            <input
              v-if="annotation.editing"
              type="text"
              v-model="annotation.textConfig.text"
              @blur="endEditText(annotation)"
              @keydown.enter="endEditText(annotation)"
            />
            <button id="delete_btn" @click="deleteAnnotation(index, $event)">
              &#128465;
            </button>
            <button
              id="edit_btn"
              type="button"
              @click="toggleEdit(annotation, $event)"
            >
              {{ annotation.editing ? "&#128190;" : "&#9998;" }}
            </button>
          </div>
        </td>
        <td>
          <ImageAnnotationWrapper
            :annotation="annotation"
            :index="index"
            @product-selected="updateSelectedProduct"
          />
        </td>
      </tr>
    </table>

    <AnnotationTable
      :annotations="annotations"
      :hoveredIndex="hoveredIndex"
      @delete-annotation="deleteAnnotation"
      @toggle-edit="toggleEdit"
      @start-edit-text="startEditText"
      @end-edit-text="endEditText"
      @update-selected-product="updateSelectedProduct"
    />
  </div>
</template>

<script>
import { useQuery } from "@vue/apollo-composable";
import gql from "graphql-tag";

import SettingsBtn from "./SettingsBtn.vue";
import Stage from "./Stage.vue";
import ImageAnnotationWrapper from "./ImageAnnotationWrapper.vue";
import AnnotationTable from "./AnnotationTable.vue";

const PRODUCTS_QUERY = gql`
  query {
    product(id: 10399) {
      id
      image
      spare_parts(first: 15) {
        data {
          id
          name
        }
      }
    }
  }
`;
export default {
  components: {
    SettingsBtn,
    Stage,
    AnnotationTable,
    ImageAnnotationWrapper,
  },
  data() {
    return {
      selectedProduct: null,
      photo: null,
      stageConfig: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      imageConfig: {
        x: 500,
        y: 0,
        image: null,
      },
      drawingEnabled: true,
      hoveredIndex: null,
      startCircleConfig: {
        x: 0,
        y: 0,
        radius: 25,
        fill: "blue",
        stroke: "black",
        strokeWidth: 1,
      },
      annotations: [],
      editing: false,
      editingText: "",
      editingAnnotation: null,
      textConfig: {
        text: "",
      },
      arrowConfig: {
        points: [0, 0, 0, 0],
      },
      productS: [],
    };
  },

  mounted() {
    const { result, loading, error } = useQuery(PRODUCTS_QUERY);
    this.productS = result;
    this.loadImage(
      "http://catalog-mtz.ru/api/storage/media/images/q4pigMWyPAxixBcyYgBNnxhZfGp8X41FxFNZBZ8C.jpeg?expires=1683898683&signature=9fbef924b0c8f9284ed8a31e1507f64889083d8152a578ba1a388342fe779bb0"
    );
    this.loadImage();
  },

  computed: {
    containerClass() {
      return {
        "crosshair-cursor": this.drawingEnabled,
      };
    },
  },

  methods: {
    updateSelectedProduct(index, product) {
      console.log("Выбранный индекс: ", index);
      console.log("Выбранная запчасть: ", product);
      if (this.annotations[index]) {
        this.annotations[index].selectedProduct = product;
      } else {
        console.log(`с таким индексом не нашел ${index}`);
      }
    },
    loadImage(url) {
      const imageObj = new Image();
      imageObj.src = url;
      imageObj.onload = () => {
        this.imageConfig.image = imageObj;
        this.$refs.stage.$refs.layer.getNode().batchDraw();
      };
    },

    logAnnotations() {
      this.annotations.forEach((annotation, index) => {
        console.log(`x: ${annotation.textConfig.x}`);
        console.log(`y: ${annotation.textConfig.y}`);
        console.log(`Текст примечания: ${annotation.textConfig.text}`);
        console.log(
          `Запасная часть: ${
            this.selectedProduct
              ? this.selectedProduct.name
              : "Ничего не выбрано"
          }`
        );
      });
    },

    resetAnnotations() {
      this.annotations = [];
    },

    changeCircleColor({ id, prop, color }) {
      this.annotations.forEach((annotation) => {
        if (annotation.id === id) {
          annotation[prop].fill = color;
        }
      });
    },

    toggleDrawingEnabled() {
      this.drawingEnabled = !this.drawingEnabled;
    },

    startDrawing(annotation) {
      if (annotation && typeof annotation === "object") {
        annotation.selectedProduct = null;
        this.annotations.push(annotation);
      } else {
        let newAnnotation = { selectedProduct: null };
        this.annotations.push(newAnnotation);
      }
    },

    draw(currentAnnotation) {
      this.annotations[this.annotations.length - 1] = currentAnnotation;
    },

    deleteAnnotation(index, event) {
      event.preventDefault();
      event.stopPropagation();
      this.annotations.splice(index, 1);
    },

    toggleEdit(annotation, event) {
      event.preventDefault();
      event.stopPropagation();

      annotation.editing = !annotation.editing;
      if (!annotation.editing) {
        this.endEditText(annotation);
      }
    },

    startEditText(annotation, event) {
      annotation.editing = true;
      this.editingAnnotation = annotation;
    },

    endEditText(annotation) {
      annotation.editing = false;
      this.editingAnnotation = null;
    },

    onLineMouseover(index) {
      this.hoveredIndex = index;
    },

    onLineMouseout() {
      this.hoveredIndex = null;
    },
  },
};
</script>

<style>
.highlighted {
  background-color: yellow;
}

.annotation {
  position: absolute;
  top: 10px;
}

#edit_btn {
  color: #444;
  background-color: #f4f4f4;
  border-radius: 5px;
  -webkit-box-shadow: none;
  box-shadow: none;
  border: 1px solid transparent;
  padding: 10px 20px;
  width: 50px;
  transition: all 0.3s ease;
}

#delete_btn {
  color: white;
  width: 50px;
  padding: 10px 20px;
  margin: auto;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: #dd4b39;
  border-color: #d73925;
}

#reset_btn {
  background-color: #f39c12;
  border-color: #e08e0b;
  margin-left: 1rem;
  border-radius: 3px;
  color: #ffffff;
  padding: 5px 10px;
}

.annotation {
  margin-top: 20px;
  border-collapse: collapse;
}

.annotation th,
.annotation td {
  padding: 8px;
  text-align: left;
}

.annotation th {
  font-weight: bold;
  border-bottom: 1px solid #ddd;
}

.annotation-item {
  display: flex;
  align-items: center;
  padding-bottom: 8px;
}

.annotation-item p:first-child {
  margin-right: 10px;
}

.highlighted {
  background-color: darkgrey;
}

td,
th {
  border: 1px solid #dddddd;
  text-align: left;
  padding: 8px;
}
</style>

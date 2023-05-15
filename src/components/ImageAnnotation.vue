<template>
  <div style="position: relative">
      <v-stage ref="stage" :config="stageConfig">
          <v-layer ref="layer">
              <v-image :config="imageConfig"></v-image>
              <v-line
                      v-for="(annotation, index) in annotations"
                      :key="index"
                      :config="annotation.arrowConfig"
              ></v-line>
              <v-circle
                      v-for="(annotation, index) in annotations"
                      :key="`start-${index}`"
                      :config="annotation.startCircleConfig"
                      @mouseover="changeCircleColor(annotation.startCircleConfig, 'green')"
                      @mouseout="changeCircleColor(annotation.startCircleConfig, 'red')"
                      @mousedown="startMovingStart(annotation)"
                      @mouseup="stopMovingStart"
              ></v-circle>

              <v-circle
                      v-for="(annotation, index) in annotations"
                      :key="`end-${index}`"
                      :config="annotation.endCircleConfig"
                      @mouseover="changeCircleColor(annotation.endCircleConfig, 'green')"
                      @mouseout="changeCircleColor(annotation.endCircleConfig, 'red')"
                      @mousedown="startMovingEnd(annotation)"
                      @mouseup="stopMovingEnd"
              ></v-circle>

          </v-layer>
      </v-stage>
      <div class="annotation">
          <div v-for="(annotation, index) in annotations" :key="index" >
             <div style="display: flex">
                 <p><strong>{{ index + 1 }})</strong></p>
                 <p v-if="!annotation.editing" @click="startEditText(annotation, $event)">{{ annotation.textConfig.text }}</p>
             </div>
              <input
                      v-if="annotation.editing"
                      type="text"
                      v-model="annotation.textConfig.text"
                      @blur="endEditText(annotation)"
                      @keydown.enter="endEditText(annotation)"
              />
              <button @click="deleteAnnotation(index)">Удалить</button>
              <button @click="toggleEdit(annotation)">{{ annotation.editing ? 'Сохранить' : 'Редактировать' }}</button>
          </div>
      </div>
  </div>
</template>

<script>
import Konva from "konva";
import img from "../assets/vue.png";

export default {
  data() {
    return {
      movingEnd: null,
        movingStart: null,
      stageConfig: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      imageConfig: {
        x: 500,
        y: 0,
        image: null,
      },
      annotations: [],
      startPoint: null,
      editing: false,
      editingText: "",
      editingAnnotation: null,
    };
  },
  mounted() {
    this.loadImage();
    this.$refs.stage.$el.addEventListener("mousedown", this.startDrawing);
    this.$refs.stage.$el.addEventListener("mousemove", this.draw);
    this.$refs.stage.$el.addEventListener("mouseup", this.stopDrawing);
  },
  methods: {
      loadImage() {
      const imageObj = new Image();
      imageObj.src = "http://catalog-mtz.ru/api/storage/media/images/q4pigMWyPAxixBcyYgBNnxhZfGp8X41FxFNZBZ8C.jpeg?expires=1683898683&signature=9fbef924b0c8f9284ed8a31e1507f64889083d8152a578ba1a388342fe779bb0";
      imageObj.onload = () => {
        this.imageConfig.image = imageObj;
        this.$nextTick(() => {
          this.$refs.layer.getNode().batchDraw();
        });
      };
    },

      startMovingEnd(annotation) {
          this.movingEnd = annotation;
      },


      stopMovingEnd() {
          this.movingEnd = null;
      },

      startDrawing(event) {
          if (this.editingAnnotation) return;
          if (this.movingEnd) return;
          if (this.editingAnnotation || this.movingEnd || this.movingStart) return;
          this.drawing = true;
          const stage = this.$refs.stage.getStage();
          const pos = stage.getPointerPosition();
          this.startPoint = { x: pos.x, y: pos.y };

          const circleConfig = {
              x: this.startPoint.x,
              y: this.startPoint.y,
              radius: 10,
              fill: 'red',
              stroke: 'black',
              strokeWidth: 1,
          };

          const arrowConfig = {
              points: [
                  this.startPoint.x,
                  this.startPoint.y,
                  this.startPoint.x,
                  this.startPoint.y,
              ],
              stroke: "blue",
              strokeWidth: 3,
              pointerLength: 10,
              pointerWidth: 10,
              tension: 0,
              draggable: false,
          };

          const textConfig = {
              x: 10,
              y: 10 + 30 * this.annotations.length,
              text: "Нажми на меня",
              fontSize: 18,
              draggable: false,
              editing: false,
          };

          this.annotations.push({
              id: Date.now(),
              arrowConfig,
              textConfig,
              startCircleConfig: circleConfig,
              endCircleConfig: { ...circleConfig },
          });
      },

      changeCircleColor(circleConfig, color) {
          circleConfig.fill = color;
      },

      deleteAnnotation(index) {
          this.annotations.splice(index, 1);
      },

      draw(event) {
          const stage = this.$refs.stage.getStage();
          const pos = stage.getPointerPosition();

          if (this.movingEnd) {
              this.movingEnd.endCircleConfig.x = pos.x;
              this.movingEnd.endCircleConfig.y = pos.y;
              this.movingEnd.arrowConfig.points[2] = pos.x;
              this.movingEnd.arrowConfig.points[3] = pos.y;
          } else if (this.movingStart) {
              this.movingStart.startCircleConfig.x = pos.x;
              this.movingStart.startCircleConfig.y = pos.y;
              this.movingStart.arrowConfig.points[0] = pos.x;
              this.movingStart.arrowConfig.points[1] = pos.y;
          } else if (this.startPoint) {
              const currentAnnotation = this.annotations[this.annotations.length - 1];
              currentAnnotation.arrowConfig.points = [
                  this.startPoint.x,
                  this.startPoint.y,
                  pos.x,
                  pos.y,
              ];
              currentAnnotation.endCircleConfig.x = pos.x;
              currentAnnotation.endCircleConfig.y = pos.y;
          }
      },

      startMovingStart(annotation) {
          this.movingStart = annotation;
      },

      stopMovingStart() {
          this.movingStart = null;
      },

      showInput(annotation, event) {
      if (!this.drawing) {
        this.editing = true;
        this.editingText = annotation.textConfig.text;
        this.editingAnnotation = annotation;
        const inputElement = this.$refs.input;
        inputElement.style.left = event.clientX + "px";
        inputElement.style.top = event.clientY + "px";
        inputElement.style.display = "block";
        inputElement.focus();
      }
    },

      removeAnnotation(annotation) {
          const index = this.annotations.findIndex(a => a.id === annotation.id);
          if (index !== -1) {
              this.annotations.splice(index, 1);
          }
      },

      stopDrawing() {
          this.startPoint = null;
          this.movingEnd = null;
          this.movingStart = null;
      },


      toggleEdit(annotation) {
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

      logAnnotations() {
      console.log("Annotations:");
      this.annotations.forEach((annotation, index) => {
        console.log(`Annotation ${index + 1}:`);
        console.log(`x: ${annotation.textConfig.x}`);
        console.log(`y: ${annotation.textConfig.y}`);
        console.log(`Text: ${annotation.textConfig.text}`);
      });
    },

      getTextConfig(annotation, index) {
      return {
        ...annotation.textConfig,
        x: 10,
        y: 10 + 30 * index,
      };
    },
  },
};
</script>

<style>
.annotation {
    position: absolute;
    top: 10px;
}
button {
    color: white;
    font-size: 16px;
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: all 0.3s ease;
}

button:hover {
    opacity: 0.8;
}

button:nth-child(3) {
    background-color: red;
}

button:nth-child(3) {
    background-color: #ff0000;
}


button:nth-child(4) {
    background-color: blue;
}

</style>

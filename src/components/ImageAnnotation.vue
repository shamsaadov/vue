<template>
  <div style="position: relative">
    <div :class="containerClass">
      <v-stage ref="stage" :config="stageConfig">
        <v-layer ref="layer">
          <v-image :config="imageConfig"></v-image>
          <v-line
            v-for="(annotation, index) in annotations"
            :key="index"
            :config="annotation.arrowConfig"
            @mouseover.native="onLineMouseover(index)"
            @mouseout.native="onLineMouseout"
          ></v-line>

          <v-circle
            v-for="(annotation, index) in annotations"
            :key="`start-${index}`"
            :config="annotation.startCircleConfig"
            @mouseover="
              changeCircleColor(annotation.startCircleConfig, 'green')
            "
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
          <v-text
            v-for="(annotation, index) in annotations"
            :key="`text-${index}`"
            :config="{
              x: annotation.endCircleConfig.x - 30,
              y: annotation.endCircleConfig.y - 25,
              text: annotation.textConfig.text,
              fontSize: 18,
              draggable: false,
            }"
          ></v-text>
        </v-layer>
      </v-stage>
    </div>
    <div class="annotation">
      <div
        v-for="(annotation, index) in annotations"
        :key="index"
        :class="{ highlighted: index === hoveredIndex }"
      >
        <div style="display: flex">
          <p>
            <strong>{{ index + 1 }})</strong>
          </p>
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
        <button id="button_app" @click="deleteAnnotation(index, $event)">
          &#128465;
        </button>
        <button
          id="button_app"
          type="button"
          @click="toggleEdit(annotation, $event)"
        >
          {{ annotation.editing ? "&#128190;" : "&#9998;" }}
        </button>
      </div>
      <button id="button_app" class="btn" @click="toggleDrawingEnabled($event)">
        {{ drawingEnabled ? "Выключить" : "Включить" }}
      </button>
    </div>
  </div>
</template>

<script>
import Konva from "konva";
import img from "../assets/vue.png";
import gql from "graphql-tag";

export default {
  data() {
    return {
      movingEnd: null,
      drawingEnabled: true,
      hoveredIndex: null,
      movingStart: null,
      stageConfig: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      startCircleConfig: {
        x: 0,
        y: 0,
        radius: 25,
        fill: "blue",
        stroke: "black",
        strokeWidth: 1,
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

  computed: {
    containerClass() {
      return {
        "crosshair-cursor": this.drawingEnabled,
      };
    },
  },

  methods: {
    loadImage() {
      const imageObj = new Image();
      imageObj.src =
        "http://catalog-mtz.ru/api/storage/media/images/q4pigMWyPAxixBcyYgBNnxhZfGp8X41FxFNZBZ8C.jpeg?expires=1683898683&signature=9fbef924b0c8f9284ed8a31e1507f64889083d8152a578ba1a388342fe779bb0";
      imageObj.onload = () => {
        this.imageConfig.image = imageObj;
        this.$nextTick(() => {
          this.$refs.layer.getNode().batchDraw();
        });
      };
    },

    startMovingStart(annotation) {
      this.movingStart = annotation;
      this.changeCircleColor(annotation.startCircleConfig, "green");
    },

    stopMovingStart(annotation) {
      this.movingStart = null;
      this.changeCircleColor(annotation.startCircleConfig, "red");
    },

    changeCircleColor(circleConfig, color) {
      circleConfig.fill = color;
    },

    toggleDrawingEnabled(event) {
      event.preventDefault();
      event.stopPropagation();

      this.drawingEnabled = !this.drawingEnabled;
    },

    startMovingEnd(annotation) {
      this.movingEnd = annotation;
    },

    stopMovingEnd() {
      this.movingEnd = null;
    },

    startDrawing(event) {
      if (this.editingAnnotation) return;
      if (!this.drawingEnabled) return;
      if (this.movingEnd) return;
      if (this.editingAnnotation || this.movingEnd || this.movingStart) return;
      this.drawing = true;
      const stage = this.$refs.stage.getStage();
      const pos = stage.getPointerPosition();
      this.startPoint = { x: pos.x, y: pos.y };

      const circleConfig = {
        x: this.startPoint.x,
        y: this.startPoint.y,
        radius: 5,
        fill: "darkblue",
        stroke: "darkblue",
        strokeWidth: 1,
      };

      const arrowConfig = {
        points: [
          this.startPoint.x,
          this.startPoint.y,
          this.startPoint.x,
          this.startPoint.y,
        ],
        stroke: "darkblue",
        strokeWidth: 3,
        pointerLength: 10,
        pointerWidth: 10,
        tension: 0,
        draggable: false,
      };

      const textConfig = {
        x: 10,
        y: 10 + 30 * this.annotations.length,
        text: "Примечание",
        fontSize: 18,
        draggable: false,
        editing: false,
      };

      this.annotations.push({
        id: Date.now(),
        arrowConfig,
        textConfig,
        startCircleConfig: circleConfig,
        endCircleConfig: { ...circleConfig, radius: 10 },
      });
    },

    deleteAnnotation(index, event) {
      event.preventDefault();
      event.stopPropagation();
      this.annotations.splice(index, 1);
    },

    draw(event) {
      const stage = this.$refs.stage.getStage();
      const pos = stage.getPointerPosition();

      if (!this.drawingEnabled) return;
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

    stopDrawing() {
      if (!this.drawingEnabled) return;
      this.startPoint = null;
      this.movingEnd = null;
      this.movingStart = null;
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

    changeRectColor(rectConfig, color) {
      rectConfig.fill = color;
      if (color === "green") {
        rectConfig.fill = "darkgray";
      }
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
#button_app {
  color: white;
  font-size: 16px;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s ease;
}

#button_app:hover {
  opacity: 0.8;
}

#button_app:nth-child(3) {
  background-color: red;
}

#button_app:nth-child(3) {
  background-color: #ff0000;
}

#button_app:nth-child(4) {
  background-color: blue;
}

.btn {
  margin-top: 2rem;
  background-color: #213547;
}

.crosshair-cursor {
  cursor: crosshair;
}
</style>

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
      <div>
        <button id="add_photo_btn" @click="addPhoto">Добавить фото</button>
        <img v-if="photo" :src="photo" alt="Изображение" />
      </div>
      <button id="save_btn" @click="logAnnotations">Сохранить</button>
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
      <button id="enable_btn" class="btn" @click="toggleDrawingEnabled($event)">
        {{ drawingEnabled ? "Выключить" : "Добавить" }}
      </button>
      <button id="reset_btn" @click="resetAnnotations">Сбросить</button>
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
      movingEnd: null,
      drawingEnabled: true,
      hoveredIndex: null,
      movingStart: null,
      startCircleConfig: {
        x: 0,
        y: 0,
        radius: 25,
        fill: "blue",
        stroke: "black",
        strokeWidth: 1,
      },
      annotations: [],
      startPoint: null,
      editing: false,
      editingText: "",
      editingAnnotation: null,
      textConfig: {
        text: "",
      },
      arrowConfig: {
        points: [0, 0, 0, 0],
      },
    };
  },
  mounted() {
    this.loadImage(
      "http://catalog-mtz.ru/api/storage/media/images/q4pigMWyPAxixBcyYgBNnxhZfGp8X41FxFNZBZ8C.jpeg?expires=1683898683&signature=9fbef924b0c8f9284ed8a31e1507f64889083d8152a578ba1a388342fe779bb0"
    );
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
    loadImage(url) {
      const imageObj = new Image();
      imageObj.src = url;
      imageObj.onload = () => {
        this.imageConfig.image = imageObj;
        this.$refs.layer.getNode().batchDraw();
      };
    },

    logAnnotations() {
      this.annotations.forEach((annotation, index) => {
        console.log(`x: ${annotation.textConfig.x}`);
        console.log(`y: ${annotation.textConfig.y}`);
        console.log(`Text: ${annotation.textConfig.text}`);
      });
    },

    resetAnnotations() {
      this.annotations = [];
    },

    addPhoto() {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = (event) => {
        const file = event.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            this.loadImage(e.target.result);
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
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

#save_btn {
  background-color: #3c8dbc;
  padding: 5px 10px;
  border-radius: 3px;
  border: 1px solid transparent;
  color: #fff;
  margin-left: 51rem;
  margin-top: 1rem;
}

#enable_btn {
  background-color: #5cb85c;
  padding: 5px 10px;
  font-size: 12px;
  line-height: 1.5;
  border-radius: 3px;
  box-shadow: none;
  border: 1px solid transparent;
  color: #fff;
}

#add_photo_btn {
  background-color: #3c8dbc;
  border: 1px solid transparent;

  padding: 10px 10px;
  color: #fff;
  margin-left: 50rem;
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

.btn {
  margin-top: 2rem;
  background-color: #213547;
}

.crosshair-cursor {
  cursor: crosshair;
}
</style>

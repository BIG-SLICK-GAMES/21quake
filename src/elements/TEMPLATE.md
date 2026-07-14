# Element Template Format

Each visible game element gets its own file in this folder.

```js
export default {
  id: "uniqueElementId",
  selector: "#domSelector",
  name: "Display Name",
  function: "What this element does in the game",
  visible: "y",
  properties: {
    position: { left: "0%", top: "0%" },
    size: { width: "10%", height: "10%" },
    rotation: "0deg",
    scale: 1,
    layer: 10
  },
  assets: {
    image: "./assets/example.png"
  },
  scripts: ["functionNameUsedByGame"]
};
```

Use `visible: "y"` to show an element and `visible: "n"` to hide it.

Position and size values should live in the element file itself. Do not use the removed `master-controls.css` file for new positioning.

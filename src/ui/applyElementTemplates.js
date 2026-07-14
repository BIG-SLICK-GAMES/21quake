import { elementTemplates } from "../elements/index.js";

function applyBox(el, template) {
  const { position, size, rotation, scale, layer } = template.properties || {};
  if (position?.left) el.style.left = position.left;
  if (position?.top) el.style.top = position.top;
  if (size?.width) el.style.width = size.width;
  if (size?.height) el.style.height = size.height;
  if (layer !== undefined) el.style.zIndex = String(layer);
  if ((rotation && rotation !== "0deg") || (scale !== undefined && scale !== 1)) {
    const rotationValue = rotation || "0deg";
    const scaleValue = scale ?? 1;
    el.style.transform = `rotate(${rotationValue}) scale(${scaleValue})`;
  }
}

export function applyElementTemplates(root = document) {
  elementTemplates.forEach((template) => {
    const el = root.querySelector(template.selector);
    if (!el) return;
    const isVisible = template.visible === true || template.visible === "y";
    el.dataset.templateName = template.name;
    el.dataset.templateFunction = template.function;
    el.dataset.visible = String(template.visible);
    el.hidden = !isVisible;
    applyBox(el, template);
  });
}

export { elementTemplates };

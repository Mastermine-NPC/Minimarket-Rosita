import { products } from "./catalog";
export const productImages = [
  {
    key: "none",
    label: "Marcador · fotografía pendiente",
    src: "",
    index: undefined as number | undefined,
    illustration: false,
  },
  ...products
    .filter((p) => p.imageIndex !== undefined)
    .map((p) => ({
      key: "atlas-" + p.imageIndex,
      label: p.name + " · foto del prototipo",
      src: "",
      index: p.imageIndex,
      illustration: false,
    })),
  ...[
    ["cookies", "Galletas · ilustración"],
    ["measure", "Cinta métrica · ilustración"],
    ["cable", "Cable USB · ilustración"],
    ["ball", "Pelota · ilustración"],
    ["notebook", "Cuaderno · ilustración"],
    ["paste", "Pasta dental · ilustración"],
  ].map(([key, label]) => ({
    key: "illustration-" + key,
    label,
    src: "/images/illustrations/" + key + ".svg",
    index: undefined,
    illustration: true,
  })),
];
export const defaultImageKey = (id: string, index?: number) =>
  index !== undefined
    ? "atlas-" + index
    : {
          "ROS-019": "cookies",
          "ROS-020": "measure",
          "ROS-021": "cable",
          "ROS-022": "ball",
          "ROS-023": "notebook",
          "ROS-024": "paste",
        }[id]
      ? "illustration-" +
        (
          {
            "ROS-019": "cookies",
            "ROS-020": "measure",
            "ROS-021": "cable",
            "ROS-022": "ball",
            "ROS-023": "notebook",
            "ROS-024": "paste",
          } as Record<string, string>
        )[id]
      : "none";

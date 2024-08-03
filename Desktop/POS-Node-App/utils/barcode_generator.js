import { createCanvas } from "canvas";
import JsBarcode from "jsbarcode";

export const generateBarcode = (text)=>{ 
  const canvas = createCanvas();
  JsBarcode(canvas,text, { 
    format:"CODE128",
    width: 2,
    height: 100,
  });
  return canvas.toDataURL("image/png");
}
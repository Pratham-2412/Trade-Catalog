import { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";

const Barcode = ({ value, format = "CODE128", width = 2, height = 50, displayValue = true }) => {
  const barcodeRef = useRef(null);

  useEffect(() => {
    if (barcodeRef.current && value) {
      try {
        JsBarcode(barcodeRef.current, value, {
          format,
          width,
          height,
          displayValue,
          fontSize: 14,
          margin: 10,
          background: "transparent",
        });
      } catch (error) {
        console.error("Barcode generation error:", error);
      }
    }
  }, [value, format, width, height, displayValue]);

  return <svg ref={barcodeRef}></svg>;
};

export default Barcode;

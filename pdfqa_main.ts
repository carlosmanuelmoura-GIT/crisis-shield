import fs from "fs";
import jsPDF from "jspdf";
(jsPDF as any).prototype.save = function (name: string) {
  const buf = Buffer.from(this.output("arraybuffer"));
  fs.writeFileSync("/tmp/pdfqa/out.pdf", buf);
  console.log("saved", name, buf.length);
};
import("./pdfqa_t.ts");

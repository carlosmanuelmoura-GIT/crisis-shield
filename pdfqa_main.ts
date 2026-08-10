import fs from "fs";
import mod from "jspdf";
const J: any = (mod as any).jsPDF ?? mod;
console.log("proto?", typeof J, !!J.prototype);
J.prototype.save = function (name: string) {
  const buf = Buffer.from(this.output("arraybuffer"));
  fs.writeFileSync("/tmp/pdfqa/out.pdf", buf);
  console.log("saved", name, buf.length);
  return this;
};
await import("./pdfqa_t.ts");

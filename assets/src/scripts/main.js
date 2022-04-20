import * as sample from "../../__tests__/__comments/sample.js";
import { convertParagraphToLines, convertSourceToParagraph, removeAstric } from "../parser/module/utils.js";

const paragraphs = convertSourceToParagraph(sample.c)
const removedAstricParagraphs = paragraphs.map(removeAstric);
const result = convertParagraphToLines(removedAstricParagraphs);
console.log(result)
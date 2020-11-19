// class MarkdownView {
//   constructor(target, content) {
//     this.textarea = target.appendChild(document.createElement("textarea"))
//     this.textarea.value = content
//   }

//   get content() { return this.textarea.value }
//   focus() { this.textarea.focus() }
//   destroy() { this.textarea.remove() }
// }

import { EditorView } from "prosemirror-view";
import { EditorState } from "prosemirror-state";
import {
  schema,
  defaultMarkdownParser,
  defaultMarkdownSerializer,
} from "prosemirror-markdown";
import { exampleSetup } from "prosemirror-example-setup";

let $title = document.querySelector("#title");
class ProseMirrorView {
  constructor(target) {
    let divContent = document.querySelector("#content");
    const defaultContent = divContent.value;
    const wordCounter = document.querySelector("#wc");
    let content = "";
    let localDraft = localStorage.getItem(window.draftKey);

    if (localDraft) {
      content = localDraft;
      // setting initial word count
      const wordCount = content.split(" ").filter((i) => i).length;
      wordCounter.innerText = wordCount + " word" + (wordCount != 1 ? "s" : "");
    }

    // if no draft+PostId in the localStorage use hidden div.value as content
    if (window.draftKey && window.draftKey != "lastDoc" && content == "") {
      content = defaultContent;
    }

    if (content.indexOf("# ") === 0) {
      let eol = content.indexOf("\n");
      let title = content.substring("# ".length, eol);
      content = content.substring(eol + "\n\n".length);
      $title.value = title;
    }

    const doc = defaultMarkdownParser.parse(content);

    this.view = new EditorView(target, {
      state: EditorState.create({
        doc,
        plugins: exampleSetup({ schema }),
      }),
      dispatchTransaction(transaction) {
        const content = defaultMarkdownSerializer.serialize(transaction.doc);
        // set hidden div for backup
        divContent.value = content;

        let draft = "";
        if ($title.value != null && $title.value !== "") {
          draft = "# " + $title.value + "\n\n";
        }
        draft += content;
        localStorage.setItem(window.draftKey, draft);

        //setting word counter value
        const wordCount = draft.split(" ").filter((i) => i).length;
        wordCounter.innerText =
          wordCount + " word" + (wordCount != 1 ? "s" : "");

        let newState = this.state.apply(transaction);
        this.updateState(newState);
      },
    });
  }

  get content() {
    return defaultMarkdownSerializer.serialize(this.view.state.doc);
  }
  focus() {
    this.view.focus();
  }
  destroy() {
    this.view.destroy();
  }
}
let place = document.querySelector("#editor");
setTimeout(() => {
  const view = new ProseMirrorView(place);
  window.editorInstance = view;
}, 0);

// document.querySelectorAll("input[type=radio]").forEach(button => {
//   button.addEventListener("change", () => {
//     if (!button.checked) return
//     let View = button.value == "markdown" ? MarkdownView : ProseMirrorView
//     if (view instanceof View) return
//     let content = view.content
//     view.destroy()
//     view = new View(place, content)
//     view.focus()
//   })
// })

import { useState } from "react";
import { createEditor } from "slate";
import { Slate, Editable, withReact } from "slate-react";

const initialValue = [
  {
    type: "paragraph",
    children: [{ text: "A line of text in a paragraph" }],
  },
];

const SlateComponent = () => {
  const [editor] = useState(() => withReact(createEditor()));

  return (
    <Slate editor={editor} initialValue={initialValue}>
      <Editable
        onKeyDown={(event) => {
          if (event.key === "&") {
            event.preventDefault();
            editor.insertText("and");
          }
        }}
      />
    </Slate>
  );
};

export default SlateComponent;

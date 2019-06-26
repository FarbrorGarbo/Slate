import * as React from "react";
import { Editor } from "slate-react";
import Html from "slate-html-serializer";
import DeepTable from "slate-deep-table";
import Lists from "@convertkit/slate-lists";

const BLOCK_TAGS = {
  h1: "heading-one",
  h2: "heading-two",
  h3: "heading-three",
  h4: "heading-four",
  h5: "heading-five",
  h6: "heading-six",
  p: "paragraph",
  table: "table",
  tr: "table_row",
  td: "table_cell",
  ul: "bulleted-list",
  ol: "numbered-list",
  li: "list-item",
  img: "image",
  hr: "hr"
};

const INLINE_TAGS = {
  a: "link"
};

// Add a dictionary of mark tags.
const MARK_TAGS = {
  strong: "bold",
  em: "italic",
  u: "underlined",
  span: "span",
  sub: "sub",
  sup: "sup"
};

export const schema = {
  document: {
    nodes: [
      {
        match: [
          { type: "heading-one" },
          { type: "heading-two" },
          { type: "heading-three" },
          { type: "heading-four" },
          { type: "heading-five" },
          { type: "heading-six" },
          { type: "paragraph" },
          { type: "table" },
          { type: "table_row" },
          { type: "table_cell" },
          { type: "bulleted-list" },
          { type: "numbered-list" },
          { type: "list-item" },
          { type: "list-item-child" },
          { type: "image" },
          { type: "link" },
          { type: "hr" },
          { type: "span" }
        ]
      }
    ]
  },
  blocks: {
    image: {
      isVoid: true
    }
  }
};

const rules = [
  {
    deserialize(el, nextFn) {
      const type = BLOCK_TAGS[el.tagName.toLowerCase()];
      // console.log("deserialize BLOCK", type, el.childNodes, el);
      if (type) {
        return {
          object: "block",
          type: type,
          data: {
            id: el.getAttribute("id"),
            name: el.getAttribute("name"),
            src: el.getAttribute("src"),
            href: el.getAttribute("href"),
            className: el.getAttribute("class")
          },
          nodes: nextFn(el.childNodes)
        };
      }
    },
    serialize(obj, children) {
      if (obj.object === "block") {
        switch (obj.type) {
          case "heading-one":
            return <h1 className={obj.data.get("className")}>{children}</h1>;
          case "heading-two":
            return <h2 className={obj.data.get("className")}>{children}</h2>;
          case "heading-three":
            return <h3 className={obj.data.get("className")}>{children}</h3>;
          case "heading-fore":
            return <h4 className={obj.data.get("className")}>{children}</h4>;
          case "heading-five":
            return <h5 className={obj.data.get("className")}>{children}</h5>;
          case "heading-six":
            return <h6 className={obj.data.get("className")}>{children}</h6>;
          case "paragraph":
            return <p className={obj.data.get("className")}>{children}</p>;
          case "image":
            return (
              <img
                alt={""}
                src={obj.data.get("src")}
                className={obj.data.get("className")}
              />
            );
          case "table":
            const headers = !obj.data.get("headless");
            const rows = children;
            const split =
              !headers || !rows || !rows.size || rows.size === 1
                ? { header: null, rows: rows }
                : {
                    header: rows.get(0),
                    rows: rows.slice(1)
                  };
            return (
              <table>
                {headers && split.header !== null && (
                  <thead>{split.header}</thead>
                )}
                <tbody>{split.rows}</tbody>
              </table>
            );
          case "table_row":
            return <tr>{children}</tr>;
          case "table_cell":
            return <td>{children}</td>;
          case "numbered-list":
            return <ol className={obj.data.get("className")}>{children}</ol>;
          case "bulleted-list":
            return <ul className={obj.data.get("className")}>{children}</ul>;
          case "list-item":
            return <li className={obj.data.get("className")}>{children}</li>;
          case "list-item-child":
            return <p className={obj.data.get("className")}>{children}</p>;
          default:
            return "";
        }
      }
    }
  },
  {
    deserialize(el, nextFn) {
      const type = INLINE_TAGS[el.tagName.toLowerCase()];
      // console.log("deserialize INLINE", type, el.childNodes, el);

      if (type) {
        // console.log(type);
        if (
          type === "link" &&
          el.childNodes.length === 0 &&
          el.getAttribute("name") !== ""
        ) {
          // Converts depricated anchors from <a name="oldName"> to <span id="oldName"> </span> with an empty space.
          // Perhaps we should have a better fix for this?
          return {
            object: "mark",
            type: "span",
            data: {
              id: el.getAttribute("name"),
              className: "anchor"
            },
            nodes: nextFn([
              { nodeName: "#text", nodeValue: "Deprecated anchor link" }
            ])
          };
        }
        return {
          object: "inline",
          type: type,
          data: {
            href: el.getAttribute("href")
          },
          nodes: nextFn(el.childNodes)
        };
      }
    },
    serialize(obj, children) {
      if (obj.object === "inline") {
        switch (obj.type) {
          case "link":
            return <a href={obj.data.get("href")}>{children}</a>;
          default:
            return null;
        }
      }
    }
  },
  {
    deserialize(el, nextFn) {
      const type = MARK_TAGS[el.tagName.toLowerCase()];
      // console.log("deserialize MARK", type, el.getAttribute && el.getAttribute("name"));

      if (type) {
        return {
          object: "mark",
          type: type,
          data: {
            id: el.getAttribute("id")
          },
          nodes: nextFn(el.childNodes)
        };
      }
    },
    serialize(obj, children) {
      if (obj.object === "mark") {
        switch (obj.type) {
          case "bold":
            return (
              <strong className={obj.data.get("className")}>{children}</strong>
            );
          case "underline":
            return <u className={obj.data.get("className")}>{children}</u>;
          case "italic":
            return <i className={obj.data.get("className")}>{children}</i>;
          case "span":
            return (
              <span className={obj.data.get("className")}>{children}</span>
            );
          case "sub":
            return <sub className={obj.data.get("className")}>{children}</sub>;
          case "sup":
            return <sup className={obj.data.get("className")}>{children}</sup>;
          default:
            return "";
        }
      }
    }
  }
];

export const plugins = [
  DeepTable(), // <-- Nesessary for rendering and editing tables
  Lists({
    blocks: {
      ordered_list: "numbered-list",
      unordered_list: "bulleted-list",
      list_item: "list-item"
    },
    classNames: {
      ordered_list: "numbered-list",
      unordered_list: "bulleted-list",
      list_item: "list-item"
    }
  })
];

export class SlateView extends React.Component {
  // _editorRef;	// <-- Nesessary for derived SlateEditor class.
  // _htmlSerializer;

  constructor(_props) {
    super(_props);

    this._htmlSerializer = new Html({ rules: rules });
    this.state = this._getInitialState();
  }

  componentDidMount() {
    this.props.pageLoaded && this.props.pageLoaded();
  }

  componentDidUpdate(prevProps, prevState) {
    const htmlChanged = prevProps.document !== this.props.document;

    if (htmlChanged) {
      this.setState({
        value: this._getHtmlValue(this.props.document)
      });

      if (this.props.pageLoaded) this.props.pageLoaded();
    }
  }

  render() {
    const { readOnly } = this.props;
    return (
      <div>
        <button
          onClick={() => {
            console.log(this._htmlSerializer.serialize(this.state.value));
          }}
        >
          Serialize
        </button>
        <button>Make list</button>
        <Editor
          schema={schema}
          readOnly={readOnly}
          ref={this.setEditorRef}
          value={this.state.value}
          onChange={this.onChange}
          spellCheck={false}
          renderNode={this.renderNode}
          renderMark={this.renderMark}
          plugins={plugins}
          autoFocus
        />
      </div>
    );
  }

  setEditorRef = ref => {
    this._editorRef = ref;
  };

  onChange = ({ value }) => {
    this.setState({
      value
    });
  };

  /**
   * Render a Slate node.
   *
   * @param {Object} props
   * @return {Element}
   */
  renderNode = (props, editor, next) => {
    const { node, attributes, children, isFocused } = props;
    // console.log("_renderNode", node.type, children);
    switch (node.type) {
      case "heading-one":
        // console.log("heading-one", node, attributes, children);
        return (
          <h1 id={node.data.get("id")} {...attributes}>
            {children}
          </h1>
        );
      case "heading-two":
        return (
          <h2 id={node.data.get("id")} {...attributes}>
            {children}
          </h2>
        );
      case "heading-three":
        return (
          <h3 id={node.data.get("id")} {...attributes}>
            {children}
          </h3>
        );
      case "heading-four":
        return (
          <h4 id={node.data.get("id")} {...attributes}>
            {children}
          </h4>
        );
      case "heading-five":
        return (
          <h5 id={node.data.get("id")} {...attributes}>
            {children}
          </h5>
        );
      case "heading-six":
        return (
          <h6 id={node.data.get("id")} {...attributes}>
            {children}
          </h6>
        );
      case "paragraph":
        return (
          <p id={node.data.get("id")} {...attributes}>
            {children}
          </p>
        );
      /*case "table":				Let the table plugin handle this
				return (
					<table>
						<tbody {...attributes}>{children}</tbody>
					</table>);*/
      /*case "table_head":
				return <thead {...attributes}>{children}</thead>;
			case "table_body":
				return <tbody {...attributes}>{children}</tbody>;
			case "table_row":
				return <tr {...attributes}>{children}</tr>;
			case "table_cell":
				return <td {...attributes}>{children}</td>;*/
      case "block-quote":
        return (
          <blockquote id={node.data.get("id")} {...attributes}>
            {children}
          </blockquote>
        );
      case "bulleted-list":
        return (
          <ul id={node.data.get("id")} {...attributes}>
            {children}
          </ul>
        );
      case "numbered-list":
        return (
          <ol id={node.data.get("id")} {...attributes}>
            {children}
          </ol>
        );
      case "list-item":
        return (
          <li id={node.data.get("id")} {...attributes}>
            {children}
          </li>
        );
      case "list-item-child":
        return (
          <span id={node.data.get("id")} {...attributes}>
            {children}
          </span>
        );
      case "image":
        const src = node.data.get("src");
        return (
          <img
            alt={""}
            id={node.data.get("id")}
            src={src}
            selected={isFocused}
            {...attributes}
          />
        );
      case "link":
        return (
          <a
            href={node.data.get("href")}
            id={node.data.get("name") || node.data.get("id")}
            {...attributes}
          >
            {children}
          </a>
        );
      case "a":
        console.log("a", node, attributes, children);
        return (
          <a
            href={node.data.get("href")}
            id={node.data.get("name") || node.data.get("id")}
            {...attributes}
          >
            {children}
          </a>
        );
      case "hr":
        return <hr />;
      default:
        return next();
    }
  };

  /**
   * Render a Slate mark.
   *
   * @param {Object} props
   * @return {Element}
   */
  renderMark = (props, editor, next) => {
    const { mark, attributes, children } = props;
    const { data } = mark;
    // console.log("_renderMark", mark.type, data.get("name"));
    switch (mark.type) {
      case "italic":
        return <em {...attributes}>{children}</em>;
      case "bold":
        return <strong {...attributes}>{children}</strong>;
      case "underlined":
        return <u {...attributes}>{children}</u>;
      case "span":
        return (
          <span
            id={data.get("id")}
            className={data.get("className")}
            {...attributes}
          >
            {children}
          </span>
        );
      /*case "link":
				return (
					<a href={data.get("href")} id={data.get("name") || data.get("id")} {...attributes}>
						{children}
					</a>
				);*/
      case "sub":
        return <sub {...attributes}>{children}</sub>;
      case "sup":
        return <sup {...attributes}>{children}</sup>;
      default:
        return next();
    }
  };

  _getInitialState() {
    // console.log("_getInitialState");
    return {
      value: this._getHtmlValue(this.props.document)
    };
  }

  _getHtmlValue(document) {
    let htmlString = "";

    if (typeof document === "string") {
      htmlString = document;
    }
    // console.log(this._htmlSerializer.deserialize(htmlString));
    return this._htmlSerializer.deserialize(htmlString);
  }
}

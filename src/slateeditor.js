import * as React from "react";
import { Editor } from "slate-react";
import { SlateView, schema, plugins } from "./slateview";

const ToolbarMode = {
  TEXT: 0,
  ANCHOR: 1,
  LINK: 2,
  TABLE: 3,
  OBJECTS: 4
};

const DEFAULT_NODE = "paragraph";

export class SlateEditor extends SlateView {
  constructor(_props) {
    super(_props);

    this.state = {
      ...super._getInitialState(),
      toolbarMode: ToolbarMode.TEXT,
      // actionLinkType: ActionType.Realtime3D,
      selectionIsInTable: false
    };
  }

  render() {
    const { value } = this.state;
    const hasLink = value.inlines.some(inline => inline.type === "link");
    // const isRange = value.selection.isExpanded;

    return (
      <div className="page-editor-window">
        <button
          onClick={() => {
            this._editorRef.wrapList({ type: "numbered-list" });
          }}
        >
          Make list
        </button>
        <button
          onClick={() => {
            console.log(this._htmlSerializer.serialize(this.state.value));
          }}
        >
          Serialize
        </button>
        <div className="scroll-area">
          <Editor
            className={"edit-area"}
            schema={schema}
            readOnly={false}
            ref={this.setEditorRef}
            value={this.state.value}
            onChange={this._onChange}
            spellCheck={false}
            renderNode={this.renderNode}
            renderMark={this.renderMark}
            plugins={plugins}
            autoFocus
          />
        </div>
      </div>
    );
  }

  _onChange = newState => {
    const { value } = newState;
    // Update all anchor links
    const anchors = [];
    const bl = value.document.getBlocks();
    const ma = value.document.getMarks();
    bl.forEach(node => {
      const id = node.data.get("id");
      if (typeof id === "string") anchors.push(node.data.get("id"));
    });
    ma.forEach(node => {
      const id = node.data.get("id");
      if (typeof id === "string") anchors.push(node.data.get("id"));
    });
    const currentAncor =
      value.blocks.size === 1 ? value.blocks.get(0).data.get("id") : null;

    this.setState({
      value,
      selectionIsInTable: this._selectionIsInTable(),
      anchorLinks: anchors,
      currentAncor: currentAncor,
      numSelectedBlocks: value.blocks.size
    });
  };

  /*private _hasInline = (type: string) => {
		const { value } = this.state;
		return value.inlines.some(inline => inline!.type === type);
	}*/

  /*_renderFknButton = (label, type, appearance, disabled) => {
		return (
			<Button appearance={appearance} size={"small"} disabled={disabled} onMouseDown={e => this._onClickFkn(type)}>
				{label}
			</Button>
		);
	}*/

  async _onClickFkn(type) {
    switch (type) {
      case "save":
        break;
      case "text":
        this.setState({ toolbarMode: ToolbarMode.TEXT });
        break;
      case "anchor":
        this.setState({ toolbarMode: ToolbarMode.ANCHOR });
        break;
      case "link":
        this.setState({ toolbarMode: ToolbarMode.LINK });
        break;
      case "table":
        this.setState({ toolbarMode: ToolbarMode.TABLE });
        break;
      case "object":
        this.setState({ toolbarMode: ToolbarMode.OBJECTS });
        break;
      case "removeanchor":
        this._removeAnchor();
        break;
      case "removelink":
        this._removeLink();
        break;
      case "insertimage":
        this._insertImage();
        break;
      case "inserthr":
        this._insertHR();
        break;
      case "numbered-list":
        this._makeNumberedList();
        break;
      case "unordered-list":
        this._makeNumberedList();
        break;
      default:
        return null;
    }
  }

  /**
   * Check if the current selection has a mark with `type` in it.
   *
   * @param {string} type
   * @return {boolean}
   */
  _hasMark = type => {
    const { value } = this.state;
    return value.activeMarks.some(mark => mark.type === type);
  };

  /*_renderMarkButton = (label, type) => {
		const isActive = this._hasMark(type);

		return (
			<Button appearance={isActive ? "default" : "inverted"} size={"small"} disabled={false} onMouseDown={e => this._onClickMark(e, type)}>
				{label}
			</Button>
		);
	}*/

  /**
   * When a mark button is clicked, toggle the current mark.
   *
   * @param {Event} event
   * @param {string} type
   */
  _onClickMark = (event, type) => {
    event.preventDefault();
    this._editorRef.toggleMark(type);
  };

  /**
   * Check if the any of the currently selected blocks are of `type`.
   *
   * @param {String} type
   * @return {Boolean}
   */
  _hasBlock = type => {
    const { value } = this.state;
    return value.blocks.some(node => node.type === type);
  };

  /*_renderBlockButton = (label, type) => {
		let isActive = this._hasBlock(type);

		if (["numbered-list", "bulleted-list"].indexOf(type) >= 0) {
			const { value: { document, blocks } } = this.state;

			if (blocks.size > 0) {
				const parent = document.getParent(blocks.first().key);
				if (parent && parent.type) {
					isActive = this._hasBlock("list-item") && parent.type === type;
				}
			}
		}

		return (
			<Button appearance={isActive ? "default" : "inverted"} size={"small"} disabled={false} onMouseDown={e => this._onClickBlock(e, type)}>
				{label}
			</Button>
		);
	}*/

  _onClickBlock = (event, type) => {
    event.preventDefault();

    // const { value } = this._editorRef;

    switch (type) {
      case "numbered-list":
      case "bulleted-list":
        this._editorRef.wrapList({ type: type });
        break;
      case "unwrap-list":
        this._editorRef.unwrapList();
        break;
      default:
        const isActive = this._hasBlock(type);
        this._editorRef.setBlocks(isActive ? DEFAULT_NODE : type);
    }
  };

  /*_renderClassButton = () => {
		const { value } = this.state;
		const blocks = value.blocks;
		const multiple = ["<Multiple>"];
		let values = ["No class", "Note", "sparepart"];
		let classes = [];

		blocks.forEach((block) => {
			const currentClass = block && block.data.get("className");
			if (currentClass && classes.indexOf(currentClass) === -1) {
				classes.push(currentClass);
			} else {
				classes.push("");
			}
		});

		const disabled = classes.length > 1;
		let currentIndex = 0;

		if (disabled) {
			values = multiple;
		} else {
			currentIndex = values.indexOf(classes[0]);
		}

		return (
			<DropDown
				disabled={!blocks || values[currentIndex] === "<Multiple>"}
				size={"small"}
				itemLabels={values}
				items={values}
				value={values[currentIndex]}
				onValueChange={val => this._onClickClass(val)}
				notice={"Choose Class"}
				icon={"Style2"}
			/>
		);
	}*/

  /**
   * Set class on all block elements in current selected text.
   * If the class name IS "No class", it will remove the class name.
   * @param {type} string class name as string
   */
  _onClickClass = type => {
    const chosenType = type === "No class" ? null : type;
    const { value } = this.state;
    const blocks = value.blocks;

    blocks.forEach(block => {
      const currentClass = block && block.data.get("className");
      if (currentClass === null || currentClass !== chosenType) {
        const newData = block.data.set("className", chosenType);
        const newValue = this._editorRef.setNodeByKey(block.key, {
          data: newData
        });
        this._onChange(newValue);
      }
    });
  };

  _selectionIsInTable = () =>
    this._editorRef && this._editorRef.isSelectionInTable();

  /*_renderInsertTableButton = (type, selectionIsInTable) => {
		return (
			<Button appearance={"default"} size={"small"} disabled={false} onClick={() => selectionIsInTable ? this._addRemoveTable(false) : this._addRemoveTable(true)}>
				{selectionIsInTable ? "delete" : "grid_on"}
			</Button>
		);
	}

	_renderTableButton = (label, type, isSelectionInTable) => {
		return (
			<Button appearance={"default"} size={"small"} disabled={!isSelectionInTable} onMouseDown={() => this._onClickTableButton(type)}>
				{label}
			</Button>
		);
	}*/

  _addRemoveTable(val) {
    let newValue = this.state.value;
    if (val) {
      newValue = this._editorRef.insertTable(2, 1);
    } else {
      newValue = this._editorRef.removeTable();
    }
    this._onChange(newValue);
  }

  _onClickTableButton = type => {
    let newValue = this.state.value;
    switch (type) {
      case "insert_row":
        newValue = this._editorRef.insertRow();
        break;
      case "remove_row":
        newValue = this._editorRef.removeRow();
        break;
      case "insert_column":
        newValue = this._editorRef.insertColumn();
        break;
      case "remove_column":
        newValue = this._editorRef.removeColumn();
        break;
      default:
        break;
    }
    this._onChange(newValue);
  };

  /*_renderAddAnchorLinks() {
		const {value, currentAncor, anchorLinks, numSelectedBlocks} = this.state;
		const linkActive = value.inlines.some(inline => inline.type === "link");
		const isRange = value.selection.isExpanded;

		return (
			<DropDown
				disabled={numSelectedBlocks !== 1 || linkActive || !isRange || typeof currentAncor === "string" || anchorLinks.length < 1}
				size={"small"}
				itemLabels={["Add link to anchor...", ...anchorLinks]}
				items={[undefined, ...anchorLinks]}
				value={"Add link to anchor..."}
				onValueChange={val => this._createLink("#" + val)}
			/>
		);
	}*/

  /*private _createAnchorLink(href: string) {
		this._editorRef.wrapInline({
			type: "link",
			data: { href }
		});
	}*/

  _insertAnchor = idName => {
    const { value } = this.state;
    const blocks = value.blocks;

    blocks.forEach(block => {
      const currentId = block && block.data.get("id");
      if (currentId === null || currentId !== idName) {
        const newData = block.data.set("id", idName);
        const newValue = this._editorRef.setNodeByKey(block.key, {
          data: newData
        });
        this._onChange(newValue);
      }
    });
  };

  _removeAnchor = () => {
    const { value } = this.state;
    const blocks = value.blocks;

    blocks.forEach(block => {
      const newData = block.data.delete("id");
      const newValue = this._editorRef.setNodeByKey(block.key, {
        data: newData
      });
      this._onChange(newValue);
    });
  };

  _removeLink = () => {
    this._editorRef.unwrapInline("link");
  };

  /*_renderActionLinks = () => {
		const { value, numSelectedBlocks, actionLinkType } = this.state;
		const { allActions } = this.props;
		const linkActive = value.inlines.some(inline => inline.type === "link");
		const isRange = value.selection.isExpanded;

		const actionNames = allActions
			.filter(action => action.name !== "autozoom" && action.type === actionLinkType)
			.map(action => action.name);

		const actionItems = [undefined, ...actionNames];
		const actionItemLabels = ["Select action...", ...actionNames];

		return (
			<DropDown
				disabled={numSelectedBlocks !== 1 || linkActive || !isRange}
				size={"small"}
				itemLabels={actionItemLabels}
				items={actionItems}
				onValueChange={val => this._createLink("javascript:action('" + val + "')")}
			/>
		);
	}*/

  _createLink(href) {
    this._editorRef.wrapInline({
      type: "link",
      data: { href }
    });
  }

  /*_renderRadioButton() {
		const { actionLinkType } = this.state;
		const items = [ActionType.Realtime3D, ActionType.Image, ActionType.Video, ActionType.ExternalMedia, ActionType.Navigation, ActionType.Sequence];
		const itemLabels = ["3D", "Image", "Video", "Ext_Media", "Nav", "Sequence"];
		const selectedValue = items.indexOf(actionLinkType);
		return (
			<RadioButtons
				items={items}
				itemLabels={itemLabels}
				value={selectedValue}
				size={"small"}
				layout={"row"}
				onValueChange={val => this.setState({actionLinkType: val})}
			/>
		);
	}*/

  _insertImage = async () => {
    const { baseURI } = this.props;
    const pickedFile = await this._onPickFile();

    if (!pickedFile) return;

    const src = baseURI + "/image/" + pickedFile;

    this._editorRef.insertBlock({
      type: "image",
      data: { src }
    });
  };

  /*_onPickFile = async () => {
		const {manualPath} = this.props;
		const destinationDir = "image";
		const dialogLabel = "Image";
		const dialogExtensions = ["png", "jpg"];
		const pickedFile = await new Promise(resolve => {
			const bridgeAPI = getBridgeAPI();

			if (!bridgeAPI) {
				alert("Only supported when running in electron!");
				return "null";
			}

			bridgeAPI.io.pickFileRelativeToManual(
				manualPath, destinationDir, dialogLabel, dialogExtensions,
				(filename, err) => resolve(err ? null : filename)
			);
		});

		if (pickedFile !== null) {
			return pickedFile;
		}
	};*/

  _insertHR = async () => {
    this._editorRef.insertBlock({
      type: "hr",
      data: {}
    });
  };

  _makeNumberedList = () => {
    console.log("numbered list");
  };
}

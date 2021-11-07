import { buildChildren, buildParents } from "./tree-helpers";

export interface TreeItem {
  value: string;
  label: string;
  level: number;
}

export interface TreeOptions {
  items: TreeItem[];
  onStateChange: (values: string[]) => void;
  onBack: () => void;
  container: HTMLElement;
  caption: string;
}

export class MenuComponent {
  private elements: Record<string, HTMLElement> = {};
  private children: Record<string, string[]>;
  private values: string[] = [];
  private tempValues: string[] = [];
  private onBack: () => void;
  private onStateChange: (values: string[]) => void;

  constructor(options: TreeOptions) {
    const menuElement = buildMenuDom();
    findChild(menuElement, ".menu-header .caption").innerText = options.caption;
    findChild(menuElement, ".menu-back-button").addEventListener("click", () =>
      this.onBackClick()
    );
    findChild(menuElement, ".menu-apply-button").addEventListener("click", () =>
      this.onApplyClick()
    );
    findChild(menuElement, ".menu-clear-button").addEventListener("click", () =>
      this.onClearClick()
    );
    findChild(menuElement, ".menu-filter .input").addEventListener(
      "input",
      (e: any) => this.onFilterInput(e.target.value)
    );

    this.onBack = options.onBack;
    this.onStateChange = options.onStateChange;
    options.container.appendChild(menuElement);
    this.children = buildChildren(buildParents(options.items));

    const itemContainerElement = findChild(menuElement, ".menu-items");

    for (const item of options.items) {
      const { value, label, level } = item;
      const itemElement = buildItemDom();

      findChild(itemElement, ".menu-item-arrow").style.marginLeft = `${
        level * 20
      }px`;
      findChild(itemElement, ".menu-item-label").innerText = label;
      findChild(itemElement, ".menu-item-checkbox").addEventListener(
        "click",
        () => this.onCheckboxClick(value)
      );
      findChild(itemElement, ".menu-item-arrow").addEventListener("click", () =>
        this.onArrowClick(value)
      );

      if (this.children[value].length === 0) {
        itemElement.classList.add("nochild");
      }

      this.elements[value] = itemElement;
      itemContainerElement.appendChild(itemElement);
    }
  }

  public setState(values: string[]) {
    this.values = values;
    this.tempValues = values;
    this.displayValues();
  }

  private onArrowClick(value: string) {
    const element = this.elements[value];
    const isHidden = !element.classList.contains("closed");

    if (isHidden) {
      element.classList.add("closed");
    } else {
      element.classList.remove("closed");
    }

    this.toggleItems(this.children[value], isHidden);
  }

  private onCheckboxClick(value: string) {
    const isSelected = this.tempValues.some((x) => x === value);

    if (isSelected) {
      this.tempValues = this.tempValues.filter((x) => x !== value);
    } else {
      this.tempValues.push(value);
    }

    this.displayValues();
  }

  private onFilterInput(value: string) {
    for (const itemDom of Object.values(this.elements)) {
      const label = itemDom.innerText;

      if (label.includes(value)) {
        itemDom.classList.remove("filtered");
      } else {
        itemDom.classList.add("filtered");
      }
    }
  }

  private onApplyClick() {
    this.values = this.tempValues;
    this.onStateChange(this.values);
  }

  private onClearClick() {
    this.tempValues = [];
    this.displayValues();
  }

  private onBackClick() {
    this.tempValues = this.values;
    this.displayValues();
    this.onBack();
  }

  private displayValues() {
    for (const element of Object.values(this.elements)) {
      element.classList.remove("selected");
    }

    for (const value of this.tempValues) {
      const element = this.elements[value];
      element.classList.add("selected");
    }
  }

  private toggleItems(values: string[], isHidden: boolean) {
    for (const value of values) {
      const element = this.elements[value];
      const isClosed = element.classList.contains("closed");

      if (isHidden) {
        element.classList.add("hidden");
      } else {
        element.classList.remove("hidden");
      }

      this.toggleItems(this.children[value], isHidden || isClosed);
    }
  }
}

function buildItemDom() {
  const dom = `
  <div class="menu-item">
    <div class="menu-item-checkbox"></div>
    <div class="menu-item-arrow"></div>
    <div class="menu-item-label"></div>
  </div>
  `;

  const document = new DOMParser().parseFromString(dom, "text/html");

  return findChild(document, "body > *");
}

function buildMenuDom() {
  const dom = `
  <div class="menu">
    <div class="menu-header">
        <div class="menu-back-button"></div>
        <div class="caption"></div>
    </div>
    <div class="menu-filter">
        <input class="input" />
    </div>
    <div class="menu-items">
    </div>
    <div class="menu-footer">
        <div class="menu-apply-button">Применить</div>
        <div class="menu-clear-button">Очистить</div>
    </div>
  </div>
  `;

  const document = new DOMParser().parseFromString(dom, "text/html");

  return findChild(document, "body > *");
}

function findChild(element: ParentNode, selector: string) {
  return element.querySelector(selector) as HTMLElement;
}

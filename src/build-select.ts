import { buildHeader } from "./build-header";
import { MenuComponent } from "./build-menu";

const SelectPlaceholder = "Кликните для выбора";

export function buildSelect(selectElement: HTMLSelectElement) {
  selectElement.style.display = "none";
  const title =
    selectElement.attributes.getNamedItem("data-title")?.value || "";
  const data = extractOptions(selectElement);
  const treeContainer = buildContainer(selectElement);
  const headerContainer = buildContainer(selectElement);
  treeContainer.classList.add("hidden");

  const header = buildHeader({
    container: headerContainer,
    caption: title,
    onShow: () => treeContainer
      .requestFullscreen()
      .then(() => treeContainer.classList.remove("hidden")),
  });

  treeContainer.addEventListener("fullscreenchange", () => {
    if (!document.fullscreenElement) {
      treeContainer.classList.add("hidden");
    }
  });

  const menu = new MenuComponent({
    container: treeContainer,
    items: data,
    caption: title,
    onStateChange: (values) => {
      for (const item of data) {
          if (values.some(x => x === item.value)) {
              item.dom.setAttribute("selected", "selected");
          } else {
              item.dom.removeAttribute("selected");
          }
      }
      
      updateHeader(header, data);
    },
    onBack: () => document.exitFullscreen(),
  });

  updateHeader(header, data);
  menu.setState(getSelectedValues(data));
}

function getSelectedValues(data: ExtractedItem[]) {
    const result = [] as string[];

    for (const item of data) {
      if (item.dom.attributes.getNamedItem("selected")) {
        result.push(item.value);
      }
    }

    return result;
}

function updateHeader(header: any, data: ExtractedItem[]) {
  const selectedTitles = [] as string[];

  for (const item of data) {
    if (item.dom.attributes.getNamedItem("selected")) {
      selectedTitles.push(item.label);
    }
  }

  header.setSelectedCount(selectedTitles.length);

  if (selectedTitles.length) {
    header.setValue(selectedTitles.join(", "));
  } else {
    header.setValue(SelectPlaceholder);
  }
}

function extractOptions(selectElement: HTMLSelectElement) {
  const optionElements = selectElement.querySelectorAll("option");
  const result = [] as ExtractedItem[];

  for (const item of Array.from(optionElements)) {
    const levelAttribute = item.attributes.getNamedItem("data-level");
    const valueAttribute = item.attributes.getNamedItem("value");

    if (!valueAttribute) {
      continue;
    }

    result.push({
      value: valueAttribute.value,
      level: levelAttribute ? Number(levelAttribute.value) : 1,
      label: item.innerText,
      dom: item,
    });
  }

  return result;
}

function buildContainer(selectElement: HTMLSelectElement) {
  function insertAfter(referenceNode: HTMLElement, newNode: HTMLElement) {
    referenceNode.parentNode?.insertBefore(newNode, referenceNode.nextSibling);
  }

  const mainDiv = document.createElement("div");
  insertAfter(selectElement, mainDiv);

  return mainDiv;
}

interface ExtractedItem {
  value: string;
  level: number;
  label: string;
  dom: HTMLOptionElement;
}
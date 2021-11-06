export interface HeaderOptions {
  container: HTMLElement;
  caption: string;
  onShow: () => void;
}

export function buildHeader(options: HeaderOptions) {
  const { headerElement, showLinkElement, inputElement } = buildDom(options);

  options.container.appendChild(headerElement);

  return {
    setSelectedCount: (selectedCount: number) => {
      if (selectedCount) {
        headerElement.classList.add("selected");
      } else {
        headerElement.classList.remove("selected");
      }
      showLinkElement.innerText = `Показать Выбранное (${selectedCount})`;
    },
    setValue: (value: string) => {
      inputElement.innerText = value;
    },
  };
}

function buildDom(options: HeaderOptions) {
  const headerElement = document.createElement("div");
  headerElement.classList.add("header");

  const headlineElement = document.createElement("div");
  headlineElement.classList.add("header-headline");

  const captionElement = document.createElement("div");
  captionElement.classList.add("caption");
  captionElement.innerText = options.caption;

  const showLinkElement = document.createElement("div");
  showLinkElement.classList.add("header-show-link");
  showLinkElement.addEventListener("click", () => options.onShow());

  const inputElement = document.createElement("div");
  inputElement.classList.add("input");
  inputElement.addEventListener("click", () => options.onShow());

  headlineElement.appendChild(captionElement);
  headlineElement.appendChild(showLinkElement);
  headerElement.appendChild(headlineElement);
  headerElement.appendChild(inputElement);

  return { headerElement, showLinkElement, inputElement };
}

// FIXME: Remove the meta tag logic; perfectly fine to have everything static and obvious in the index.html

export const setMetaTag = (
  attributeName: string,
  attributeValue: string,
  content: string
) => {
  let element = document.head.querySelector(
    `meta[${attributeName}="${attributeValue}"]`
  );

  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attributeName, attributeValue);
    document.head.appendChild(element);
  }

  element.setAttribute('content', content);
};

export const removeMetaTag = (
  attributeName: string,
  attributeValue: string
) => {
  const element = document.head.querySelector(
    `meta[${attributeName}="${attributeValue}"]`
  );

  if (element) {
    document.head.removeChild(element);
  }
};

export const setLinkTag = (rel: string, href: string) => {
  let element = document.head.querySelector(`link[rel="${rel}"]`);

  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    document.head.appendChild(element);
  }

  element.setAttribute('href', href);
};

// Naive clone implementation
export const clone = <T>(src: T): T => JSON.parse(JSON.stringify(src));

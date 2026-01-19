/**
 * A simple sanitizer to remove script tags and "on" event attributes to prevent basic XSS.
 * NOTE: This is not a replacement for a robust library like DOMPurify, but a basic security measure.
 */
export const sanitizeHTML = (html: string): string => {
    if (!html) return '';
    
    // Create a temporary div to parse the HTML string
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    // Remove script and style tags
    const scripts = tempDiv.querySelectorAll('script, style');
    scripts.forEach(script => script.remove());

    // Remove all "on*" event attributes
    const allElements = tempDiv.getElementsByTagName('*');
    for (let i = 0; i < allElements.length; i++) {
        const element = allElements[i];
        for (let j = 0; j < element.attributes.length; j++) {
            const attr = element.attributes[j];
            if (attr.name.toLowerCase().startsWith('on')) {
                element.removeAttribute(attr.name);
            }
        }
    }
    
    // Return the sanitized HTML
    return tempDiv.innerHTML;
};

export const getLocalizedValidationMessage = (validity, label = "") => {
  const fieldName = String(label).replace(/\*/g, "").trim().toLocaleLowerCase();

  if (validity?.valueMissing) {
    return fieldName ? `Ingresa ${fieldName}.` : "Completa este campo para continuar.";
  }
  if (validity?.typeMismatch && validity?.type === "email") {
    return "Ingresa un correo electrónico válido.";
  }
  if (validity?.typeMismatch && validity?.type === "url") {
    return "Ingresa una dirección web válida.";
  }
  if (validity?.patternMismatch) {
    return fieldName ? `Revisa el formato de ${fieldName}.` : "El formato ingresado no es válido.";
  }
  if (validity?.tooShort) {
    return `Ingresa al menos ${validity.minLength} caracteres.`;
  }
  if (validity?.tooLong) {
    return `Usa máximo ${validity.maxLength} caracteres.`;
  }
  if (validity?.rangeUnderflow) return `El valor debe ser igual o mayor a ${validity.min}.`;
  if (validity?.rangeOverflow) return `El valor debe ser igual o menor a ${validity.max}.`;
  if (validity?.badInput) return "Ingresa un valor válido.";
  return "Revisa el valor ingresado.";
};

export const installLocalizedFormValidation = (documentRef) => {
  const handleInvalid = (event) => {
    const field = event.target;
    if (!(field instanceof documentRef.defaultView.HTMLInputElement) &&
        !(field instanceof documentRef.defaultView.HTMLSelectElement) &&
        !(field instanceof documentRef.defaultView.HTMLTextAreaElement)) return;

    const label = field.labels?.[0]?.textContent ??
      field.closest(".form-group, .entity-field")?.querySelector("label")?.textContent ??
      field.closest("label")?.textContent ??
      field.getAttribute("aria-label") ?? "";
    event.preventDefault();
    field.setCustomValidity("");
    field.setAttribute("aria-invalid", "true");
    let feedback = field.parentElement?.querySelector(":scope > .field-validation-message");
    if (!feedback) {
      feedback = documentRef.createElement("small");
      feedback.className = "field-validation-message";
      feedback.setAttribute("role", "alert");
      field.insertAdjacentElement("afterend", feedback);
    }
    feedback.textContent = getLocalizedValidationMessage(
      {
        valueMissing: field.validity.valueMissing,
        typeMismatch: field.validity.typeMismatch,
        patternMismatch: field.validity.patternMismatch,
        tooShort: field.validity.tooShort,
        tooLong: field.validity.tooLong,
        rangeUnderflow: field.validity.rangeUnderflow,
        rangeOverflow: field.validity.rangeOverflow,
        badInput: field.validity.badInput,
        type: field.type,
        minLength: field.minLength,
        maxLength: field.maxLength,
        min: field.min,
        max: field.max,
      },
      label,
    );
  };

  const clearCustomMessage = (event) => {
    const field = event.target;
    if (field instanceof documentRef.defaultView.HTMLInputElement ||
        field instanceof documentRef.defaultView.HTMLSelectElement ||
        field instanceof documentRef.defaultView.HTMLTextAreaElement) {
      field.setCustomValidity("");
      field.removeAttribute("aria-invalid");
      field.parentElement?.querySelector(":scope > .field-validation-message")?.remove();
    }
  };

  documentRef.addEventListener("invalid", handleInvalid, true);
  documentRef.addEventListener("input", clearCustomMessage, true);
  documentRef.addEventListener("change", clearCustomMessage, true);
  return () => {
    documentRef.removeEventListener("invalid", handleInvalid, true);
    documentRef.removeEventListener("input", clearCustomMessage, true);
    documentRef.removeEventListener("change", clearCustomMessage, true);
  };
};

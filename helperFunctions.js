export function sanitizeInput(input) {
  if (typeof input !== "string") return "";
  return input
    .replace(/[<>]/g, "") // Fjerner < og > (forebygger HTML-tags)
    .replace(/javascript:/gi, "") // Fjerner javascript: links
    .replace(/on\w+=/gi, "") // Fjerner event handlers som onclick=
    .trim(); // Fjerner whitespace
}

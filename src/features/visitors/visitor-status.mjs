export const isVisitorActive = (visitor) => {
  if (visitor?.exitTime) return false;
  if (visitor?.status == null || visitor.status === "") return true;
  return ["active", "1"].includes(String(visitor.status).toLocaleLowerCase());
};

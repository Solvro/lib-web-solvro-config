import { isPackageExists } from "local-pkg";

export const getProjectType = () => {
  const isAdonis = isPackageExists("@adonisjs/core");
  const isNext = isPackageExists("next");

  if (isNext && isAdonis) {
    throw new Error(
      "You can't use both Adonis and Next.js in the same project",
    );
  }

  if (isAdonis) {
    return "adonis";
  }

  if (isNext) {
    return "next";
  }

  return "node";
};

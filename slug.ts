function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .normalize("NFD") // Normalize accented characters
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9\s-]/g, "") // Remove non-alphanumeric characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-"); // Replace multiple hyphens with a single one
}

console.log(slugify("But You’re the Same Age as My Daughter! Chapter 39"))
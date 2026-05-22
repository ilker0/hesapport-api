import { seedRbacDefaults } from "./rbac";

seedRbacDefaults()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => process.exit(0));

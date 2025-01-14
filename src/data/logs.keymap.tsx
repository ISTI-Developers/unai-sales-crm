export const logKeyMap = {
  clients: {
    ids: [1, 5],
    modules: ["clients", "client_contact", "client_mediums", "client_accounts"],
  },
};

export const logModulesMap = (module: string) => {
  switch (module) {
    case "client_mediums":
    case "client_contact":
    case "client_accounts":
      return "clients";
    case "user_accounts":
    case "user_information":
      return "users";
    case "user_roles":
      return "roles";
    case "companies_a":
      return "companies";
    default:
      return module;
  }
};

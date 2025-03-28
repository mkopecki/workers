export type Permission = {
  id: string;
};

const is_registered: Permission = {
  id: "is_registered",
};

const can_access_model = (model_id: string): Permission => ({
  id: `can_access_${model_id}`,
});

const get_ids = (permissions: Permission[]): string[] =>
  permissions.map(p => p.id);

export const permissions = {
  get_ids,

  is_registered,
  can_access_model,
};

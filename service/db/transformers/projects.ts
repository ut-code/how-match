type ProjectDb = {
  id: string;
  name: string;
  description: string | null;
  multipleRoles: number;
  dropTooManyRoles: number;
  closedAt: string | null;
};
type ProjectApp = {
  id: string;
  name: string;
  description: string | null;
  multipleRoles: boolean;
  dropTooManyRoles: boolean;
  closedAt: string | null;
};

export function hydrateProject(project: ProjectDb): ProjectApp {
  return {
    ...project,
    multipleRoles: bfromNum(project.multipleRoles),
    dropTooManyRoles: bfromNum(project.dropTooManyRoles),
  };
}

export function dehydrateProject(project: ProjectApp): ProjectDb {
  return {
    ...project,
    multipleRoles: btoNum(project.multipleRoles),
    dropTooManyRoles: btoNum(project.dropTooManyRoles),
  };
}

export function dehydratePartialProject(
  project: Partial<ProjectApp>,
): Partial<ProjectDb> {
  return {
    ...project,
    multipleRoles: btoNumOptional(project.multipleRoles),
    dropTooManyRoles: btoNumOptional(project.dropTooManyRoles),
  };
}

export function btoNum(value: boolean) {
  return value ? 1 : 0;
}
export function bfromNum(value: number) {
  return value === 1;
}
export function btoNumOptional(value: boolean | undefined) {
  if (value === true) return 1;
  if (value === false) return 0;
  if (value === undefined) return undefined;
}
export function bfromNumOptional(value: number | undefined) {
  if (value === 1) return true;
  if (value === 0) return false;
  if (value === undefined) return undefined;
  // undefined behavior: I can do whatever I want
  // for example I return false here because I feel like it
  console.warn("fromZeroOneOptional: unexpected value: ", value);
  return false;
}

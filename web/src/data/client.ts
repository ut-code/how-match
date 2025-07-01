import { browser } from "$app/environment";
import { error } from "@sveltejs/kit";
import { hc } from "hono/client";
import type { App } from "service";
import type {
  InsertPreference,
  InsertProject,
  InsertRole,
  Ratings,
  SelectRole,
} from "share/schema";

const baseUrl = import.meta.env.DEV ? "http://localhost:3000" : "";
console.log(`[log] hono/client: baseUrl = ${baseUrl}`);

export type HonoClient = ReturnType<typeof hc<App>>["api"];
export type Fetch = typeof fetch;

export class Client {
  private client: HonoClient;

  constructor(fetch: Fetch) {
    this.client = hc<App>(baseUrl, {
      fetch,
      init: {
        credentials: browser ? "include" : undefined,
      },
    }).api;
  }

  async getProject(projectId: string) {
    const res = await this.client.projects[":projectId"].$get({
      param: { projectId },
    });
    if (!res.ok) error(res.status, await res.text());
    return await res.json();
  }

  async getRoles(projectId: string) {
    const res = await this.client.projects[":projectId"].roles.$get({
      param: {
        projectId,
      },
    });
    if (!res.ok) badStatus(res);
    return await res.json();
  }

  async getParticipants(projectId: string) {
    const res = await this.client.projects[":projectId"].participants.$get({
      param: { projectId },
    });
    if (!res.ok) badStatus(res);
    return await res.json();
  }
  async getAdmins(projectId: string) {
    const res = await this.client.projects[":projectId"].admins.$get({
      param: { projectId },
    });
    if (!res.ok) badStatus(res);
    return await res.json();
  }

  async getPreviousSubmission(projectId: string) {
    const res = await this.client.projects[":projectId"].preferences.mine.$get({
      param: { projectId },
    });
    return res.ok ? await res.json() : undefined;
  }
  async getAllPreferences(projectId: string) {
    const res = await this.client.projects[":projectId"].preferences.all.$get({
      param: { projectId },
    });
    return res.ok ? await res.json() : undefined;
  }

  async createProject(projectData: InsertProject) {
    const res = await this.client.projects.$post({
      json: projectData,
    });
    if (!res.ok) badStatus(res);
    return await res.json();
  }

  async updateProject(
    projectId: string,
    updates: {
      name?: string;
      description?: string | null;
      dropTooManyRoles?: boolean;
      multipleRoles?: boolean;
    },
  ) {
    const res = await this.client.projects[":projectId"].$patch({
      param: { projectId },
      json: { project: updates },
    });
    if (!res.ok) {
      throw new Error(
        `Got response status ${res.status} with text ${await res.text()}`,
      );
    }
    return await res.json();
  }

  async deleteProject(projectId: string) {
    const res = await this.client.projects[":projectId"].$delete({
      param: { projectId },
    });
    if (!res.ok) badStatus(res);
    return await res.json();
  }

  async finalizeProject(projectId: string) {
    const res = await this.client.projects[":projectId"].finalize.$put({
      param: { projectId },
    });
    if (!res.ok) badStatus(res);
    return await res.json();
  }

  async reopenProject(projectId: string) {
    const res = await this.client.projects[":projectId"].reopen.$put({
      param: { projectId },
    });
    if (!res.ok) badStatus(res);
    return await res.json();
  }

  async submit(
    projectId: string,
    preference: InsertPreference,
    ratings: Ratings,
  ) {
    const res = await this.client.projects[":projectId"].preferences.$put({
      json: { preference, ratings },
      param: { projectId },
    });
    if (!res.ok) {
      throw new Error(
        `Failed to submit: got ${res.status} with text ${await res.text()}`,
      );
    }
    return await res.json();
  }

  async updateRoles(
    projectId: string,
    request: {
      create: InsertRole[];
      update: SelectRole[];
      delete: string[];
    },
  ) {
    const resp = await this.client.projects[":projectId"].$patch({
      param: { projectId },
      json: { roles: request },
    });
    if (!resp.ok) badStatus(resp);
  }

  async getResult(projectId: string) {
    const res = await this.client.projects[":projectId"].result.$get({
      param: { projectId },
    });
    if (!res.ok) badStatus(res);
    return res.json();
  }

  async getMyProjects(options?: { signal: AbortSignal }) {
    const res = await this.client.projects.mine.$get(options);
    if (!res.ok) {
      throw new Error(
        `Failed to get my projects: got ${res.status} with text ${await res.text()}`,
      );
    }
    return await res.json();
  }
}

async function badStatus(res: Response) {
  error(
    res.status,
    `[client.ts] bad status: got ${res.status} with text ${await res.text()}`,
  );
}

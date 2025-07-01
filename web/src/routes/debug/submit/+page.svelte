<script lang="ts">
  import type { SelectProject, SelectRole } from "share/schema";
  import { toast } from "~/globals.svelte.ts";
  import Page from "~/pages/submit/page.svelte";

  const mockProject: SelectProject = {
    id: "debug-project",
    name: "Debug Project",
    description: "This is a debug project for testing the submit page",
    multipleRoles: true,
    dropTooManyRoles: true,
    closedAt: null,
  };

  const mockRoles: SelectRole[] = [
    {
      id: "1",
      name: "Frontend Developer",
      min: 1,
      max: 1,
      projectId: "debug-project",
    },
    {
      id: "2",
      name: "Backend Developer",
      min: 1,
      max: 1,
      projectId: "debug-project",
    },
    { id: "3", name: "Designer", min: 1, max: 1, projectId: "debug-project" },
    {
      id: "4",
      name: "Project Manager",
      min: 1,
      max: 1,
      projectId: "debug-project",
    },
  ];

  const mockPrevData = {
    name: "Debug User",
    rolesCount: 2,
    ratings: {
      "1": 5,
      "2": 4,
      "3": 3,
      "4": 2,
    },
  };

  let usePrevData = $state(true);
  let simulateError = $state(false);
  let simulateClosedProject = $state(false);
  let currentProject = $derived(
    simulateClosedProject
      ? { ...mockProject, closedAt: new Date(Date.now() - 1000).toISOString() }
      : mockProject,
  );

  async function handleSubmit({
    participantName,
    rolesCount,
    ratings,
  }: {
    participantName: string;
    rolesCount: number;
    ratings: Record<string, number>;
  }) {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (simulateError) {
      throw new Error("Simulated error");
    }

    console.log("Debug: Submitting preference", {
      participantName,
      rolesCount,
      ratings,
    });

    toast.push({
      message: "デバッグ: 希望の提出が完了しました",
      kind: "success",
    });
  }
</script>

<div class="p-4">
  <div class="bg-base-200 mb-6 rounded-lg p-4">
    <h1 class="mb-4 text-2xl font-bold">Submit Page Debug Menu</h1>

    <div class="mb-4 flex flex-wrap gap-4">
      <label class="label cursor-pointer">
        <span class="label-text mr-2">Mock Previous Submission</span>
        <input type="checkbox" class="checkbox" bind:checked={usePrevData} />
      </label>

      <label class="label cursor-pointer">
        <span class="label-text mr-2">Simulate Error</span>
        <input type="checkbox" class="checkbox" bind:checked={simulateError} />
      </label>

      <label class="label cursor-pointer">
        <span class="label-text mr-2">Simulate Closed Project</span>
        <input
          type="checkbox"
          class="checkbox"
          bind:checked={simulateClosedProject}
        />
      </label>
    </div>

    <div class="flex gap-2">
      <button
        class="btn btn-info btn-sm"
        onclick={() => console.log({ currentProject, mockRoles, mockPrevData })}
      >
        Log Mock Data
      </button>
    </div>
  </div>

  <Page
    project={currentProject}
    roles={mockRoles}
    prevData={usePrevData ? mockPrevData : null}
    onsubmit={handleSubmit}
  />
</div>

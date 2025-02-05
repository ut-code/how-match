import { db } from "./db/client";
import { participant } from "./db/schema";

async function InsertParticipant(participant_id: number, account_id: number, project_id: number, is_admin: boolean) {
  await db.insert(participant).values([
    {
      participant_id: participant_id,
      account_id: account_id,
      project_id: project_id,
      is_admin: Number(is_admin),
    },
  ]);
  console.log("データを追加しました");
}


import { Member, Profile, Server } from "@prisma/client";

export type ServerWithMembersWithProfiles = Server & {
  members: (Member & { profile: Profile })[];
};

// members: ({
//   id: string;
//   role: $Enums.MemberRole;
//   createdAt: Date;
//   updatedAt: Date;
//   profileId: string;
//   serverId: string;
// } & {
//   profile: Profile;
// })[]
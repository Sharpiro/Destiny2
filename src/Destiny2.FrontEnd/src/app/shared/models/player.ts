export class Player {
    public membershipType: MembershipType;
    public membershipId: string;
    public displayName: string;

    public constructor(init?: Partial<Player>) {
        Object.assign(this, init);
    }
}

export enum MembershipType { PS, XBOX, PC }
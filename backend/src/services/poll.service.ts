import { PrismaClient } from "@prisma/client";
import { DataLog, IPoll } from "../interface";

export class PollService {
    private prisma: PrismaClient;

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }

    /**
     * Get all polls with pagination
     * @param page - number
     * @param pageSize - number
     * @param search - string
     * @param logs - boolean
     */
    public async getPolls(page: number = 1, pageSize: number = 10, search?: string, logs?: boolean) {
        try {
            const skip = (page - 1) * pageSize;

            const whereCondition = {
                deletedAt: null,
                ...(search && { name: { contains: search, mode: "insensitive" } }),
            };

            const [polls, totalCount] = await Promise.all([
                this.prisma.poll.findMany({
                    where: whereCondition,
                    skip,
                    take: pageSize,
                    orderBy: { createdAt: "desc" },
                }),
                this.prisma.poll.count({ where: whereCondition }),
            ]);

            return {
                polls: this.formatPolls(polls, logs),
                totalCount,
            };
        } catch (error) {
            console.error("[ERROR] getPolls:", error);
            throw new Error("Failed to fetch polls");
        }
    }

    /**
     * Get all polls where user is a participant or guest
     */
    public async myPolls(userId: string, isGuest: boolean, logs?: boolean): Promise<{ polls: IPoll[] }> {
        try {
            const event = await this.prisma.event.findFirst({
                where: isGuest
                    ? { guests: { some: { id: userId, deletedAt: null } } }
                    : { whitelist: { some: { userId: userId, deletedAt: null } } },
            });

            if (!event) return { polls: [] };

            const rawPolls = await this.prisma.poll.findMany({
                where: { eventId: event.id, deletedAt: null, isVoteEnd: false },
                include: { event: true },
            });

            return { polls: this.formatPolls(rawPolls, logs) };
        } catch (error) {
            console.error("[ERROR] myPolls:", error);
            throw new Error("Failed to fetch polls");
        }
    }

    /**
     * Get all polls where user has voted
     */
    public async myVotedPolls(userId: string, isGuest: boolean, logs?: boolean): Promise<{ polls: IPoll[] }> {
        try {
            const rawPolls = await this.prisma.poll.findMany({
                where: {
                    deletedAt: null,
                    isVoteEnd: true,
                    votes: { some: { userId: userId, deletedAt: null } },
                },
                include: { votes: true, event: true },
            });

            return { polls: this.formatPolls(rawPolls, logs) };
        } catch (error) {
            console.error("[ERROR] myVotedPolls:", error);
            throw new Error("Failed to fetch voted polls");
        }
    }

    /**
     * Get all public polls
     */
    public async publicPolls(page: number = 1, pageSize?: number, search?: string, logs?: boolean) {
        try {
            const skip = pageSize ? (page - 1) * pageSize : undefined;
            const take = pageSize || undefined;

            const whereCondition = {
                deletedAt: null,
                isPublic: true,
                isVoteEnd: false,
                ...(search && { name: { contains: search, mode: "insensitive" } }),
            };

            const polls = await this.prisma.poll.findMany({
                where: whereCondition,
                skip,
                take,
                orderBy: { createdAt: "desc" },
                include: { event: true },
            });

            return this.formatPolls(polls, logs);
        } catch (error) {
            console.error("[ERROR] publicPolls:", error);
            throw new Error("Failed to fetch public polls");
        }
    }

    /**
     * Get a single poll by ID
     */
    public async getPoll(pollId: string, userId: string, isGuest: boolean) {
        try {
            const poll = await this.prisma.poll.findFirst({
                where: { id: pollId, deletedAt: null },
                include: {
                    options: true,
                    event: {
                        include: {
                            whitelist: isGuest ? undefined : { where: { userId: userId, deletedAt: null }},
                            guests: isGuest ? { where: { id: userId, deletedAt: null } } : undefined,
                        },
                    },
                    voteRestrict: true,
                },
            });

            if (!poll) {
                console.warn(`[WARN] Poll with ID ${pollId} not found.`);
                return null;
            }

            return this.formatPoll(poll);
        } catch (error) {
            console.error("[ERROR] getPoll:", error);
            throw new Error("Failed to fetch poll");
        }
    }

    /**
     * Check if user can vote
     */
    public async userCanVote(pollId: string, userId: string, isGuest: boolean): Promise<boolean> {
        try {
            const canVote = await this.prisma.event.findFirst({
                where: {
                    polls: { some: { id: pollId, isVoteEnd: false } },
                    ...(isGuest
                        ? { guests: { some: { id: userId, deletedAt: null } } }
                        : { whitelist: { some: { userId: userId, deletedAt: null } } }),
                },
            });

            return !!canVote;
        } catch (error) {
            console.error("[ERROR] userCanVote:", error);
            throw new Error("Failed to check user vote");
        }
    }

    /**
     * 🛠 Helper function to format poll results
     */
    private formatPolls(polls: any[], logs?: boolean): IPoll[] {
        return polls.map(poll => this.formatPoll(poll, logs));
    }

    private formatPoll(poll: any, logs?: boolean): IPoll {
        return {
            ...poll,
            description: poll.description ?? undefined,
            banner: poll.banner ?? undefined,
            dataLogs: logs ? (poll.dataLogs as unknown as DataLog[] | null) ?? undefined : undefined,
            options: poll.options?.map((option: { description: string; banner: string; }) => ({
                ...option,
                description: option.description ?? undefined,
                banner: option.banner ?? undefined,
            })) ?? [],
            event: poll.event
                ? {
                      ...poll.event,
                      description: poll.event.description ?? undefined,
                      dataLogs: (poll.event.dataLogs as unknown as DataLog[] | null) ?? undefined,
                  }
                : undefined,
        };
    }
}

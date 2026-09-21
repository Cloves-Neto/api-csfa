export interface IDashboardStatsProps {
    posts: {
        total: number;
        published: number;
        drafts: number;
    };
    events: {
        total: number;
        confirmed: number;
        upcoming: number;
    };
    banners: {
        total: number;
        active: number;
        inactive: number;
    };
    users: {
        total: number;
        active: number;
        blocked: number;
    };
    submissions: {
        total: number;
        pending: number;
    };
}

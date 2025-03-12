import type { Config, Context } from "@netlify/edge-functions";
import { env } from "process";
import { GitHubStarPayload } from "../../interfaces/github-star.interface.ts";
import { GitHubIssuePayload } from "../../interfaces/github-issue.interface.ts";

const issueActions = [
    'opened',
    'closed',
    'reopened',
];

const notify = async ( message: string ) => {
        
    const body = {
        content: message
    }

    const res = await fetch( env.DISCORD_WEBHOOK_URL ?? '', {
        method: 'POST',
        headers: { 'Content-Type' : 'application/json' },
        body: JSON.stringify(body),
    });

    if( !res.ok ){
        console.log('could not send message to discord');
        return false;
    }

    return true;
}

const onStar = (payload: GitHubStarPayload): string => {

    const { action, repository, sender, starred_at } = payload;
    return `User ${sender.login} ${action} star on ${repository.full_name}`;
}

const onIssue = (payload: GitHubIssuePayload): string => {

    const { action, issue } = payload;

    if (issueActions.includes(action)) {
        return `the Issue '${issue.title}' was ${action} by ${issue.user.login}`;
    }

    return `'${action}' issue event is unknown`;
}

export default async (req: Request, context: Context) => {

    const githubEvent = req.headers.get('X-GitHub-Event') ?? 'uknown';
    const payload = await req.json();

    console.log(payload)

    let message: string;
    
    switch (githubEvent) {

        case 'star':
            message = onStar(payload);
            break;

        case 'issues': 
            message = onIssue(payload);
            break;

        default:
            message = `event ${githubEvent} unknown`;

    }

    const wasNotified = await notify( message );

    if(!wasNotified){
        return new Response(JSON.stringify({ message: 'internal server error'}), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    } 

    return new Response(JSON.stringify({ message: 'done'}), {
        status: 200,
        headers: { "Content-Type": "application/json" },
    });
};

export const config: Config = {
  path: "/discord-github",
};

import type { Area, Decision, Mood, Result, Verdict } from './types';

/**
 * Maya's sample journal: a fictional person whose patterns are real
 * consequences of these entries (nothing in the stats is hard-coded).
 * Designed to show: overconfident on money, underconfident on career,
 * excited and rushed decisions go worst, calm goes best, and anxiety
 * makes her underestimate herself.
 */

type Row = {
  id: string;
  /** Days before "now" the decision was logged. */
  ago: number;
  /** Days between logging and the check-back date. */
  every: number;
  area: Area;
  mood: Mood;
  confidence: number;
  title: string;
  expected: string;
  why?: string;
  outcome?: { verdict: Verdict; result: Result; actual: string; lag?: number };
};

const ROWS: Row[] = [
  // ── Money: feels ~82% sure, right ~45% of the time ──────────────────────
  {
    id: 's01', ago: 236, every: 30, area: 'money', mood: 'excited', confidence: 90,
    title: 'Buy more of a hot AI stock after a 40% run',
    expected: 'It keeps climbing and I’m up another 20% within a month.',
    why: 'Everyone at work is talking about it and the earnings call sounded great.',
    outcome: { verdict: 'no', result: 'bad', actual: 'It dropped 18% the week after I bought. Sold at a loss.' },
  },
  {
    id: 's02', ago: 221, every: 90, area: 'money', mood: 'confident', confidence: 80,
    title: 'Lend my cousin $2,000 for his food truck',
    expected: 'He pays it back in full within three months.',
    outcome: { verdict: 'partly', result: 'mixed', actual: 'Got $1,200 back so far. The rest is “coming soon.”' },
  },
  {
    id: 's03', ago: 205, every: 90, area: 'money', mood: 'excited', confidence: 85,
    title: 'Get the new phone on a payment plan',
    expected: 'I’ll pay it off early in three months, no interest.',
    outcome: { verdict: 'no', result: 'bad', actual: 'Still paying it off. Paid $140 in interest.' },
  },
  {
    id: 's04', ago: 190, every: 30, area: 'money', mood: 'rushed', confidence: 85,
    title: 'Sell my index funds before the “coming dip”',
    expected: 'The market drops and I buy back in 10% cheaper.',
    why: 'Saw three videos saying a crash was coming.',
    outcome: { verdict: 'no', result: 'bad', actual: 'Market went up 6%. Bought back in higher.' },
  },
  {
    id: 's05', ago: 176, every: 30, area: 'money', mood: 'calm', confidence: 80,
    title: 'Move my savings to a high-yield account',
    expected: 'I earn noticeably more interest with no hassle.',
    outcome: { verdict: 'yes', result: 'good', actual: 'Took 20 minutes. Earning about $35 a month more.' },
  },
  {
    id: 's06', ago: 160, every: 30, area: 'money', mood: 'calm', confidence: 75,
    title: 'Cancel three subscriptions',
    expected: 'I save $60 a month and don’t miss any of them.',
    outcome: { verdict: 'partly', result: 'good', actual: 'Saved $42. Re-subscribed to one after two weeks.' },
  },
  {
    id: 's07', ago: 140, every: 30, area: 'money', mood: 'excited', confidence: 90,
    title: 'Put 10% of my savings into crypto',
    expected: 'It doubles by the end of the year.',
    outcome: { verdict: 'no', result: 'bad', actual: 'Down 35%. Checking it every day is stressful.' },
  },
  {
    id: 's08', ago: 128, every: 90, area: 'money', mood: 'confident', confidence: 85,
    title: 'Pre-pay a year of gym to save 20%',
    expected: 'I go three times a week, so it pays for itself.',
    outcome: { verdict: 'no', result: 'mixed', actual: 'Went 11 times in three months.' },
  },
  {
    id: 's09', ago: 112, every: 30, area: 'money', mood: 'anxious', confidence: 60,
    title: 'Call to negotiate my internet bill',
    expected: 'They knock at least $15 off.',
    outcome: { verdict: 'yes', result: 'good', actual: '$25 off for a year. The call took 12 minutes.' },
  },
  {
    id: 's10', ago: 96, every: 7, area: 'money', mood: 'rushed', confidence: 90,
    title: 'Buy concert tickets from a resale site',
    expected: 'Fair price, legit tickets, great night.',
    outcome: { verdict: 'partly', result: 'mixed', actual: 'Tickets worked, but I paid double face value.' },
  },
  {
    id: 's11', ago: 84, every: 30, area: 'money', mood: 'calm', confidence: 80,
    title: 'Refinance my car loan',
    expected: 'A lower rate saves me about $50 a month.',
    outcome: { verdict: 'yes', result: 'good', actual: 'Saving $48 a month.' },
  },

  // ── Career: feels ~61% sure, right ~81% of the time ─────────────────────
  {
    id: 's12', ago: 230, every: 30, area: 'career', mood: 'anxious', confidence: 55,
    title: 'Ask my manager for a raise',
    expected: 'I get at least a 5% raise this cycle.',
    why: 'I’ve taken on two extra projects since my last review.',
    outcome: { verdict: 'yes', result: 'good', actual: 'Got 8%, plus a title bump.' },
  },
  {
    id: 's13', ago: 200, every: 90, area: 'career', mood: 'anxious', confidence: 50,
    title: 'Apply for the senior analyst role',
    expected: 'I get an interview.',
    outcome: { verdict: 'yes', result: 'good', actual: 'Interviewed and got the role.' },
  },
  {
    id: 's14', ago: 168, every: 7, area: 'career', mood: 'anxious', confidence: 60,
    title: 'Speak up at the all-hands about the roadmap',
    expected: 'Leadership takes the question seriously.',
    outcome: { verdict: 'yes', result: 'good', actual: 'The VP followed up with me the next day.' },
  },
  {
    id: 's15', ago: 150, every: 30, area: 'career', mood: 'calm', confidence: 70,
    title: 'Take the evening SQL course',
    expected: 'I finish it and use SQL at work within a month.',
    outcome: { verdict: 'yes', result: 'good', actual: 'Finished. Built my first dashboard query in week three.' },
  },
  {
    id: 's16', ago: 134, every: 90, area: 'career', mood: 'calm', confidence: 65,
    title: 'Turn down the startup offer',
    expected: 'I won’t regret staying for the next three months.',
    outcome: { verdict: 'yes', result: 'good', actual: 'No regrets. The startup had layoffs in month two.' },
  },
  {
    id: 's17', ago: 108, every: 7, area: 'career', mood: 'anxious', confidence: 55,
    title: 'Volunteer to lead the client pitch',
    expected: 'The pitch goes well and the client signs.',
    outcome: { verdict: 'partly', result: 'mixed', actual: 'The pitch went great. The client is still deciding.' },
  },
  {
    id: 's18', ago: 90, every: 30, area: 'career', mood: 'anxious', confidence: 60,
    title: 'Ask for a four-day in-office schedule',
    expected: 'They approve it.',
    outcome: { verdict: 'yes', result: 'good', actual: 'Approved in one conversation.' },
  },
  {
    id: 's19', ago: 70, every: 30, area: 'career', mood: 'tired', confidence: 70,
    title: 'Switch to the analytics team',
    expected: 'The work is more interesting and the hours are the same.',
    outcome: { verdict: 'no', result: 'mixed', actual: 'More interesting, but the hours are a lot longer.' },
  },

  // ── Health ───────────────────────────────────────────────────────────────
  {
    id: 's20', ago: 214, every: 30, area: 'health', mood: 'excited', confidence: 85,
    title: 'Start running three times a week',
    expected: 'I stick with it for a month.',
    outcome: { verdict: 'no', result: 'bad', actual: 'Stopped after two weeks. Shin splints.' },
  },
  {
    id: 's21', ago: 182, every: 30, area: 'health', mood: 'calm', confidence: 70,
    title: 'See a doctor about my knee instead of waiting',
    expected: 'It’s minor and physical therapy fixes it.',
    outcome: { verdict: 'yes', result: 'good', actual: 'Six weeks of PT. Pain-free now.' },
  },
  {
    id: 's22', ago: 146, every: 30, area: 'health', mood: 'calm', confidence: 70,
    title: 'No caffeine after 2pm',
    expected: 'I fall asleep faster.',
    outcome: { verdict: 'yes', result: 'good', actual: 'Asleep about 30 minutes sooner most nights.' },
  },
  {
    id: 's23', ago: 120, every: 90, area: 'health', mood: 'excited', confidence: 80,
    title: 'Sign up for a half marathon',
    expected: 'I train properly and finish under 2:15.',
    outcome: { verdict: 'partly', result: 'mixed', actual: 'Finished in 2:31. Training was patchy.' },
  },
  {
    id: 's24', ago: 76, every: 30, area: 'health', mood: 'tired', confidence: 65,
    title: 'In bed by 11 every night for a month',
    expected: 'I manage at least 25 of 30 nights.',
    outcome: { verdict: 'partly', result: 'mixed', actual: '18 of 30 nights.' },
  },

  // ── Relationships ───────────────────────────────────────────────────────
  {
    id: 's25', ago: 196, every: 7, area: 'relationships', mood: 'anxious', confidence: 60,
    title: 'Tell my roommate the late-night noise is a problem',
    expected: 'It’s awkward for a day, then it gets better.',
    outcome: { verdict: 'yes', result: 'good', actual: 'She apologized. It’s been quiet since.' },
  },
  {
    id: 's26', ago: 158, every: 30, area: 'relationships', mood: 'excited', confidence: 85,
    title: 'Plan a surprise weekend away for Sam',
    expected: 'Sam loves it and we both relax.',
    outcome: { verdict: 'yes', result: 'good', actual: 'Best weekend of the year.' },
  },
  {
    id: 's27', ago: 124, every: 30, area: 'relationships', mood: 'calm', confidence: 70,
    title: 'Reach out to an old college friend',
    expected: 'We meet up within a month.',
    outcome: { verdict: 'yes', result: 'good', actual: 'Dinner two weeks later. Now we talk monthly.' },
  },
  {
    id: 's28', ago: 100, every: 30, area: 'relationships', mood: 'rushed', confidence: 75,
    title: 'Skip the family reunion',
    expected: 'Nobody minds much.',
    outcome: { verdict: 'no', result: 'bad', actual: 'My mom was hurt. Took weeks to smooth over.' },
  },

  // ── Home ─────────────────────────────────────────────────────────────────
  {
    id: 's29', ago: 186, every: 30, area: 'home', mood: 'confident', confidence: 80,
    title: 'Repaint the bedroom myself',
    expected: 'One weekend, looks professional.',
    outcome: { verdict: 'yes', result: 'good', actual: 'Took a weekend and a half. Looks great.' },
  },
  {
    id: 's30', ago: 138, every: 30, area: 'home', mood: 'rushed', confidence: 85,
    title: 'Buy a couch online without seeing it',
    expected: 'It’s comfortable and fits the space.',
    outcome: { verdict: 'no', result: 'bad', actual: 'Too firm and the wrong blue. Return fee was $180.' },
  },
  {
    id: 's31', ago: 104, every: 30, area: 'home', mood: 'calm', confidence: 70,
    title: 'Sign a 12-month lease instead of 6',
    expected: 'The lower rent is worth being locked in.',
    outcome: { verdict: 'yes', result: 'good', actual: 'Saving $110 a month, and no plans to move.' },
  },

  // ── Still open ───────────────────────────────────────────────────────────
  {
    id: 's32', ago: 35, every: 30, area: 'career', mood: 'anxious', confidence: 60,
    title: 'Accept the offer from Northwind',
    expected: 'I settle in within a month and like the team.',
    why: '15% more pay, but I’d be leaving a team I like.',
  },
  {
    id: 's33', ago: 33, every: 30, area: 'money', mood: 'excited', confidence: 85,
    title: 'Buy a used EV instead of leasing',
    expected: 'Lower monthly costs and no surprise repairs in the first month.',
    why: 'Gas savings alone should cover the difference.',
  },
  {
    id: 's34', ago: 10, every: 30, area: 'home', mood: 'calm', confidence: 70,
    title: 'Move to a cheaper apartment across town',
    expected: 'The longer commute is worth $300 a month.',
  },
  {
    id: 's35', ago: 5, every: 90, area: 'health', mood: 'anxious', confidence: 65,
    title: 'Start seeing a therapist every other week',
    expected: 'I feel less overwhelmed at work by spring.',
  },
];

const DAY = 86_400_000;

export const buildSampleJournal = (now: Date): Decision[] =>
  ROWS.map((r) => {
    const created = new Date(now.getTime() - r.ago * DAY);
    // Log sample decisions at a plausible time of day rather than "now".
    created.setHours(9 + (Number(r.id.slice(1)) % 10), 15, 0, 0);
    const review = new Date(created.getTime() + r.every * DAY);
    const d: Decision = {
      id: r.id,
      title: r.title,
      expected: r.expected,
      ...(r.why ? { why: r.why } : {}),
      area: r.area,
      mood: r.mood,
      confidence: r.confidence,
      createdAt: created.toISOString(),
      reviewAt: review.toISOString(),
    };
    if (r.outcome) {
      const recorded = new Date(Math.min(review.getTime() + (r.outcome.lag ?? 2) * DAY, now.getTime()));
      d.outcome = {
        actual: r.outcome.actual,
        verdict: r.outcome.verdict,
        result: r.outcome.result,
        recordedAt: recorded.toISOString(),
      };
    }
    return d;
  });

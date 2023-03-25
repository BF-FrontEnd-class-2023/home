export const learner = (
  { modules = {}, env = {}, org = {} },
  { name = '', user = '', homePage = '' },
) => {
  const repoURL = `https://github.com/${env.user}/${env.repo}`;

  // --- scoped utilities for generating links ---

  const projectSearch = (label = '', linkText = label, role = 'assignee') =>
    `[${linkText}](${repoURL}/projects/${modules.board}?card_filter_query=${role}%3A${user}+label%3A${label})`;

  const issuesSearch = (label = [], linkText = label, role = 'assignee') =>
    `[${linkText}](${repoURL}/issues/?q=${role}%3A${user}+${
      Array.isArray(label)
        ? label.map((l) => `label%3A${l}`).join('+')
        : `label%3A${label}`
    })`;

  const aList = (...rows) =>
    rows
      .filter((row) => row.length > 0)
      .map((row) => row.join(' \\| '))
      .join('<br>');

  // --- build the section ---

  const header = `<h3 id="${user}">${name}</h3>`;

  const avatar = `<img src="./${env.assetsPath.join(
    '/',
  )}/avatars/${user}.png" height="200px" width="200px" alt="${user} avatar" />`;

  const discussionLinks = org.forum
    ? []
    : [
        `[help wanted](${repoURL}/discussions/categories/help-wanted?discussions_q=author%3A${user}+category%3Ahelp-wanted+is:unanswered)`,
        `[questions](${repoURL}/discussions/categories/question?discussions_q=author%3A${user}+category%3AQ%26A+is:unanswered)`,
        `[all discussions](${repoURL}/discussions/categories/question?discussions_q=includes%3A${user})`,
      ];
  const selfLinks = [
    `[${user}](https://github.com/${user})`,
    `[home page](${homePage || `https://${user}.github.io`})`,
    `[bio](./student-bios/${user}.md)`,
  ];
  const classLinks = [
    issuesSearch('check-in', 'check-ins'),
    projectSearch('deliverable', 'deliverables'),
    // issuesSearch('roll-call', 'roll-calls', 'commenter'),
    issuesSearch(['retro', 'check-in'], 'retros'),
  ];
  const issuesLinks = [
    `[opened](${repoURL}/issues?q=author%3A${user})`,
    `[assigned](${repoURL}/issues?q=assignee%3A${user})`,
    `[commented](${repoURL}/issues?q=commenter%3A${user})`,
    `[mentioned](${repoURL}/issues?q=mentions%3A${user})`,
  ];

  const linksList = aList(selfLinks, discussionLinks, classLinks, issuesLinks);

  const activity = `![${user} github activity](https://ghchart.rshah.org/${user})`;

  const stats = `![${user} github stats](https://github-readme-stats.vercel.app/api?username=${user}&show_icons=true&theme=default&hide_title=true&hide_rank=true)`;

  return `

| ${avatar} | ${header}<br>${linksList} |
| --------- | ------------ |

<details>
<summary>${name}'s github stats</summary>
<br>

${activity}

${stats}

</details>
<hr style="width:60%;align:center">
`;
};

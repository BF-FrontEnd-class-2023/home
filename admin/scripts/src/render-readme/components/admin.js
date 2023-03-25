export const admin = (
  { env = {}, org = {} },
  { name = '', user = '', homePage = '' },
) => {
  const repoURL = `https://github.com/${env.user}/${env.repo}`;

  // --- scoped utilities for generating links ---

  const aList = (...rows) => rows.map((row) => row.join(' \\| ')).join('<br>');

  // --- build the section ---

  const header = `<h3 id="${user || name}">${name}</h3>`;

  const avatar = `<img src="./${env.assetsPath.join(
    '/',
  )}/avatars/${user}.png" height="200px" width="200px" alt="${user} avatar" />`;

  const selfLinks = [`[${user}](https://github.com/${user})`];
  if (homePage) {
    selfLinks.push(`[home page](${homePage})`);
  }
  if (!org.forum) {
    selfLinks.push(
      `<a href="${repoURL}/discussions?discussions_q=involves%3A${user}">discussions</a>`,
    );
  }

  const issuesLinks = [
    `[opened](${repoURL}/issues?q=author%3A${user})`,
    `[assigned](${repoURL}/issues?q=assignee%3A${user})`,
    `[commented](${repoURL}/issues?q=commenter%3A${user})`,
    `[mentioned](${repoURL}/issues?q=mentions%3A${user})`,
  ];

  const linksList = aList(selfLinks, issuesLinks);

  return `

${
  user
    ? `| ${avatar} | ${header} <br>${linksList} |
| --------- | ------------ |`
    : header
}

`;
};
